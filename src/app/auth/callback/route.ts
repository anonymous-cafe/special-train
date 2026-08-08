import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard'
  }
  return value
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeNextPath(requestUrl.searchParams.get('next'))

  if (!code) {
    const errorUrl = new URL('/login', requestUrl.origin)
    errorUrl.searchParams.set('error', 'Missing authentication code')
    return NextResponse.redirect(errorUrl)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] code exchange failed:', error.message)
    const errorUrl = new URL('/login', requestUrl.origin)
    errorUrl.searchParams.set('error', 'Authentication link is invalid or expired')
    return NextResponse.redirect(errorUrl)
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
