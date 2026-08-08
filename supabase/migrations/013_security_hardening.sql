-- ============================================================
-- Security hardening for server-managed CRM data.
-- Idempotent — safe to run after migrations 001-012.
-- ============================================================

-- The service role bypasses RLS automatically. The old policy below was
-- named for service_role but had no TO clause, so WITH CHECK (true) applied
-- to every role with INSERT privileges. Remove it.
DROP POLICY IF EXISTS "Service role can insert messages" ON messages;

-- Messages are created by trusted server routes / webhook / engines. Browser
-- sessions only need to read them. This prevents a signed-in user from
-- forging message history through the Supabase REST endpoint.
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

-- Automation audit logs are also server-managed. The previous FOR ALL policy
-- let a user edit/delete their own audit history, weakening diagnostics.
DROP POLICY IF EXISTS "Users can view own automation logs" ON automation_logs;
CREATE POLICY "Users can view own automation logs" ON automation_logs FOR SELECT
  USING (auth.uid() = user_id);

-- SECURITY DEFINER helpers are intended for triggers / server-side operations,
-- not public PostgREST RPC calls. Lock direct execution down explicitly.
REVOKE ALL ON FUNCTION public.recompute_broadcast_counts(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recompute_broadcast_counts(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.recompute_broadcast_counts(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_broadcast_counts(UUID) TO service_role;

REVOKE ALL ON FUNCTION public._bcast_bump(UUID, TEXT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._bcast_bump(UUID, TEXT, INT) FROM anon;
REVOKE ALL ON FUNCTION public._bcast_bump(UUID, TEXT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public._bcast_bump(UUID, TEXT, INT) TO service_role;

REVOKE ALL ON FUNCTION public.broadcast_recipient_aggregate_trigger() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.broadcast_recipient_aggregate_trigger() FROM anon;
REVOKE ALL ON FUNCTION public.broadcast_recipient_aggregate_trigger() FROM authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM authenticated;
