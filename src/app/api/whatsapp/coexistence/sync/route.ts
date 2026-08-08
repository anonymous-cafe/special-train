import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/whatsapp/encryption'

const META_API_VERSION = process.env.META_GRAPH_API_VERSION?.trim() || 'v25.0'
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { sync_type?: unknown } | null
  const syncType = body?.sync_type === 'history' ? 'history' : body?.sync_type === 'smb_app_state_sync' ? 'smb_app_state_sync' : ''
  if (!syncType) {
    return NextResponse.json({ error: 'sync_type must be history or smb_app_state_sync' }, { status: 400 })
  }

  const { data: config, error } = await supabase
    .from('whatsapp_config')
    .select('id, phone_number_id, access_token, connection_mode, coexistence_enabled, connection_metadata')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !config) return NextResponse.json({ error: 'WhatsApp is not configured.' }, { status: 404 })
  if (config.connection_mode !== 'coexistence' || !config.coexistence_enabled) {
    return NextResponse.json({ error: 'This action is only available for a connected coexistence number.' }, { status: 400 })
  }

  let accessToken = ''
  try { accessToken = decrypt(config.access_token) } catch {
    return NextResponse.json({ error: 'Stored WhatsApp token cannot be decrypted.' }, { status: 400 })
  }

  const response = await fetch(`${META_API_BASE}/${encodeURIComponent(config.phone_number_id)}/smb_app_data`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', sync_type: syncType }),
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => ({})) as {
    request_id?: string
    error?: { message?: string }
  }

  if (!response.ok) {
    return NextResponse.json({ error: payload.error?.message || `Meta sync request failed (${response.status}).` }, { status: 400 })
  }

  const oldMetadata = config.connection_metadata && typeof config.connection_metadata === 'object'
    ? config.connection_metadata as Record<string, unknown>
    : {}
  const syncRequests = oldMetadata.sync_requests && typeof oldMetadata.sync_requests === 'object'
    ? oldMetadata.sync_requests as Record<string, unknown>
    : {}

  await supabase.from('whatsapp_config').update({
    connection_metadata: {
      ...oldMetadata,
      sync_requests: {
        ...syncRequests,
        [syncType]: {
          request_id: payload.request_id || null,
          requested_at: new Date().toISOString(),
        },
      },
    },
  }).eq('id', config.id).eq('user_id', user.id)

  return NextResponse.json({ success: true, request_id: payload.request_id || null, sync_type: syncType })
}
