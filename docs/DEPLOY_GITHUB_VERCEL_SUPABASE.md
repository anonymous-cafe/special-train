# GrowthSprint365 — GitHub → Vercel → Supabase Deployment

This project is prepared for the architecture:

- **GitHub** — private source repository and version history
- **Vercel** — Next.js application / API routes
- **Supabase** — Postgres, Auth, Realtime, Storage and database security (RLS)
- **Meta** — WhatsApp Cloud API / Embedded Signup / eligible Business App coexistence

> **Production-security gate:** use this guide to prepare preview/staging now. Before connecting real customer data or marketing traffic, complete Patch-13 Security / Production Hardening and the final dependency security update.

## 1. Prepare the project locally

```bash
npm install
npm run typecheck
npm run test
npm run build
```

Create `.env.local` from `.env.local.example`. Never commit `.env.local`.

Generate stable secrets once and keep them safe:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use one output for `ENCRYPTION_KEY`. Generate another long random value for `CRON_SECRET`.

**Do not rotate ENCRYPTION_KEY casually.** Existing encrypted WhatsApp tokens depend on it.

## 2. Prepare Supabase

### Existing GrowthSprint365 database
Run only:

`RUN-THIS-SQL-PATCH-10.1.sql`

### Brand-new database
Run:

`supabase/complete_setup.sql`

Then verify Authentication is enabled and create your first user if needed.

### Supabase Auth URL settings
For local development:

- Site URL: `http://localhost:3000`
- Redirect allow list: `http://localhost:3000/**`

For production, replace the Site URL with your exact production domain and add the exact production callback URLs, for example:

- `https://crm.yourdomain.com/auth/callback`
- `https://crm.yourdomain.com/reset-password`

If you use Vercel Preview deployments, add the appropriate Vercel preview wildcard pattern in Supabase Auth Redirect URLs.

## 3. Put the source on GitHub

Create a **private** GitHub repository, for example `GrowthSprint365`.

From the project folder:

```bash
git init
git add .
git commit -m "GrowthSprint365 initial production baseline"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Before pushing, confirm these are NOT staged:

- `.env.local`
- API keys / access tokens
- Supabase service-role / secret key
- Meta App Secret
- AI provider secret

The repository already ignores local environment files through `.gitignore`.

## 4. Import the GitHub repository into Vercel

1. In Vercel, create a new project.
2. Import the `GrowthSprint365` GitHub repository.
3. Framework should be detected as **Next.js**.
4. Node.js must satisfy the project's `>=20` requirement.
5. Add the required Environment Variables from `.env.local.example`.
6. Deploy.

Recommended production variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ENCRYPTION_KEY=...
META_APP_SECRET=...
META_APP_ID=...
NEXT_PUBLIC_META_APP_ID=...
NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID=...
META_GRAPH_API_VERSION=v25.0
NEXT_PUBLIC_SITE_URL=https://crm.yourdomain.com
CRON_SECRET=...
```

AI variables are optional unless AI CRM is enabled.

### Important Vercel environment rule
`SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY`, `META_APP_SECRET`, `CRON_SECRET`, and AI keys must never use a `NEXT_PUBLIC_` prefix.

## 5. Add a custom domain

After the first successful production deployment:

1. Vercel → Project → Settings → Domains.
2. Add your domain/subdomain, for example `crm.growthsprint365.com`.
3. Configure the DNS records Vercel shows.
4. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS URL.
5. Redeploy.
6. Update Supabase Site URL / Redirect URLs to the final domain.

## 6. WhatsApp / Meta production setup

### Webhook
Use:

`https://YOUR-PRODUCTION-DOMAIN/api/whatsapp/webhook`

The webhook validates Meta signatures using `META_APP_SECRET`.

### Embedded Signup
To enable **Connect with Meta** in Settings, configure:

- `NEXT_PUBLIC_META_APP_ID`
- `NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID`
- `META_APP_SECRET`

For **WhatsApp Business App + CRM (Coexistence)**, GrowthSprint365 launches Embedded Signup with the Business App onboarding feature and stores the returned token encrypted server-side.

For coexistence, the Meta app must also subscribe to the relevant webhook fields used by this project:

- `messages`
- `history`
- `smb_app_state_sync`
- `smb_message_echoes`
- `account_update`

GrowthSprint365 handles contact sync, history backfill, Business App sent-message echoes and basic coexistence disconnect/reconnect events. Meta still controls whether a business/number is eligible for coexistence and whether the required permissions/review are approved.

## 7. Scheduler: two deployment choices

GrowthSprint365 has one protected scheduler endpoint:

`/api/system/cron`

It fans out to scheduled Automations, Broadcasts and Flow timeout processing.

### Option A — Vercel Pro
Copy the `crons` section from `vercel.pro.json.example` into `vercel.json` and redeploy. The example runs every 5 minutes.

Keep `CRON_SECRET` configured in Vercel.

### Option B — Vercel Hobby + Supabase Cron
Vercel Hobby does not support frequent Cron Jobs. Leave the included `vercel.json` as-is and use Supabase Cron to call the Vercel endpoint.

After your production URL exists:

1. Open `supabase/SCHEDULER_SETUP_TEMPLATE.sql`.
2. Replace the production URL placeholder.
3. Replace the secret placeholder with the **same** `CRON_SECRET` stored in Vercel.
4. Run the file in Supabase SQL Editor.

The template stores values in Supabase Vault and schedules an HTTPS call every 5 minutes.

## 8. Final production checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] Supabase production migration ran successfully
- [ ] Supabase Auth Site URL / redirect URLs are correct
- [ ] RLS is enabled on CRM tables
- [ ] Vercel secrets are server-only
- [ ] Custom domain HTTPS works
- [ ] Login / password reset works on the production domain
- [ ] WhatsApp connection test passes
- [ ] Meta webhook verification passes
- [ ] Test incoming + outgoing WhatsApp message
- [ ] If coexistence is enabled: test Business App message echo, contact sync and history opt-in path
- [ ] Test task creation / assignment
- [ ] Test scheduled automation / broadcast scheduler
- [ ] Test AI only after AI provider secrets are configured

## 9. What is intentionally deferred

The current Core build does not weaken the existing owner-scoped RLS model just to simulate shared logins. `crm_agents` is a safe team/assignment directory today. Full authenticated workspace membership, invitations and production-grade role permission enforcement should be completed in **Patch-13 Security / Production Hardening**.

Next planned phases:

1. Patch-11 — WooCommerce / Shopify
2. Patch-12 — Analytics
3. Patch-13 — Security / Production Hardening
