-- ============================================================
-- 015_patches_06_to_10_crm_pro.sql
-- Consolidated schema for Patch 06-10:
-- Inbox Pro, Broadcast Pro, Pipeline Pro, Automation Pro, AI CRM.
-- Idempotent and safe to run on top of migrations 001-014.
-- ============================================================

-- ============================================================
-- PATCH 06 — INBOX PRO
-- ============================================================
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS conversations_priority_check;
ALTER TABLE conversations
  ADD CONSTRAINT conversations_priority_check
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_conversations_priority
  ON conversations(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_conversations_snoozed
  ON conversations(user_id, snoozed_until) WHERE snoozed_until IS NOT NULL;

CREATE TABLE IF NOT EXISTS quick_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  shortcut TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, shortcut)
);
CREATE INDEX IF NOT EXISTS idx_quick_replies_user ON quick_replies(user_id, shortcut);
ALTER TABLE quick_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own quick replies" ON quick_replies;
CREATE POLICY "Users can manage own quick replies" ON quick_replies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS set_updated_at ON quick_replies;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON quick_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document')),
  media_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_library_user ON media_library(user_id, created_at DESC);
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own media library" ON media_library;
CREATE POLICY "Users can manage own media library" ON media_library FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS set_updated_at ON media_library;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON media_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PATCH 07 — BROADCAST PRO
-- ============================================================
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS whatsapp_opt_out BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS opt_out_at TIMESTAMPTZ;
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS opt_out_reason TEXT;
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS last_broadcast_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_contacts_broadcast_eligibility
  ON contacts(user_id, whatsapp_opt_out, last_broadcast_at);

ALTER TABLE broadcasts
  ADD COLUMN IF NOT EXISTS frequency_cap_hours INTEGER NOT NULL DEFAULT 24;
ALTER TABLE broadcasts
  ADD COLUMN IF NOT EXISTS retry_limit INTEGER NOT NULL DEFAULT 2;
ALTER TABLE broadcasts
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;
ALTER TABLE broadcasts
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE broadcasts
  DROP CONSTRAINT IF EXISTS broadcasts_frequency_cap_check;
ALTER TABLE broadcasts
  ADD CONSTRAINT broadcasts_frequency_cap_check CHECK (frequency_cap_hours BETWEEN 0 AND 720);
ALTER TABLE broadcasts
  DROP CONSTRAINT IF EXISTS broadcasts_retry_limit_check;
ALTER TABLE broadcasts
  ADD CONSTRAINT broadcasts_retry_limit_check CHECK (retry_limit BETWEEN 0 AND 10);
CREATE INDEX IF NOT EXISTS idx_broadcasts_scheduled_due
  ON broadcasts(scheduled_at) WHERE status = 'scheduled';

ALTER TABLE broadcast_recipients
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE broadcast_recipients
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;
ALTER TABLE broadcast_recipients
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_retry
  ON broadcast_recipients(next_retry_at)
  WHERE status = 'failed' AND next_retry_at IS NOT NULL;

-- ============================================================
-- PATCH 08 — PIPELINE PRO
-- ============================================================
ALTER TABLE pipeline_stages
  ADD COLUMN IF NOT EXISTS default_probability INTEGER NOT NULL DEFAULT 20;
ALTER TABLE pipeline_stages
  ADD COLUMN IF NOT EXISTS outcome TEXT NOT NULL DEFAULT 'open';
ALTER TABLE pipeline_stages
  DROP CONSTRAINT IF EXISTS pipeline_stages_probability_check;
ALTER TABLE pipeline_stages
  ADD CONSTRAINT pipeline_stages_probability_check CHECK (default_probability BETWEEN 0 AND 100);
ALTER TABLE pipeline_stages
  DROP CONSTRAINT IF EXISTS pipeline_stages_outcome_check;
ALTER TABLE pipeline_stages
  ADD CONSTRAINT pipeline_stages_outcome_check CHECK (outcome IN ('open', 'won', 'lost'));

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS probability INTEGER NOT NULL DEFAULT 20;
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE deals
  DROP CONSTRAINT IF EXISTS deals_probability_check;
ALTER TABLE deals
  ADD CONSTRAINT deals_probability_check CHECK (probability BETWEEN 0 AND 100);
CREATE INDEX IF NOT EXISTS idx_deals_forecast ON deals(user_id, status, probability);

-- Keep status/probability aligned with the destination stage when a deal moves.
CREATE OR REPLACE FUNCTION public.apply_pipeline_stage_defaults()
RETURNS TRIGGER AS $$
DECLARE
  s_prob INTEGER;
  s_outcome TEXT;
BEGIN
  IF TG_OP = 'INSERT' OR NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
    SELECT default_probability, outcome
      INTO s_prob, s_outcome
      FROM public.pipeline_stages
      WHERE id = NEW.stage_id;

    IF s_prob IS NOT NULL THEN NEW.probability := s_prob; END IF;
    IF s_outcome IN ('open', 'won', 'lost') THEN
      NEW.status := s_outcome;
      IF s_outcome IN ('won', 'lost') THEN
        NEW.closed_at := COALESCE(NEW.closed_at, NOW());
      ELSE
        NEW.closed_at := NULL;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_apply_pipeline_stage_defaults ON deals;
CREATE TRIGGER trg_apply_pipeline_stage_defaults
  BEFORE INSERT OR UPDATE OF stage_id ON deals
  FOR EACH ROW EXECUTE FUNCTION public.apply_pipeline_stage_defaults();

-- ============================================================
-- PATCH 09 — AUTOMATION PRO
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_trigger_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  event_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(automation_id, subject_id, event_key)
);
CREATE INDEX IF NOT EXISTS idx_automation_trigger_receipts_created
  ON automation_trigger_receipts(created_at DESC);
ALTER TABLE automation_trigger_receipts ENABLE ROW LEVEL SECURITY;
-- Server-managed dedupe table: service role bypasses RLS, browser gets no policy.

-- ============================================================
-- PATCH 10 — AI CRM
-- ============================================================
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS lead_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS ai_intent TEXT;
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS ai_last_analyzed_at TIMESTAMPTZ;
ALTER TABLE contacts
  DROP CONSTRAINT IF EXISTS contacts_lead_score_check;
ALTER TABLE contacts
  ADD CONSTRAINT contacts_lead_score_check CHECK (lead_score BETWEEN 0 AND 100);

CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_articles_user
  ON knowledge_base_articles(user_id, is_active, updated_at DESC);
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own knowledge base" ON knowledge_base_articles;
CREATE POLICY "Users can manage own knowledge base" ON knowledge_base_articles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS set_updated_at ON knowledge_base_articles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON knowledge_base_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS ai_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('suggest_reply', 'summarize', 'analyze', 'knowledge_answer')),
  model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_activity_logs_user
  ON ai_activity_logs(user_id, created_at DESC);
ALTER TABLE ai_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own AI activity logs" ON ai_activity_logs;
CREATE POLICY "Users can view own AI activity logs" ON ai_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Security-definer helper is trigger-only; do not expose it through PostgREST.
REVOKE ALL ON FUNCTION public.apply_pipeline_stage_defaults() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_pipeline_stage_defaults() FROM anon;
REVOKE ALL ON FUNCTION public.apply_pipeline_stage_defaults() FROM authenticated;

-- ============================================================
-- END 015_patches_06_to_10_crm_pro.sql
-- ============================================================
