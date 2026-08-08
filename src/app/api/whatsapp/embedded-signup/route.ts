import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/whatsapp/encryption'
import { verifyPhoneNumber } from '@/lib/whatsapp/meta-api'

const META_API_VERSION = process.env.META_GRAPH_API_VERSION?.trim() || 'v25.0'
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

type PhoneRow = {
  id: string
  display_phone_number?: string
  verified_name?: string
  quality_rating?: string
}

type MetaTokenResponse = {
  access_token?: string
  token_type?: string
  error?: { message?: string }
}

type MetaPhonesResponse = {
  data?: PhoneRow[]
  error?: { message?: string }
}

async function metaError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } }
    return body.error?.message || fallback
  } catch {
    return fallback
  }
}

/**
 * POST /api/whatsapp/embedded-signup
 *
 * Completes Meta Embedded Signup on the server:
 *  1. exchanges the short-lived authorization code without exposing App Secret,
 *  2. subscribes the connected WABA to this Meta app,
 *  3. resolves the connected phone number,
 *  4. verifies it against Graph API,
 *  5. encrypts the token and stores the connection for the authenticated CRM user.
 *
 * Coexistence is selected by the client through Meta's
 * `featureType: whatsapp_business_app_onboarding` flow. Availability still
 * depends on the business/number being eligible in Meta.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        code?: unknown
        waba_id?: unknown
        phone_number_id?: unknown
        connection_mode?: unknown
        session_event?: unknown
      }
    | null

  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const wabaId = typeof body.waba_id === 'string' ? body.waba_id.trim() : ''
  const requestedPhoneId =
    typeof body.phone_number_id === 'string' ? body.phone_number_id.trim() : ''
  const connectionMode = body.connection_mode === 'coexistence' ? 'coexistence' : 'cloud_api'
  const sessionEvent = typeof body.session_event === 'string' ? body.session_event : null

  if (!code || !wabaId) {
    return NextResponse.json(
      { error: 'Embedded Signup did not return both an authorization code and WABA ID.' },
      { status: 400 },
    )
  }

  const appId = (process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID || '').trim()
  const appSecret = (process.env.META_APP_SECRET || '').trim()
  if (!appId || !appSecret) {
    return NextResponse.json(
      {
        error:
          'Meta Embedded Signup is not configured on the server. Set META_APP_ID (or NEXT_PUBLIC_META_APP_ID) and META_APP_SECRET.',
      },
      { status: 503 },
    )
  }

  // Exchange the one-time code server-side. Never log the code/token.
  const tokenParams = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    code,
  })
  const tokenResponse = await fetch(`${META_API_BASE}/oauth/access_token?${tokenParams.toString()}`, {
    cache: 'no-store',
  })
  const tokenBody = (await tokenResponse.json().catch(() => ({}))) as MetaTokenResponse
  const accessToken = tokenBody.access_token?.trim() || ''

  if (!tokenResponse.ok || !accessToken) {
    return NextResponse.json(
      { error: tokenBody.error?.message || 'Meta authorization-code exchange failed.' },
      { status: 400 },
    )
  }

  // Subscribe our app to WABA webhooks. This is idempotent on Meta's side.
  const subscribeResponse = await fetch(`${META_API_BASE}/${encodeURIComponent(wabaId)}/subscribed_apps`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!subscribeResponse.ok) {
    return NextResponse.json(
      {
        error: await metaError(
          subscribeResponse,
          'Connected WABA could not be subscribed to the Meta app.',
        ),
      },
      { status: 400 },
    )
  }

  // Coexistence completion messages may provide only WABA ID. Resolve its
  // phone-number asset using Graph API; standard Embedded Signup may provide it.
  const phonesResponse = await fetch(
    `${META_API_BASE}/${encodeURIComponent(wabaId)}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    },
  )
  const phonesBody = (await phonesResponse.json().catch(() => ({}))) as MetaPhonesResponse
  if (!phonesResponse.ok) {
    return NextResponse.json(
      { error: phonesBody.error?.message || 'Could not load WhatsApp phone numbers from Meta.' },
      { status: 400 },
    )
  }

  const phones = Array.isArray(phonesBody.data) ? phonesBody.data : []
  let selectedPhone = requestedPhoneId
    ? phones.find((phone) => phone.id === requestedPhoneId)
    : undefined

  if (!selectedPhone && phones.length === 1) selectedPhone = phones[0]

  if (!selectedPhone) {
    return NextResponse.json(
      {
        error:
          phones.length > 1
            ? 'Meta returned multiple phone numbers and did not identify which one completed onboarding. Use Advanced / Manual Setup for this account, or onboard the intended number in a WABA where it can be identified uniquely.'
            : 'Meta did not return a usable WhatsApp phone number for this WABA.',
        phones: phones.map((phone) => ({
          id: phone.id,
          display_phone_number: phone.display_phone_number ?? null,
          verified_name: phone.verified_name ?? null,
        })),
      },
      { status: 400 },
    )
  }

  let phoneInfo
  try {
    phoneInfo = await verifyPhoneNumber({ phoneNumberId: selectedPhone.id, accessToken })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Meta phone verification failed.' },
      { status: 400 },
    )
  }

  const { data: existing, error: existingError } = await supabase
    .from('whatsapp_config')
    .select('id, verify_token')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: 'Failed to load current WhatsApp configuration.' }, { status: 500 })
  }

  let encryptedAccessToken: string
  let encryptedVerifyToken = existing?.verify_token ?? null
  let generatedVerifyToken: string | null = null
  try {
    encryptedAccessToken = encrypt(accessToken)
    if (!encryptedVerifyToken) {
      generatedVerifyToken = randomBytes(24).toString('hex')
      encryptedVerifyToken = encrypt(generatedVerifyToken)
    }
  } catch {
    return NextResponse.json(
      { error: 'Could not encrypt Meta credentials. Check the 64-character ENCRYPTION_KEY.' },
      { status: 500 },
    )
  }

  const now = new Date().toISOString()
  const record = {
    user_id: user.id,
    phone_number_id: selectedPhone.id,
    waba_id: wabaId,
    access_token: encryptedAccessToken,
    verify_token: encryptedVerifyToken,
    status: 'connected' as const,
    connected_at: now,
    connection_mode: connectionMode,
    business_phone: phoneInfo.display_phone_number || null,
    business_name: phoneInfo.verified_name || null,
    coexistence_enabled: connectionMode === 'coexistence',
    embedded_signup_status: 'connected',
    connection_metadata: {
      source: 'meta_embedded_signup',
      session_event: sessionEvent,
      subscribed_at: now,
      phone_assets_found: phones.length,
    },
    updated_at: now,
  }

  const result = existing
    ? await supabase.from('whatsapp_config').update(record).eq('id', existing.id).eq('user_id', user.id)
    : await supabase.from('whatsapp_config').insert(record)

  if (result.error) {
    console.error('[embedded-signup] Failed to save configuration:', result.error)
    return NextResponse.json({ error: 'WhatsApp connected in Meta but CRM could not save it.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    connection_mode: connectionMode,
    phone_info: phoneInfo,
    waba_id: wabaId,
    phone_number_id: selectedPhone.id,
    // Returned only once if this was generated. It is encrypted at rest.
    webhook_verify_token: generatedVerifyToken,
  })
}
