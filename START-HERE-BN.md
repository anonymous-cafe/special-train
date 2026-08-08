# ⚠️ প্রথমে এটি পড়ুন — Clean Folder Required

**এই release পুরনো project folder-এর উপর merge/copy করবেন না।** নতুন খালি folder-এ extract করুন। পুরনো folder-এর `src/middleware.ts`, `.next`, পুরনো generated files ইত্যাদি থেকে Next.js 16 conflict হতে পারে।

পুরনো project থেকে শুধু আপনার working `.env.local` backup করে নতুন folder-এ copy করবেন। `.env.local.example` দিয়ে `.env.local` overwrite করবেন না।

তারপর:

```bat
npm install
npm run verify
npm run dev
```

---

# GrowthSprint365 — শুরু করার আগে

এটি Patch-10.1 পর্যন্ত **একটাই merged project**। আলাদা patch folder apply করতে হবে না।

## 1) Existing Supabase database হলে
Supabase → SQL Editor-এ শুধু এই ফাইল run করুন:

`RUN-THIS-SQL-PATCH-10.1.sql`

## 2) একদম নতুন Supabase project হলে
শুধু এই ফাইল run করুন:

`supabase/complete_setup.sql`

একই fresh database-এ উপরের দুইটি SQL একসাথে run করবেন না।

## 3) Environment file
`.env.local.example` কপি করে `.env.local` বানান এবং আপনার real credentials বসান।

`ENCRYPTION_KEY` একবার generate করার পর local/Vercel-এ একই value রাখবেন। এটি বদলে দিলে আগে save করা encrypted WhatsApp token আর decrypt হবে না।

## 4) Local test

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run dev
```

তারপর `http://localhost:3000` খুলুন।

## 5) এই build-এ নতুন core কাজ
- GrowthSprint365 branding + নতুন premium homepage
- Tasks & Follow-ups
- Team Directory + agent roles/status
- Inbox conversation assignment
- Internal Notes
- Contact Activity Timeline
- Global Search
- Notification Center
- Dashboard task snapshot
- WhatsApp Cloud API + Embedded Signup foundation
- WhatsApp Business App + CRM Coexistence mode
- Coexistence contact sync, history sync, Business App sent-message echo
- GitHub → Vercel → Supabase deployment files
- Unified scheduler endpoint + Supabase Cron template

## 6) Hosting
পুরো guide:

`docs/DEPLOY_GITHUB_VERCEL_SUPABASE.md`

Target architecture:

**GitHub (source) → Vercel (Next.js app/API) → Supabase (DB/Auth/Realtime) → Meta (WhatsApp)**

## 7) Production launch নিয়ে গুরুত্বপূর্ণ কথা
এই build staging/local testing এবং deployment preparation-এর জন্য তৈরি। Real customer data নিয়ে public production launch করার আগে **Patch-13 Security / Production Hardening** complete করা হবে, যেখানে final dependency security update, shared-workspace RBAC/RLS hardening এবং enforced security policy review থাকবে।

## পরের roadmap
1. Patch-11 — WooCommerce / Shopify
2. Patch-12 — Analytics
3. Patch-13 — Security / Production Hardening
