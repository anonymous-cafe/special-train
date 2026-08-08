"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { BriefcaseBusiness, CheckCircle2, Loader2, MessageSquare, NotebookPen, PhoneCall, Tag, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CrmActivity, CrmTask, Deal, Message, ContactNote } from "@/types";

type TimelineItem = {
  id: string;
  at: string;
  type: "message" | "note" | "deal" | "task" | "activity";
  title: string;
  detail?: string;
};

export function ContactActivityTimeline({ contactId }: { contactId: string }) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [convRes, notesRes, dealsRes, tasksRes, activityRes] = await Promise.all([
      supabase.from("conversations").select("id").eq("contact_id", contactId),
      supabase.from("contact_notes").select("*").eq("contact_id", contactId).order("created_at", { ascending: false }).limit(30),
      supabase.from("deals").select("*, stage:pipeline_stages(*)").eq("contact_id", contactId).order("created_at", { ascending: false }).limit(20),
      supabase.from("crm_tasks").select("*").eq("contact_id", contactId).order("created_at", { ascending: false }).limit(30),
      supabase.from("crm_activity").select("*").eq("contact_id", contactId).order("created_at", { ascending: false }).limit(30),
    ]);
    const conversationIds = (convRes.data ?? []).map((row) => row.id);
    let messages: Message[] = [];
    if (conversationIds.length > 0) {
      const msgRes = await supabase.from("messages").select("*").in("conversation_id", conversationIds).order("created_at", { ascending: false }).limit(40);
      messages = (msgRes.data ?? []) as Message[];
    }

    const next: TimelineItem[] = [];
    for (const msg of messages) next.push({ id: `msg-${msg.id}`, at: msg.created_at, type: "message", title: msg.sender_type === "customer" ? "Customer message" : msg.sender_type === "bot" ? "Automation / bot message" : "Agent reply", detail: msg.content_text || msg.template_name || msg.content_type });
    for (const note of (notesRes.data ?? []) as ContactNote[]) next.push({ id: `note-${note.id}`, at: note.created_at, type: "note", title: "Internal note", detail: note.note_text });
    for (const deal of (dealsRes.data ?? []) as Deal[]) next.push({ id: `deal-${deal.id}`, at: deal.created_at, type: "deal", title: `Deal: ${deal.title}`, detail: `${deal.currency || "$"}${Number(deal.value || 0).toLocaleString()}${deal.stage?.name ? ` · ${deal.stage.name}` : ""}` });
    for (const task of (tasksRes.data ?? []) as CrmTask[]) next.push({ id: `task-${task.id}`, at: task.created_at, type: "task", title: task.status === "completed" ? `Completed task: ${task.title}` : `Follow-up: ${task.title}`, detail: task.due_at ? `Due ${format(new Date(task.due_at), "MMM d, h:mm a")}` : undefined });
    for (const activity of (activityRes.data ?? []) as CrmActivity[]) next.push({ id: `activity-${activity.id}`, at: activity.created_at, type: "activity", title: activity.title, detail: typeof activity.details?.description === "string" ? activity.details.description : activity.action });
    next.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    setItems(next.slice(0, 80));
    setLoading(false);
  }, [contactId]);

  useEffect(() => { void fetchTimeline(); }, [fetchTimeline]);
  const total = useMemo(() => items.length, [items]);

  const iconFor = (type: TimelineItem["type"]) => {
    if (type === "message") return MessageSquare;
    if (type === "note") return NotebookPen;
    if (type === "deal") return BriefcaseBusiness;
    if (type === "task") return CheckCircle2;
    return Zap;
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-primary" /></div>;
  if (items.length === 0) return <div className="py-10 text-center"><PhoneCall className="mx-auto size-7 text-slate-700" /><p className="mt-2 text-sm text-slate-500">No activity yet.</p></div>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer timeline</p><span className="text-[10px] text-slate-600">{total} events</span></div>
      <div className="relative space-y-1 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-slate-800">
        {items.map((item) => {
          const Icon = iconFor(item.type);
          return (
            <div key={item.id} className="relative flex gap-3 rounded-xl p-2.5 hover:bg-slate-800/30">
              <span className="z-10 grid size-8 shrink-0 place-items-center rounded-full border border-slate-700 bg-slate-900 text-slate-400"><Icon className="size-3.5" /></span>
              <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold text-slate-200">{item.title}</p><time className="shrink-0 text-[9px] text-slate-600">{format(new Date(item.at), "MMM d · h:mm a")}</time></div>{item.detail && <p className="mt-1 line-clamp-3 text-[11px] leading-5 text-slate-500">{item.detail}</p>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
