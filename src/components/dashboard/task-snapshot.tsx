"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isBefore } from "date-fns";
import { ArrowRight, CheckCircle2, Clock3, ListTodo, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CrmTask } from "@/types";

export function TaskSnapshot() {
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("crm_tasks")
      .select("*, contact:contacts(id,name,phone)")
      .in("status", ["open", "in_progress"])
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(5)
      .then(({ data }) => {
        if (!cancelled) {
          setTasks((data ?? []) as CrmTask[]);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><ListTodo className="size-4" /></span><div><h2 className="text-sm font-semibold text-white">Next follow-ups</h2><p className="text-[11px] text-slate-500">Your nearest CRM tasks</p></div></div>
        <Link href="/tasks" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80">All tasks <ArrowRight className="size-3.5" /></Link>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-primary" /></div> : tasks.length === 0 ? <div className="px-5 py-10 text-center"><CheckCircle2 className="mx-auto size-7 text-emerald-500/50" /><p className="mt-2 text-sm text-slate-500">No open follow-ups.</p></div> : <div className="grid gap-0 divide-y divide-slate-800 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-5">{tasks.map((task) => { const overdue = task.due_at && isBefore(new Date(task.due_at), new Date()); return <div key={task.id} className="p-4"><div className="flex items-start justify-between gap-2"><p className="line-clamp-2 text-xs font-semibold text-slate-200">{task.title}</p>{overdue && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-300">OVERDUE</span>}</div><p className="mt-2 truncate text-[10px] text-slate-500">{task.contact?.name || task.contact?.phone || "General task"}</p>{task.due_at && <p className={`mt-2 flex items-center gap-1 text-[10px] ${overdue ? "text-red-300" : "text-slate-400"}`}><Clock3 className="size-3" />{format(new Date(task.due_at), "MMM d · h:mm a")}</p>}</div>})}</div>}
    </section>
  );
}
