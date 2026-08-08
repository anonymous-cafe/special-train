# Security notes

The project includes row-level security, Meta webhook HMAC verification, AES-256-GCM encryption for WhatsApp credentials, and API rate limiting for send/broadcast/reaction routes.

Migration `013_security_hardening.sql` additionally:

- removes an overly permissive message INSERT policy;
- makes message history read-only for browser sessions;
- makes automation audit logs read-only for browser sessions;
- restricts direct execution of privileged broadcast helper functions.

Operational requirements:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.
- Never commit `.env.local`.
- Keep `ENCRYPTION_KEY` stable; changing it prevents existing encrypted WhatsApp tokens from being decrypted.
- Use a long random webhook verify token and cron secret.
- Keep Supabase, Next.js, and Meta Graph API compatibility reviewed before major upgrades.
- Replace the in-memory rate limiter with a shared store if deploying across multiple server instances/regions.
