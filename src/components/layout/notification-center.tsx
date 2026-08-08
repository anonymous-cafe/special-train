"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, CheckCircle2, Clock3, Loader2, Radio, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Notice = { id: string; type: "task" | "broadcast" | "automation"; title: string; detail: string; href: string };

export function NotificationCenter() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotices = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const [taskRes, broadcastRes, automationRes] = await Promise.all([
      supabase.from("crm_tasks").select("id,title,due_at,priority,status").eq("user_id", user.id).in("status", ["open", "in_progress"]).lte("due_at", nextDay).order("due_at").limit(8),
      supabase.from("broadcasts").select("id,name,failed_count,status").eq("user_id", user.id).gt("failed_count", 0).order("created_at", { ascending: false }).limit(4),
      supabase.from("automation_logs").select("id,trigger_event,error_message,created_at,status").eq("user_id", user.id).eq("status", "failed").order("created_at", { ascending: false }).limit(4),
    ]);
    const next: Notice[] = [];
    for (const task of taskRes.data ?? []) {
      const overdue = task.due_at && new Date(task.due_at).getTime() < now.getTime();
      next.push({ id: `task-${task.id}`, type: "task", title: overdue ? `Overdue: ${task.title}` : task.title, detail: task.due_at ? new Date(task.due_at).toLocaleString() : "Follow-up due", href: "/tasks" });
    }
    for (const b of broadcastRes.data ?? []) next.push({ id: `broadcast-${b.id}`, type: "broadcast", title: `${b.name}: ${b.failed_count} failed`, detail: "Review failed recipients and retry if appropriate.", href: `/broadcasts/${b.id}` });
    for (const a of automationRes.data ?? []) next.push({ id: `automation-${a.id}`, type: "automation", title: `Automation failed: ${a.trigger_event}`, detail: a.error_message || "Review the automation log.", href: "/automations" });
    setNotices(next.slice(0, 12));
    setLoading(false);
  }, [user]);

  useEffect(() => { void fetchNotices(); }, [fetchNotices]);
  const count = useMemo(() => notices.length, [notices]);

  const iconFor = (type: Notice["type"]) => type === "broadcast" ? Radio : type === "automation" ? Zap : Clock3;

  return (
    <Popover>
      <PopoverTrigger onClick={() => void fetchNotices()} className="relative grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Notifications">
        <Bell className="size-4" />
        {count > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{count > 9 ? "9+" : count}</span>}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,390px)] border-slate-700 bg-slate-900 p-0 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><div><p className="text-sm font-semibold text-white">Notification Center</p><p className="text-[11px] text-slate-500">Follow-ups and operational alerts</p></div>{count === 0 && <CheckCircle2 className="size-4 text-emerald-400" />}</div>
        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-primary" /></div> : notices.length === 0 ? <div className="px-4 py-10 text-center"><CheckCircle2 className="mx-auto size-8 text-emerald-500/50" /><p className="mt-2 text-sm text-slate-400">No urgent items.</p></div> : notices.map((notice) => { const Icon=iconFor(notice.type); return <Link key={notice.id} href={notice.href} className="flex gap-3 rounded-xl p-3 hover:bg-slate-800"><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${notice.type === 'task' ? 'bg-amber-500/10 text-amber-300' : notice.type === 'broadcast' ? 'bg-cyan-500/10 text-cyan-300' : 'bg-red-500/10 text-red-300'}`}><Icon className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-semibold text-white">{notice.title}</span><span className="mt-1 block line-clamp-2 text-[11px] leading-4 text-slate-500">{notice.detail}</span></span></Link> })}
        </div>
        <div className="border-t border-slate-800 px-3 py-2"><Link href="/tasks" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"><AlertTriangle className="size-3.5" /> Open follow-up queue</Link></div>
      </PopoverContent>
    </Popover>
  );
}
