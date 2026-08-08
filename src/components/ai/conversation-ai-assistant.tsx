"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Send, WandSparkles, FileText, Target } from "lucide-react";
import { toast } from "sonner";
import type { AIAnalysisResult } from "@/types";

export function ConversationAIAssistant({ conversationId, contactId, onSendReply }: {
  conversationId: string;
  contactId: string;
  onSendReply: (text: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [summary, setSummary] = useState("");
  const [reply, setReply] = useState("");

  async function run(action: "analyze" | "summarize" | "suggest_reply") {
    setLoading(action);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, conversation_id: conversationId, contact_id: contactId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "AI request failed");
      if (body.analysis) {
        setAnalysis(body.analysis);
        setSummary(body.analysis.summary ?? "");
        setReply(body.analysis.suggested_reply ?? "");
      }
      if (body.summary) setSummary(body.summary);
      if (body.reply) setReply(body.reply);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI request failed");
    } finally {
      setLoading(null);
    }
  }

  async function sendReply() {
    if (!reply.trim()) return;
    await onSendReply(reply.trim());
    toast.success("AI suggestion sent");
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-violet-300 hover:text-violet-200" />}>
        <Sparkles className="h-4 w-4" /> AI
      </DialogTrigger>
      <DialogContent className="border-slate-700 bg-slate-900 text-slate-100 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white"><Sparkles className="h-4 w-4 text-violet-300" /> AI CRM Assistant</DialogTitle>
          <DialogDescription className="text-slate-400">Review generated content before sending. Analysis is based on this conversation and your active knowledge-base articles.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => run("analyze")} disabled={!!loading} className="border-slate-700">
            {loading === "analyze" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />} Analyze lead
          </Button>
          <Button size="sm" variant="outline" onClick={() => run("summarize")} disabled={!!loading} className="border-slate-700">
            {loading === "summarize" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Summarize
          </Button>
          <Button size="sm" variant="outline" onClick={() => run("suggest_reply")} disabled={!!loading} className="border-slate-700">
            {loading === "suggest_reply" ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />} Suggest reply
          </Button>
        </div>

        {analysis && (
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <div><p className="text-xs uppercase text-slate-500">Intent</p><p className="mt-1 font-medium text-white">{analysis.intent}</p></div>
            <div><p className="text-xs uppercase text-slate-500">Lead score</p><p className="mt-1 font-medium text-white">{analysis.lead_score}/100</p></div>
          </div>
        )}
        {summary && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-slate-500">Summary</p>
            <div className="whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">{summary}</div>
          </div>
        )}
        {reply && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-slate-500">Suggested reply</p>
            <Textarea value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-28 border-slate-700 bg-slate-800 text-white" />
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={sendReply}><Send className="h-4 w-4" /> Send reviewed reply</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
