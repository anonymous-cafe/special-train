# GrowthSprint365

**GrowthSprint365** is a WhatsApp-first CRM built with Next.js and Supabase for customer conversations, contact management, tasks, sales pipelines, broadcasts, automations, flows and AI-assisted CRM work.

## Current Core Features

- Dashboard with CRM snapshots and follow-up visibility
- WhatsApp Inbox with quick replies, media tools, priority, snooze and assignment
- Contacts, tags, custom fields, notes and activity timeline
- Tasks & Follow-ups
- Sales Pipelines with probability / won / lost logic
- Broadcast scheduling, segmentation, retries and opt-out protection
- Automation Builder and Flow Builder
- AI CRM: reply suggestions, summaries, intent, lead score, tagging and knowledge base
- Team Directory for CRM assignments
- Global Search and Notification Center
- Meta Cloud API manual connection
- Meta Embedded Signup foundation for standard onboarding and eligible WhatsApp Business App coexistence
- Coexistence contact sync, history webhook import and Business App message echoes

## Stack

- Next.js 16 / React 19 / TypeScript
- Supabase Postgres / Auth / Realtime / RLS
- Meta WhatsApp Cloud API
- Vercel-ready application deployment
- GitHub-ready source workflow

## Local Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

On Windows, create `.env.local` manually or copy it in File Explorer/CMD.

### Database

Existing database:

`RUN-THIS-SQL-PATCH-10.1.sql`

Brand-new Supabase database:

`supabase/complete_setup.sql`

## Validation Before Deployment

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

## Production Deployment

The GitHub → Vercel → Supabase deployment path is prepared now. For real customer data, complete **Patch-13 Security / Production Hardening** (including the final dependency/security upgrade) before treating the deployment as production-ready.

Read:

`docs/DEPLOY_GITHUB_VERCEL_SUPABASE.md`

The intended production architecture is:

**GitHub → Vercel → Supabase**, with Meta providing WhatsApp Cloud API / Embedded Signup.

## Current roadmap

The next planned merged builds are:

1. Patch-11 — WooCommerce / Shopify
2. Patch-12 — Analytics
3. Patch-13 — Security / Production Hardening

## License

MIT
