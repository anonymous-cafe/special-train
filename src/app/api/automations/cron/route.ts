import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/automations/admin-client'
import { resumePendingExecution, runAutomationById } from '@/lib/automations/engine'
import type { AutomationContext } from '@/lib/automations/engine'
import type { Automation, NoResponseTriggerConfig, TimeBasedTriggerConfig } from '@/types'

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET || process.env.AUTOMATION_CRON_SECRET
  if (!expected) return false
  const authorization = request.headers.get('authorization') ?? ''
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  const supplied = request.headers.get('x-cron-secret') ?? bearer
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function minuteKey(date: Date): string {
  return date.toISOString().slice(0, 16)
}

function zonedParts(date: Date, timeZone?: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(date).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]),
  )
  return {
    minute: Number(parts.minute),
    hour: Number(parts.hour),
    day: Number(parts.day),
    month: Number(parts.month),
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday),
  }
}

function cronFieldMatches(field: string, value: number): boolean {
  if (field === '*') return true
  return field.split(',').some((token) => {
    const trimmed = token.trim()
    if (/^\d+$/.test(trimmed)) return Number(trimmed) === value
    const step = trimmed.match(/^\*\/(\d+)$/)
    if (step) return value % Math.max(1, Number(step[1])) === 0
    const range = trimmed.match(/^(\d+)-(\d+)$/)
    if (range) return value >= Number(range[1]) && value <= Number(range[2])
    return false
  })
}

function scheduleMatches(config: TimeBasedTriggerConfig, now: Date): boolean {
  const schedule = config.schedule?.trim()
  if (!schedule) return false
  const parts = zonedParts(now, config.timezone)
  if (/^\d{1,2}:\d{2}$/.test(schedule)) {
    const [hour, minute] = schedule.split(':').map(Number)
    return parts.hour === hour && parts.minute === minute
  }
  const fields = schedule.split(/\s+/)
  if (fields.length !== 5) return false
  return (
    cronFieldMatches(fields[0], parts.minute) &&
    cronFieldMatches(fields[1], parts.hour) &&
    cronFieldMatches(fields[2], parts.day) &&
    cronFieldMatches(fields[3], parts.month) &&
    cronFieldMatches(fields[4], parts.weekday)
  )
}

function delayMs(config: NoResponseTriggerConfig): number {
  const amount = Math.max(1, Number(config.amount) || 1)
  const unit = config.unit === 'days' ? 86_400_000 : config.unit === 'minutes' ? 60_000 : 3_600_000
  return amount * unit
}

async function claimReceipt(args: {
  automationId: string
  userId: string
  subjectId: string
  eventKey: string
}): Promise<boolean> {
  const admin = supabaseAdmin()
  const { error } = await admin.from('automation_trigger_receipts').insert({
    automation_id: args.automationId,
    user_id: args.userId,
    subject_id: args.subjectId,
    event_key: args.eventKey,
  })
  if (!error) return true
  // 23505 = unique_violation. Any other error is logged and treated as no-claim.
  if (error.code !== '23505') console.error('[automations] receipt claim failed:', error)
  return false
}

async function drainPendingWaits(): Promise<number> {
  const admin = supabaseAdmin()
  const { data: due, error } = await admin
    .from('automation_pending_executions')
    .select('*')
    .eq('status', 'pending')
    .lte('run_at', new Date().toISOString())
    .order('run_at', { ascending: true })
    .limit(50)

  if (error) throw new Error(error.message)
  let processed = 0
  for (const row of due ?? []) {
    const { data: claim } = await admin
      .from('automation_pending_executions')
      .update({ status: 'running' })
      .eq('id', row.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()
    if (!claim) continue

    await resumePendingExecution({
      id: row.id as string,
      automation_id: row.automation_id as string,
      user_id: row.user_id as string,
      contact_id: (row.contact_id as string | null) ?? null,
      log_id: (row.log_id as string | null) ?? null,
      parent_step_id: (row.parent_step_id as string | null) ?? null,
      branch: (row.branch as 'yes' | 'no' | null) ?? null,
      next_step_position: row.next_step_position as number,
      context: (row.context as AutomationContext) ?? {},
    })
    processed++
  }
  return processed
}

async function runScheduled(now: Date): Promise<number> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('automations')
    .select('*')
    .eq('trigger_type', 'time_based')
    .eq('is_active', true)
  if (error) throw new Error(error.message)

  let processed = 0
  for (const automation of (data ?? []) as Automation[]) {
    const cfg = automation.trigger_config as TimeBasedTriggerConfig
    if (!scheduleMatches(cfg, now)) continue
    const key = `${minuteKey(now)}:${cfg.timezone ?? 'UTC'}`
    if (!(await claimReceipt({
      automationId: automation.id,
      userId: automation.user_id,
      subjectId: 'schedule',
      eventKey: key,
    }))) continue
    await runAutomationById({
      automationId: automation.id,
      userId: automation.user_id,
      triggerType: 'time_based',
      context: { vars: { scheduled_at: now.toISOString() } },
    })
    processed++
  }
  return processed
}

async function runNoResponse(now: Date): Promise<number> {
  const admin = supabaseAdmin()
  const { data: automations, error } = await admin
    .from('automations')
    .select('*')
    .eq('trigger_type', 'no_response_received')
    .eq('is_active', true)
  if (error) throw new Error(error.message)

  let processed = 0
  for (const automation of (automations ?? []) as Automation[]) {
    const cfg = automation.trigger_config as unknown as NoResponseTriggerConfig
    const cutoff = new Date(now.getTime() - delayMs(cfg)).toISOString()
    const { data: conversations, error: convError } = await admin
      .from('conversations')
      .select('id, contact_id, last_message_at')
      .eq('user_id', automation.user_id)
      .in('status', ['open', 'pending'])
      .not('last_message_at', 'is', null)
      .lte('last_message_at', cutoff)
      .order('last_message_at', { ascending: true })
      .limit(100)
    if (convError) {
      console.error('[automations] no-response conversations failed:', convError)
      continue
    }

    for (const conversation of conversations ?? []) {
      const { data: latest, error: latestError } = await admin
        .from('messages')
        .select('id, sender_type, content_text, created_at')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (latestError || !latest) continue
      if (latest.sender_type !== 'agent' && latest.sender_type !== 'bot') continue
      if (new Date(latest.created_at).getTime() > new Date(cutoff).getTime()) continue

      if (!(await claimReceipt({
        automationId: automation.id,
        userId: automation.user_id,
        subjectId: String(conversation.id),
        eventKey: String(latest.id),
      }))) continue

      await runAutomationById({
        automationId: automation.id,
        userId: automation.user_id,
        triggerType: 'no_response_received',
        contactId: conversation.contact_id as string,
        context: {
          conversation_id: conversation.id as string,
          message_text: (latest.content_text as string | null) ?? '',
          vars: { last_outbound_message_id: latest.id, last_outbound_at: latest.created_at },
        },
      })
      processed++
    }
  }
  return processed
}

/**
 * Automation Pro cron: resumes Wait steps and dispatches Time-Based / No-Response
 * triggers. Configure an external cron to call this endpoint every minute with
 * x-cron-secret = AUTOMATION_CRON_SECRET.
 */
export async function GET(request: Request) {
  if (!(process.env.CRON_SECRET || process.env.AUTOMATION_CRON_SECRET)) {
    return NextResponse.json({ error: 'cron not configured' }, { status: 503 })
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const [waits, scheduled, noResponse] = await Promise.all([
      drainPendingWaits(),
      runScheduled(now),
      runNoResponse(now),
    ])
    return NextResponse.json({ processed: waits + scheduled + noResponse, waits, scheduled, no_response: noResponse })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Automation cron failed'
    console.error('[automations] cron failed:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
