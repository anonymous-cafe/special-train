# GrowthSprint365 — Patch 10.1 Final Core Build

This ZIP is one merged project. There are no separate patch folders.

## Branding + Homepage
- Project renamed to **GrowthSprint365** throughout the public app and dashboard shell.
- New responsive premium homepage designed specifically around the CRM feature set.
- Homepage covers Inbox, Contacts, Tasks, Pipelines, Broadcasts, Automations, AI CRM, WhatsApp coexistence and the GitHub/Vercel/Supabase architecture.

## Core CRM additions
- Tasks & Follow-ups page with due dates, priority, status, contact/deal relation and agent assignment.
- Team Directory under Settings with Admin / Manager / Agent labels and Active / Inactive status.
- Inbox conversation assignment now uses the CRM agent directory.
- Internal contact notes remain private CRM data.
- Contact Activity Timeline combines messages, notes, deals, tasks and explicit CRM activity events.
- Global Search in the dashboard header for contacts and deals.
- Notification Center for overdue/due tasks, failed broadcasts and failed automation activity.
- Dashboard task snapshot.

## WhatsApp Coexistence system
- Connection modes: Cloud API Only / WhatsApp Business App + CRM.
- Meta Embedded Signup integration.
- Coexistence launch uses the WhatsApp Business App onboarding feature.
- Authorization code exchange happens server-side.
- Meta access tokens are encrypted at rest.
- WABA subscription + phone asset resolution after Embedded Signup.
- Coexistence status metadata stored on the WhatsApp configuration.
- `smb_message_echoes` are mirrored into the CRM as outbound agent messages.
- `smb_app_state_sync` imports/updates Business App contacts without deleting CRM history when a phone contact is removed.
- `history` webhook can backfill supported conversation history.
- Manual contact/history sync request endpoint added.
- `account_update` handles basic coexistence disconnect/reconnect state.
- Advanced/manual credential setup is retained as fallback.

Meta controls eligibility, Tech Provider/App Review requirements, permissions and rollout. A successful build does not guarantee that every number can use coexistence.

## GitHub / Vercel / Supabase deployment
- `.env.local.example` refreshed for production variables.
- Safe default `vercel.json` deploys on Vercel Hobby without an invalid frequent cron schedule.
- `vercel.pro.json.example` shows the 5-minute Vercel Pro cron configuration.
- `/api/system/cron` unifies Automations, Broadcasts and Flow scheduled processing and accepts GET/POST.
- `supabase/SCHEDULER_SETUP_TEMPLATE.sql` supports Vercel Hobby by scheduling the same endpoint from Supabase Cron/Vault.
- Full deployment guide: `docs/DEPLOY_GITHUB_VERCEL_SUPABASE.md`.

## Database update
For an EXISTING database, run exactly:

`RUN-THIS-SQL-PATCH-10.1.sql`

For a BRAND-NEW Supabase project, run:

`supabase/complete_setup.sql`

Do not run both on the same fresh project.

## Important architecture note
The current database was designed around one authenticated owner (`user_id`) per CRM dataset. Patch 10.1 adds a safe team directory and assignments without opening one user's data to other authenticated accounts. True shared-workspace invitations and RBAC are intentionally reserved for Patch-13 where the RLS model can be upgraded correctly.

## Production safety note
The hosting architecture and deployment files are prepared, but do not treat this build as the final production-security baseline. The project is still pinned to the tested 16.2.x dependency set from the source package. Patch-13 will include the final dependency/security refresh, enforced CSP/RBAC review and production hardening before real customer data is onboarded.

## Next roadmap
- Patch-11 — WooCommerce / Shopify
- Patch-12 — Analytics
- Patch-13 — Security / Production Hardening
