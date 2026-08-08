"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Plus, ShieldCheck, Trash2, UserRoundCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { AgentRole, AgentStatus, CrmAgent } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeamPanel() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<CrmAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AgentRole>("agent");

  const fetchAgents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("crm_agents")
      .select("*")
      .eq("user_id", user.id)
      .order("status", { ascending: true })
      .order("name");
    if (error) toast.error(`Could not load team: ${error.message}`);
    setAgents((data ?? []) as CrmAgent[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchAgents();
  }, [fetchAgents]);

  async function addAgent(event: FormEvent) {
    event.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("crm_agents").insert({
      user_id: user.id,
      name: name.trim(),
      email: email.trim() || null,
      role,
      status: "active",
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Team member added to the CRM directory");
      setName("");
      setEmail("");
      setRole("agent");
      await fetchAgents();
    }
    setSaving(false);
  }

  async function updateAgent(agent: CrmAgent, patch: Partial<Pick<CrmAgent, "role" | "status">>) {
    const supabase = createClient();
    const { error } = await supabase.from("crm_agents").update(patch).eq("id", agent.id);
    if (error) toast.error(error.message);
    else await fetchAgents();
  }

  async function removeAgent(agent: CrmAgent) {
    if (!confirm(`Remove ${agent.name} from the CRM team directory?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("crm_agents").delete().eq("id", agent.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Team member removed");
      await fetchAgents();
    }
  }

  return (
    <div className="mt-4 grid gap-6 xl:grid-cols-[360px_1fr]">
      <form onSubmit={addAgent} className="h-fit space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-2">
          <UsersRound className="size-5 text-primary" />
          <div>
            <h2 className="font-semibold text-white">Team directory</h2>
            <p className="text-xs text-slate-500">Add assignable agents and roles.</p>
          </div>
        </div>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team member name" required className="border-slate-700 bg-slate-950 text-white" />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (optional)" className="border-slate-700 bg-slate-950 text-white" />
        <select value={role} onChange={(e) => setRole(e.target.value as AgentRole)} className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200">
          <option value="agent">Agent</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" disabled={saving || !name.trim()} className="w-full">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add team member
        </Button>
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[.06] p-3 text-xs leading-5 text-amber-100/70">
          <strong className="text-amber-200">Current scope:</strong> this is the safe CRM assignment directory. Shared authenticated workspace access and production RBAC will be finalized in Patch-13 so the existing user-scoped RLS is not weakened early.
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">Agents & roles</h2>
            <p className="mt-0.5 text-xs text-slate-500">Used by Inbox assignment and Tasks.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{agents.filter((a) => a.status === "active").length} active</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-primary" /></div>
        ) : agents.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">No team members yet.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {agents.map((agent) => (
              <div key={agent.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><UserRoundCheck className="size-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-white">{agent.name}</p>{agent.role === "admin" && <ShieldCheck className="size-3.5 text-amber-300" />}</div>
                  <p className="truncate text-xs text-slate-500">{agent.email || "No email"}</p>
                </div>
                <select value={agent.role} onChange={(e) => void updateAgent(agent, { role: e.target.value as AgentRole })} className="h-8 rounded-lg border border-slate-700 bg-slate-950 px-2 text-xs text-slate-300">
                  <option value="agent">Agent</option><option value="manager">Manager</option><option value="admin">Admin</option>
                </select>
                <select value={agent.status} onChange={(e) => void updateAgent(agent, { status: e.target.value as AgentStatus })} className="h-8 rounded-lg border border-slate-700 bg-slate-950 px-2 text-xs text-slate-300">
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
                <button type="button" onClick={() => void removeAgent(agent)} className="grid size-8 place-items-center rounded-lg text-slate-600 hover:bg-red-500/10 hover:text-red-300" aria-label={`Remove ${agent.name}`}><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
