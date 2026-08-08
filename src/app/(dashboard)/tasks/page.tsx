"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow, isBefore } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Contact, CrmAgent, CrmTask, CrmTaskPriority, CrmTaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const priorityClasses: Record<CrmTaskPriority, string> = {
  low: "border-slate-700 bg-slate-800/60 text-slate-300",
  normal: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  high: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  urgent: "border-red-500/20 bg-red-500/10 text-red-300",
};

function toIso(localValue: string) {
  return localValue ? new Date(localValue).toISOString() : null;
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [agents, setAgents] = useState<CrmAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"active" | "completed" | "all">("active");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactId, setContactId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<CrmTaskPriority>("normal");

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    const [taskRes, contactRes, agentRes] = await Promise.all([
      supabase
        .from("crm_tasks")
        .select("*, contact:contacts(id,name,phone,company), assignee:crm_agents(id,name,email,role,status,user_id,created_at,updated_at)")
        .eq("user_id", user.id)
        .order("status", { ascending: true })
        .order("due_at", { ascending: true, nullsFirst: false }),
      supabase.from("contacts").select("*").eq("user_id", user.id).order("name"),
      supabase.from("crm_agents").select("*").eq("user_id", user.id).eq("status", "active").order("name"),
    ]);

    if (taskRes.error) toast.error(taskRes.error.message);
    setTasks((taskRes.data ?? []) as CrmTask[]);
    setContacts((contactRes.data ?? []) as Contact[]);
    setAgents((agentRes.data ?? []) as CrmAgent[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const visibleTasks = useMemo(() => {
    if (filter === "completed") return tasks.filter((task) => task.status === "completed");
    if (filter === "active") return tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled");
    return tasks;
  }, [filter, tasks]);

  const stats = useMemo(() => {
    const now = new Date();
    const active = tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled");
    return {
      open: active.length,
      overdue: active.filter((task) => task.due_at && isBefore(new Date(task.due_at), now)).length,
      completed: tasks.filter((task) => task.status === "completed").length,
    };
  }, [tasks]);

  async function createTask(event: FormEvent) {
    event.preventDefault();
    if (!user || !title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("crm_tasks").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      contact_id: contactId || null,
      assigned_agent_id: agentId || null,
      due_at: toIso(dueAt),
      priority,
      status: "open",
    });
    if (error) {
      toast.error(`Could not create task: ${error.message}`);
    } else {
      toast.success("Follow-up task created");
      setTitle("");
      setDescription("");
      setContactId("");
      setAgentId("");
      setDueAt("");
      setPriority("normal");
      await fetchData();
    }
    setSaving(false);
  }

  async function setStatus(task: CrmTask, status: CrmTaskStatus) {
    const supabase = createClient();
    const { error } = await supabase
      .from("crm_tasks")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", task.id);
    if (error) toast.error(error.message);
    else await fetchData();
  }

  async function deleteTask(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("crm_tasks").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Task deleted");
      await fetchData();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">GrowthSprint365 CRM</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Tasks & Follow-ups</h1>
          <p className="mt-1 text-sm text-slate-400">Keep every lead callback, reminder and next action visible.</p>
        </div>
        <Button variant="outline" onClick={() => void fetchData()} disabled={loading} className="border-slate-700 bg-slate-900 text-slate-200">
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {([
          { label: "Open follow-ups", value: stats.open, Icon: CalendarClock },
          { label: "Overdue", value: stats.overdue, Icon: Clock3 },
          { label: "Completed", value: stats.completed, Icon: CheckCircle2 },
        ] satisfies Array<{ label: string; value: number; Icon: LucideIcon }>).map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{label}</p>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={createTask} className="h-fit space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <h2 className="font-semibold text-white">New follow-up</h2>
          </div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call about proposal" required className="border-slate-700 bg-slate-950 text-white" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes for the next action" className="min-h-24 border-slate-700 bg-slate-950 text-white" />
          <select value={contactId} onChange={(e) => setContactId(e.target.value)} className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200">
            <option value="">No contact linked</option>
            {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name || contact.phone}</option>)}
          </select>
          <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200">
            <option value="">Unassigned</option>
            {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} · {agent.role}</option>)}
          </select>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Due date & time</label>
              <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="border-slate-700 bg-slate-950 text-white [color-scheme:dark]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as CrmTaskPriority)} className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <Button type="submit" disabled={saving || !title.trim()} className="w-full">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create task
          </Button>
        </form>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-white">Follow-up queue</h2>
            <div className="flex rounded-lg border border-slate-700 bg-slate-950 p-1">
              {(["active", "completed", "all"] as const).map((value) => (
                <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${filter === value ? "bg-primary text-primary-foreground" : "text-slate-400 hover:text-white"}`}>
                  {value}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : visibleTasks.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <CheckCircle2 className="mx-auto size-9 text-slate-700" />
              <p className="mt-3 text-sm font-medium text-slate-300">Nothing in this queue</p>
              <p className="mt-1 text-xs text-slate-500">Create a follow-up from the form to keep work moving.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {visibleTasks.map((task) => {
                const overdue = task.status !== "completed" && task.due_at && isBefore(new Date(task.due_at), new Date());
                return (
                  <article key={task.id} className="p-4 transition hover:bg-slate-800/30">
                    <div className="flex items-start gap-3">
                      <button type="button" onClick={() => void setStatus(task, task.status === "completed" ? "open" : "completed")} className="mt-0.5 text-slate-500 hover:text-primary" aria-label={task.status === "completed" ? "Reopen task" : "Complete task"}>
                        {task.status === "completed" ? <CheckCircle2 className="size-5 text-emerald-400" /> : <Circle className="size-5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`font-medium ${task.status === "completed" ? "text-slate-500 line-through" : "text-white"}`}>{task.title}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityClasses[task.priority]}`}>{task.priority}</span>
                          {overdue && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">Overdue</span>}
                        </div>
                        {task.description && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{task.description}</p>}
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          {task.due_at && <span className="flex items-center gap-1"><Clock3 className="size-3.5" /> {format(new Date(task.due_at), "MMM d, yyyy · h:mm a")} ({formatDistanceToNow(new Date(task.due_at), { addSuffix: true })})</span>}
                          {task.contact && <span>{task.contact.name || task.contact.phone}</span>}
                          {task.assignee && <span className="flex items-center gap-1"><UserRound className="size-3.5" /> {task.assignee.name}</span>}
                        </div>
                      </div>
                      <button type="button" onClick={() => void deleteTask(task.id)} className="rounded-md p-2 text-slate-600 hover:bg-red-500/10 hover:text-red-300" aria-label="Delete task"><Trash2 className="size-4" /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
