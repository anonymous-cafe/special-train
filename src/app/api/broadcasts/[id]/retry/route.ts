import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resetFailedRecipientsForRetry } from '@/lib/broadcasts/server';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  try {
    const result = await resetFailedRecipientsForRetry(id, user.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Retry failed' }, { status: 400 });
  }
}
