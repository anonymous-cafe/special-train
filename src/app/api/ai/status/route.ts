import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiConfigured } from '@/lib/ai/provider'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({
    configured: aiConfigured(),
    model: process.env.AI_MODEL ?? null,
    provider_url_set: Boolean(process.env.AI_API_URL),
  })
}
