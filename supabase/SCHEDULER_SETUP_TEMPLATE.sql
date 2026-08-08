-- GrowthSprint365 scheduler for Vercel Hobby + Supabase Cron.
-- IMPORTANT: replace BOTH placeholders before running.
-- Run this separately in Supabase SQL Editor AFTER the Vercel production URL exists.
-- Do not add this file to complete_setup.sql because it contains deployment-specific secrets.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- Change these values first.
SELECT vault.create_secret('https://YOUR-PRODUCTION-DOMAIN.com', 'growthsprint365_app_url');
SELECT vault.create_secret('REPLACE_WITH_THE_SAME_CRON_SECRET_USED_IN_VERCEL', 'growthsprint365_cron_secret');

-- Remove an older copy if you are re-running this setup.
DO $$
DECLARE
  existing_job BIGINT;
BEGIN
  SELECT jobid INTO existing_job FROM cron.job WHERE jobname = 'growthsprint365-system-scheduler' LIMIT 1;
  IF existing_job IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job);
  END IF;
END $$;

SELECT cron.schedule(
  'growthsprint365-system-scheduler',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'growthsprint365_app_url' LIMIT 1) || '/api/system/cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'growthsprint365_cron_secret' LIMIT 1)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 15000
  );
  $$
);
