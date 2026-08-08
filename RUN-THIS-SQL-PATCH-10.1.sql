-- ============================================================
-- GrowthSprint365 — Patch 10.1 Core CRM
-- Tasks, team directory/assignment, activity support, WhatsApp
-- coexistence metadata, and production-ready indexes.
-- Idempotent: safe to run more than once.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- TEAM DIRECTORY
-- This is intentionally owner-scoped. It provides CRM agent records for
-- assignments without weakening the existing per-user RLS model.
-- Production shared-workspace RBAC is reserved for Patch 13.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crm_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'agent',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT crm_agents_role_check CHECK (role IN ('admin', 'manager', 'agent')),
  CONSTRAINT crm_agents_status_check CHECK (status IN ('active', 'inactive'))
);
CREATE INDEX IF NOT EXISTS idx_crm_agents_user_status ON crm_agents(user_id, status, name);
ALTER TABLE crm_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own CRM agents" ON crm_agents;
CREATE POLICY "Users can manage own CRM agents" ON crm_agents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS set_updated_at ON crm_agents;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON crm_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Conversations already have assigned_agent_id. We keep it nullable and
-- owner-scoped; values point to crm_agents.id in the new UI.
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_agent
  ON conversations(user_id, assigned_agent_id);

-- ------------------------------------------------------------
-- TASKS & FOLLOW-UPS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  assigned_agent_id UUID REFERENCES crm_agents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT crm_tasks_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT crm_tasks_status_check CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'))
);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_user_status_due ON crm_tasks(user_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_contact ON crm_tasks(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assignee ON crm_tasks(user_id, assigned_agent_id, status);
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own CRM tasks" ON crm_tasks;
CREATE POLICY "Users can manage own CRM tasks" ON crm_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS set_updated_at ON crm_tasks;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON crm_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- CONTACT / CRM ACTIVITY TIMELINE
-- Explicit timeline entries are optional. The UI also composes messages,
-- notes, deals and tasks so historical data appears immediately.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crm_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL DEFAULT 'contact',
  entity_id UUID,
  action TEXT NOT NULL,
  title TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_activity_user_created ON crm_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activity_contact_created ON crm_activity(contact_id, created_at DESC);
ALTER TABLE crm_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own CRM activity" ON crm_activity;
CREATE POLICY "Users can manage own CRM activity" ON crm_activity FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- WHATSAPP COEXISTENCE / EMBEDDED SIGNUP METADATA
-- Tokens remain encrypted in access_token by the existing server API.
-- ------------------------------------------------------------
ALTER TABLE whatsapp_config
  ADD COLUMN IF NOT EXISTS connection_mode TEXT NOT NULL DEFAULT 'cloud_api';
ALTER TABLE whatsapp_config
  ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE whatsapp_config
  ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE whatsapp_config
  ADD COLUMN IF NOT EXISTS coexistence_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE whatsapp_config
  ADD COLUMN IF NOT EXISTS embedded_signup_status TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE whatsapp_config
  ADD COLUMN IF NOT EXISTS connection_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE whatsapp_config
  DROP CONSTRAINT IF EXISTS whatsapp_config_connection_mode_check;
ALTER TABLE whatsapp_config
  ADD CONSTRAINT whatsapp_config_connection_mode_check
    CHECK (connection_mode IN ('cloud_api', 'coexistence'));
ALTER TABLE whatsapp_config
  DROP CONSTRAINT IF EXISTS whatsapp_config_embedded_signup_status_check;
ALTER TABLE whatsapp_config
  ADD CONSTRAINT whatsapp_config_embedded_signup_status_check
    CHECK (embedded_signup_status IN ('not_started', 'pending', 'connected', 'failed', 'disconnected'));

-- ------------------------------------------------------------
-- SEED CURRENT USER AS TEAM DIRECTORY ENTRY (run for every existing user)
-- ------------------------------------------------------------

-- Keep the directory ready for users created after this migration.
CREATE OR REPLACE FUNCTION public.ensure_owner_crm_agent()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.crm_agents (user_id, name, email, role, status)
  SELECT NEW.user_id,
         COALESCE(NULLIF(NEW.full_name, ''), split_part(NEW.email, '@', 1), 'Owner'),
         NEW.email,
         'admin',
         'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.crm_agents a
    WHERE a.user_id = NEW.user_id
      AND lower(COALESCE(a.email, '')) = lower(COALESCE(NEW.email, ''))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_profiles_ensure_owner_crm_agent ON profiles;
CREATE TRIGGER trg_profiles_ensure_owner_crm_agent
  AFTER INSERT OR UPDATE OF full_name, email ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_owner_crm_agent();

REVOKE ALL ON FUNCTION public.ensure_owner_crm_agent() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_owner_crm_agent() FROM anon;
REVOKE ALL ON FUNCTION public.ensure_owner_crm_agent() FROM authenticated;

INSERT INTO crm_agents (user_id, name, email, role, status)
SELECT p.user_id,
       COALESCE(NULLIF(p.full_name, ''), split_part(p.email, '@', 1), 'Owner'),
       p.email,
       'admin',
       'active'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM crm_agents a WHERE a.user_id = p.user_id AND lower(COALESCE(a.email, '')) = lower(COALESCE(p.email, ''))
);

-- Older builds stored the authenticated profile/user UUID directly in
-- conversations.assigned_agent_id. Convert that owner assignment to the new
-- CRM agent-directory UUID so existing assignments remain visible.
UPDATE conversations c
SET assigned_agent_id = a.id
FROM crm_agents a
WHERE a.user_id = c.user_id
  AND a.role = 'admin'
  AND a.status = 'active'
  AND c.assigned_agent_id = c.user_id;

-- ------------------------------------------------------------
-- REALTIME: safe additions; repeated calls are ignored by exception block.
-- ------------------------------------------------------------
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE crm_tasks; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE crm_activity; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ============================================================
-- END Patch 10.1
-- ============================================================
