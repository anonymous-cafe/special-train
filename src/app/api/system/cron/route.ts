import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

function suppliedSecret(request: Request): string {
  const authorization = request.headers.get('authorization') ?? ''
  if (authorization.startsWith('Bearer ')) return authorization.slice(7)
  return request.headers.get('x-cron-secret') ?? ''
}

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET || process.env.AUTOMATION_CRON_SECRET
  if (!expected) return false
  const supplied = suppliedSecret(request)
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * GrowthSprint365 unified scheduler.
 * One Vercel Cron invocation fans out to automations, broadcasts and flow
 * timeout sweeping, which keeps the deployment compatible with projects that
 * want a single scheduled job. Vercel sends Authorization: Bearer CRON_SECRET.
 */
async function runScheduler(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const origin = new URL(request.url).origin
  const secret = process.env.CRON_SECRET || process.env.AUTOMATION_CRON_SECRET || ''
  const headers = { authorization: `Bearer ${secret}` }
  const targets = [
    ['automations', '/api/automations/cron'],
    ['broadcasts', '/api/broadcasts/cron'],
    ['flows', '/api/flows/cron'],
  ] as const

  const responses = await Promise.all(
    targets.map(async ([name, path]) => {
      try {
        const res = await fetch(`${origin}${path}`, { headers, cache: 'no-store' })
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        return { name, ok: res.ok, status: res.status, body }
      } catch (error) {
        return {
          name,
          ok: false,
          status: 500,
          body: { error: error instanceof Error ? error.message : 'Scheduler request failed' },
        }
      }
    }),
  )

  const ok = responses.every((item) => item.ok)
  return NextResponse.json({ ok, jobs: responses }, { status: ok ? 200 : 207 })
}

export async function GET(request: Request) {
  return runScheduler(request)
}

export async function POST(request: Request) {
  return runScheduler(request)
}
