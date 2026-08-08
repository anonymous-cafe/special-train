-- ============================================================
-- Legacy account_id compatibility
--
-- Some older/previous CRM schemas added an account_id column with a NOT NULL
-- constraint. The current application is user-scoped and writes user_id; it
-- does not write account_id anywhere. When complete_setup.sql is run on top of
-- an existing database, CREATE TABLE IF NOT EXISTS preserves those legacy
-- columns, so inserts can fail with:
--   null value in column "account_id" ... violates not-null constraint
--
-- Keep the legacy columns/data for compatibility, but make them nullable on
-- tables owned by this application. This migration is idempotent.
-- ============================================================

DO $$
DECLARE
  tbl TEXT;
  app_tables TEXT[] := ARRAY[
    'profiles',
    'contacts',
    'tags',
    'contact_tags',
    'conversations',
    'messages',
    'whatsapp_config',
    'message_templates',
    'pipelines',
    'pipeline_stages',
    'deals',
    'broadcasts',
    'broadcast_recipients',
    'automations',
    'automation_logs',
    'flows',
    'flow_runs'
  ];
BEGIN
  FOREACH tbl IN ARRAY app_tables LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = tbl
        AND column_name = 'account_id'
        AND is_nullable = 'NO'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN account_id DROP NOT NULL', tbl);
      RAISE NOTICE 'Legacy compatibility: public.%.account_id is now nullable', tbl;
    END IF;
  END LOOP;
END $$;
