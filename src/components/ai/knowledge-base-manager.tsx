"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeBaseArticle } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Loader2, Plus, Trash2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function KnowledgeBaseManager() {
  const [items, setItems] = useState<KnowledgeBaseArticle[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("knowledge_base_articles")
      .select("*")
      .order("updated_at", { ascending: false });
    setItems((data ?? []) as KnowledgeBaseArticle[]);
  }, []);

  useEffect(() => {
    void load();
    void fetch("/api/ai/status")
      .then((r) => r.json())
      .then((body) => {
        setConfigured(Boolean(body.configured));
        setModel(body.model ?? null);
      })
      .catch(() => setConfigured(false));
  }, [load]);

  async function addArticle() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("knowledge_base_articles").insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        is_active: true,
      });
      if (error) throw error;
      setTitle("");
      setContent("");
      await load();
      toast.success("Knowledge article added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save article");
    } finally {
      setSaving(false);
    }
  }

  async function updateArticle(id: string, patch: Partial<KnowledgeBaseArticle>) {
    const supabase = createClient();
    const { error } = await supabase
      .from("knowledge_base_articles")
      .update(patch)
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  async function deleteArticle(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("knowledge_base_articles").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Article deleted");
  }

  async function askKnowledgeBase() {
    if (!question.trim()) return;
    setAsking(true);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "knowledge_answer", question: question.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "AI request failed");
      setAnswer(body.answer ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI request failed");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">AI Provider</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {configured === null
                ? "Checking configuration…"
                : configured
                  ? `Connected${model ? ` · ${model}` : ""}`
                  : "Not configured — add AI_API_URL, AI_API_KEY and AI_MODEL to .env.local."}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${configured ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
            {configured ? "Ready" : "Setup required"}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
        <h2 className="font-semibold text-white">Knowledge Base Chat Test</h2>
        <p className="mt-1 text-sm text-slate-400">Ask a question to verify what the AI can answer from active articles.</p>
        <div className="mt-3 flex gap-2">
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. What is our delivery policy?" className="border-slate-700 bg-slate-800 text-white" />
          <Button onClick={askKnowledgeBase} disabled={asking || !question.trim() || configured === false}>
            {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Ask
          </Button>
        </div>
        {answer && <div className="mt-3 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm leading-6 text-slate-300">{answer}</div>}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-white">Knowledge Base</h2>
        </div>
        <p className="mt-1 text-sm text-slate-400">Add business facts, FAQs, product information and policies that the AI may use when preparing answers.</p>
        <div className="mt-4 grid gap-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" className="border-slate-700 bg-slate-800 text-white" />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the trusted business information here…" className="min-h-32 border-slate-700 bg-slate-800 text-white" />
          <Button onClick={addArticle} disabled={saving || !title.trim() || !content.trim()} className="w-fit">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add article
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">No knowledge articles yet.</div>
        ) : items.map((item) => (
          <ArticleRow key={item.id} item={item} onUpdate={updateArticle} onDelete={deleteArticle} />
        ))}
      </div>
    </div>
  );
}

function ArticleRow({ item, onUpdate, onDelete }: {
  item: KnowledgeBaseArticle;
  onUpdate: (id: string, patch: Partial<KnowledgeBaseArticle>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onUpdate(item.id, { title: title.trim(), content: content.trim() });
    setSaving(false);
    toast.success("Article saved");
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="border-slate-700 bg-slate-800 font-medium text-white" />
        <div className="flex items-center gap-2 text-xs text-slate-400">
          Active
          <Switch checked={item.is_active} onCheckedChange={(value) => void onUpdate(item.id, { is_active: Boolean(value) })} />
        </div>
      </div>
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-3 min-h-28 border-slate-700 bg-slate-800 text-white" />
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => void onDelete(item.id)} className="border-slate-700 text-slate-300">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
        <Button size="sm" onClick={save} disabled={saving || !title.trim() || !content.trim()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </Button>
      </div>
    </div>
  );
}
