# GrowthSprint365 — Clean Install / Hotfix নির্দেশনা

## খুব গুরুত্বপূর্ণ
এই release টি **পুরনো project folder-এর উপর copy/merge করবেন না**।
নতুন ZIP একটি **নতুন খালি folder**-এ extract করবেন।

কারণ আগের version-এ `src/middleware.ts` ছিল, আর Next.js 16 build-এ এখন `src/proxy.ts` ব্যবহার করা হচ্ছে।
নতুন ZIP পুরনো file delete করতে পারে না। পুরনো folder-এর উপর copy করলে `middleware.ts` থেকে যায় এবং Next.js একই সঙ্গে `middleware.ts` + `proxy.ts` পেয়ে build/dev বন্ধ করে দেয়।

## Safe upgrade
1. বর্তমানে কাজ করা `.env.local` আলাদা নিরাপদ জায়গায় backup করুন।
2. এই ZIP নতুন folder-এ extract করুন, যেমন:
   `E:\Projects\MRB OMS\GrowthSprint365`
3. পুরনো project থেকে **শুধু আপনার `.env.local`** নতুন folder-এ copy করুন।
4. `.env.local.example` দিয়ে real `.env.local` overwrite করবেন না।
5. নতুন folder-এ CMD খুলুন এবং চালান:

```bat
npm install
npm run clean
npm run typecheck
npm run test
npm run build
npm run dev
```

6. তারপর পরীক্ষা করুন:
   - http://localhost:3000
   - http://localhost:3000/login

## Webhook URL সম্পর্কে
Browser-এ `/api/whatsapp/webhook` খুললে সেটা সাধারণ webpage নয়। এটি Meta webhook API endpoint।
Meta verification-এর সময় query parameters সহ GET এবং real webhook delivery-তে POST ব্যবহার হবে।

## .env security
`.env.local` GitHub-এ commit করবেন না। `.env.local.example`-এ কখনো real Supabase service role key, Meta App Secret, AI key বা অন্য secret রাখবেন না।
