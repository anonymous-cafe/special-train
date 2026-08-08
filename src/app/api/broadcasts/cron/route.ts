import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/automations/admin-client';
import { processBroadcastBatch } from '@/lib/broadcasts/server';

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET || process.env.BROADCAST_CRON_SECRET || process.env.AUTOMATION_CRON_SECRET;
  if (!expected) return false;
  const authorization = request.headers.get('authorization') ?? '';
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const supplied = request.headers.get('x-cron-secret') ?? bearer;
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await db
    .from('broadcasts')
    .select('id, status, scheduled_at')
    .in('status', ['scheduled', 'sending'])
    .order('scheduled_at', { ascending: true, nullsFirst: false })
    .limit(10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const row of data ?? []) {
    if (row.status === 'scheduled' && row.scheduled_at && row.scheduled_at > now) continue;
    try {
      results.push({ id: row.id, ...(await processBroadcastBatch(row.id)) });
    } catch (error) {
      results.push({ id: row.id, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  return NextResponse.json({ processed: results.length, results });
}
