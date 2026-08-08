import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPhoneNumber } from '@/lib/whatsapp/meta-api'
import { encrypt, decrypt } from '@/lib/whatsapp/encryption'

/**
 * GET /api/whatsapp/config
 *
 * Used by the "Test API Connection" button and by the page to check
 * whether the saved config is healthy. Returns 200 in all non-auth cases
 * so the UI can render an appropriate message rather than show a 500.
 *
 * Response shape:
 *   { connected: true,  phone_info: {...} }
 *   { connected: false, reason: 'no_config',        message: '...' }
 *   { connected: false, reason: 'token_corrupted',  message: '...', needs_reset: true }
 *   { connected: false, reason: 'meta_api_error',   message: '...' }
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .select('phone_number_id, access_token, status, connection_mode, coexistence_enabled, embedded_signup_status, business_phone, business_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (configError) {
      console.error('Error fetching whatsapp_config:', configError)
      return NextResponse.json(
        { connected: false, reason: 'db_error', message: 'Failed to fetch configuration' },
        { status: 200 }
      )
    }

    if (!config) {
      return NextResponse.json(
        {
          connected: false,
          reason: 'no_config',
          message: 'No WhatsApp configuration saved yet. Fill in the form and click Save Configuration.',
        },
        { status: 200 }
      )
    }

    // Try to decrypt the stored token with the current ENCRYPTION_KEY.
    // If this fails, the key changed (or was never consistent across envs).
    let accessToken: string
    try {
      accessToken = decrypt(config.access_token)
    } catch (err) {
      console.error('[whatsapp/config GET] Token decryption failed:', err)
      return NextResponse.json(
        {
          connected: false,
          reason: 'token_corrupted',
          needs_reset: true,
          message:
            'The stored access token cannot be decrypted with the current ENCRYPTION_KEY. This usually means the key changed, or it differs between environments (local vs Hostinger vs Vercel). Click "Reset Configuration" below, then re-save.',
        },
        { status: 200 }
      )
    }

    // Validate credentials against Meta
    try {
      const phoneInfo = await verifyPhoneNumber({
        phoneNumberId: config.phone_number_id,
        accessToken,
      })
      return NextResponse.json({ connected: true, phone_info: phoneInfo, config: { connection_mode: config.connection_mode ?? 'cloud_api', coexistence_enabled: Boolean(config.coexistence_enabled), embedded_signup_status: config.embedded_signup_status ?? 'not_started', business_phone: config.business_phone ?? null, business_name: config.business_name ?? null } })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Meta API error'
      console.error('[whatsapp/config GET] Meta API verification failed:', message)
      return NextResponse.json(
        {
          connected: false,
          reason: 'meta_api_error',
          message: `Meta API rejected the credentials: ${message}`,
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error in WhatsApp config GET:', error)
    return NextResponse.json(
      { connected: false, reason: 'unknown', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/whatsapp/config
 *
 * Saves or updates the WhatsApp config for the authenticated user.
 * Verifies credentials with Meta first, then encrypts and stores.
 */
export async function POST(request: Request) {
  try {
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
          phone_number_id?: unknown
          waba_id?: unknown
          access_token?: unknown
          verify_token?: unknown
          connection_mode?: unknown
          business_phone?: unknown
          business_name?: unknown
          coexistence_enabled?: unknown
          embedded_signup_status?: unknown
        }
      | null

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const phoneNumberId =
      typeof body.phone_number_id === 'string' ? body.phone_number_id.trim() : ''
    const wabaId = typeof body.waba_id === 'string' ? body.waba_id.trim() : ''
    const suppliedAccessToken =
      typeof body.access_token === 'string' ? body.access_token.trim() : ''
    const hasVerifyToken = Object.prototype.hasOwnProperty.call(body, 'verify_token')
    const suppliedVerifyToken =
      typeof body.verify_token === 'string' ? body.verify_token.trim() : ''
    const connectionMode = body.connection_mode === 'coexistence' ? 'coexistence' : 'cloud_api'
    const businessPhone = typeof body.business_phone === 'string' ? body.business_phone.trim() : ''
    const businessName = typeof body.business_name === 'string' ? body.business_name.trim() : ''
    const coexistenceEnabled = connectionMode === 'coexistence' && body.coexistence_enabled === true
    const embeddedSignupStatus =
      typeof body.embedded_signup_status === 'string' && ['not_started', 'pending', 'connected', 'failed', 'disconnected'].includes(body.embedded_signup_status)
        ? body.embedded_signup_status
        : (coexistenceEnabled ? 'connected' : 'not_started')

    if (!phoneNumberId) {
      return NextResponse.json(
        { error: 'phone_number_id is required' },
        { status: 400 },
      )
    }

    // Load the existing encrypted secrets so users can edit Phone Number ID,
    // WABA ID, or other settings without re-entering a permanent token every
    // time. A newly supplied token always replaces the stored one.
    const { data: existing, error: existingError } = await supabase
      .from('whatsapp_config')
      .select('id, access_token, verify_token')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingError) {
      console.error('Error fetching existing whatsapp_config:', existingError)
      return NextResponse.json(
        { error: 'Failed to load existing configuration' },
        { status: 500 },
      )
    }

    if (!existing && !suppliedAccessToken) {
      return NextResponse.json(
        { error: 'access_token is required for initial setup' },
        { status: 400 },
      )
    }

    let accessToken = suppliedAccessToken
    if (!accessToken && existing?.access_token) {
      try {
        accessToken = decrypt(existing.access_token)
      } catch (err) {
        console.error('[whatsapp/config POST] Existing token decryption failed:', err)
        return NextResponse.json(
          {
            error:
              'The saved access token cannot be decrypted. Re-enter the Access Token or reset the configuration.',
            needs_reset: true,
          },
          { status: 400 },
        )
      }
    }

    // Verify credentials with Meta BEFORE persisting any change.
    let phoneInfo
    try {
      phoneInfo = await verifyPhoneNumber({
        phoneNumberId,
        accessToken,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Meta API error'
      console.error('Meta API verification failed during save:', message)
      return NextResponse.json(
        { error: `Meta API error: ${message}` },
        { status: 400 },
      )
    }

    let encryptedAccessToken = existing?.access_token ?? ''
    let encryptedVerifyToken = existing?.verify_token ?? null
    try {
      if (suppliedAccessToken) {
        encryptedAccessToken = encrypt(suppliedAccessToken)
      }
      // Omitted verify_token means "keep the current token". An explicit
      // empty string means "clear it". This prevents ordinary settings edits
      // from accidentally disabling Meta webhook verification.
      if (hasVerifyToken) {
        encryptedVerifyToken = suppliedVerifyToken
          ? encrypt(suppliedVerifyToken)
          : null
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown encryption error'
      console.error('Encryption failed:', message)
      return NextResponse.json(
        {
          error:
            'Failed to encrypt token. Check that ENCRYPTION_KEY is a valid 64-character hex string in your environment variables.',
        },
        { status: 500 },
      )
    }

    const now = new Date().toISOString()

    if (existing) {
      const { error: updateError } = await supabase
        .from('whatsapp_config')
        .update({
          phone_number_id: phoneNumberId,
          waba_id: wabaId || null,
          access_token: encryptedAccessToken,
          verify_token: encryptedVerifyToken,
          status: 'connected',
          connected_at: now,
          connection_mode: connectionMode,
          business_phone: businessPhone || null,
          business_name: businessName || phoneInfo?.verified_name || null,
          coexistence_enabled: coexistenceEnabled,
          embedded_signup_status: embeddedSignupStatus,
          updated_at: now,
        })
        .eq('id', existing.id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating whatsapp_config:', updateError)
        return NextResponse.json(
          { error: 'Failed to update configuration' },
          { status: 500 },
        )
      }
    } else {
      const { error: insertError } = await supabase.from('whatsapp_config').insert({
        user_id: user.id,
        phone_number_id: phoneNumberId,
        waba_id: wabaId || null,
        access_token: encryptedAccessToken,
        verify_token: encryptedVerifyToken,
        status: 'connected',
        connected_at: now,
        connection_mode: connectionMode,
        business_phone: businessPhone || null,
        business_name: businessName || phoneInfo?.verified_name || null,
        coexistence_enabled: coexistenceEnabled,
        embedded_signup_status: embeddedSignupStatus,
      })

      if (insertError) {
        console.error('Error inserting whatsapp_config:', insertError)
        return NextResponse.json(
          { error: 'Failed to save configuration' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ success: true, phone_info: phoneInfo, connection_mode: connectionMode, coexistence_enabled: coexistenceEnabled })
  } catch (error) {
    console.error('Error in WhatsApp config POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/whatsapp/config
 *
 * Removes the authenticated user's WhatsApp configuration row.
 * Used by the "Reset Configuration" button to recover from a corrupted
 * encrypted token (mismatched ENCRYPTION_KEY across environments).
 */
export async function DELETE() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: deleteError } = await supabase
      .from('whatsapp_config')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting whatsapp_config:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in WhatsApp config DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
