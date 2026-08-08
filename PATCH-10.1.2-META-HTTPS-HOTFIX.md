# GrowthSprint365 Patch 10.1.2 — Meta Embedded Signup HTTPS Hotfix

## Fixed

- Prevents `FB.login` from being called on plain HTTP pages such as `http://localhost:3000`.
- Prevents the `FB.login() called before FB.init()` error by initializing the Meta JavaScript SDK through `fbAsyncInit` and a defensive pre-login fallback.
- The Meta JavaScript SDK is not loaded on plain HTTP development pages.
- Settings now explains that Embedded Signup must be launched from an HTTPS GrowthSprint365 URL.
- Manual WhatsApp Cloud API configuration remains usable during normal localhost development.

## How to test

1. Normal CRM pages can still be tested on `http://localhost:3000`.
2. Do not expect the Meta Embedded Signup popup to run on plain HTTP localhost.
3. For Embedded Signup, open the project from an HTTPS deployment/preview URL and use **Settings → WhatsApp → Connect with Meta**.
4. No SQL migration is required for this hotfix.

## Validation note

The changed TSX file was checked structurally. Full `npm ci` could not be run in the build sandbox because its internal npm mirror does not contain `zod-validation-error@4.0.2`; run the standard project checks on your local machine.
