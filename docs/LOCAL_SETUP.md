# Local setup

This project is a Next.js + Supabase WhatsApp CRM. The dashboard can run locally, but live WhatsApp messaging requires a public HTTPS URL for Meta webhooks.

## 1. Requirements

- Node.js 20 or newer
- npm
- A Supabase project
- A Meta Developer app with WhatsApp Cloud API enabled

## 2. Install

```bash
npm install
```

Copy the environment template:

```bash
cp .env.local.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_KEY`
- `META_APP_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `AUTOMATION_CRON_SECRET` if you use Wait steps / flow timeout cleanup

Generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Create the database

Open Supabase SQL Editor and run:

`supabase/complete_setup.sql`

The file contains migrations `001` through `013` in order, including RLS and security hardening.

## 4. Configure Supabase Auth URLs

In Supabase Authentication URL Configuration, add your local and production URLs.

Local examples:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`
- Redirect URL: `http://localhost:3000/reset-password`

Production examples:

- `https://your-domain.com/auth/callback`
- `https://your-domain.com/reset-password`

## 5. Start locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## 6. Connect WhatsApp Cloud API

In the CRM go to **Settings → WhatsApp** and save:

- Phone Number ID
- WhatsApp Business Account ID
- Permanent Access Token
- Your Webhook Verify Token

Then configure Meta's webhook callback as:

`https://your-public-domain.com/api/whatsapp/webhook`

Subscribe the WhatsApp webhook fields required by your Meta app, especially messages/status updates.

For local webhook testing, expose localhost through a trusted HTTPS tunnel and use that HTTPS URL in Meta. Do not expose your Supabase service-role key or `.env.local`.

## 7. Cron endpoints

If you use automation Wait steps or Flow timeouts, call these on a schedule with header:

`x-cron-secret: <AUTOMATION_CRON_SECRET>`

Endpoints:

- `/api/automations/cron`
- `/api/flows/cron`

Hourly is adequate for low-volume deployments. A shorter interval gives more precise Wait-step timing.

## 8. Production checks

Before going live:

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

Also confirm:

- Supabase RLS policies are enabled.
- `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY`, `META_APP_SECRET`, and `AUTOMATION_CRON_SECRET` are server-only.
- Meta webhook verification succeeds.
- A test inbound message appears in Inbox.
- A test outbound message is delivered and status changes update in real time.
- Password reset email returns through `/auth/callback` and reaches `/reset-password`.
