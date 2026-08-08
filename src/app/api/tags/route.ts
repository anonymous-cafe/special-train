import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('tags')
    .select('id, name, color')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    console.error('[api/tags] failed to load tags:', error.message)
    return NextResponse.json({ error: 'Failed to load tags' }, { status: 500 })
  }

  return NextResponse.json({ tags: data ?? [] })
}
