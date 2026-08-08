"use client";

import { useState, useRef, useCallback, useEffect, useMemo, KeyboardEvent } from "react";
import { Send, LayoutTemplate, Zap, Paperclip, ImageIcon, FileText, Video, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import type { MediaLibraryItem, QuickReply } from "@/types";
import { cn } from "@/lib/utils";
import { ReplyQuote } from "./reply-quote";

interface ReplyDraft {
  id: string;
  authorLabel: string;
  preview: string;
}

interface MessageComposerProps {
  conversationId: string;
  sessionExpired: boolean;
  onSend: (text: string, replyToId?: string) => void;
  onSendMedia?: (item: MediaLibraryItem, replyToId?: string) => void;
  onOpenTemplates: () => void;
  replyTo?: ReplyDraft | null;
  onClearReply?: () => void;
}

function MediaIcon({ type }: { type: MediaLibraryItem["media_type"] }) {
  if (type === "image") return <ImageIcon className="h-4 w-4" />;
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "audio") return <AudioLines className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export function MessageComposer({
  conversationId,
  sessionExpired,
  onSend,
  onSendMedia,
  onOpenTemplates,
  replyTo,
  onClearReply,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaLibraryItem[]>([]);
  const [quickOpen, setQuickOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    Promise.all([
      supabase.from("quick_replies").select("*").order("shortcut"),
      supabase.from("media_library").select("*").order("created_at", { ascending: false }),
    ]).then(([replies, media]) => {
      if (cancelled) return;
      setQuickReplies((replies.data ?? []) as QuickReply[]);
      setMediaItems((media.data ?? []) as MediaLibraryItem[]);
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const slashMatches = useMemo(() => {
    if (!text.startsWith("/")) return [];
    const query = text.slice(1).trim().toLowerCase();
    return quickReplies
      .filter((item) => !query || item.shortcut.toLowerCase().includes(query) || item.title.toLowerCase().includes(query))
      .slice(0, 6);
  }, [quickReplies, text]);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || sessionExpired) return;
    setSending(true);
    try {
      onSend(trimmed, replyTo?.id);
      setText("");
      setQuickOpen(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } finally {
      setSending(false);
    }
  }, [text, sending, sessionExpired, onSend, replyTo?.id]);

  const applyQuickReply = useCallback((item: QuickReply) => {
    setText(item.body);
    setQuickOpen(false);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      adjustHeight();
    });
  }, [adjustHeight]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (slashMatches.length > 0 && text.startsWith("/")) {
          applyQuickReply(slashMatches[0]);
          return;
        }
        void handleSend();
      }
      if (e.key === "Escape") setQuickOpen(false);
    },
    [applyQuickReply, handleSend, slashMatches, text]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      setText(next);
      setQuickOpen(next.startsWith("/"));
      adjustHeight();
    },
    [adjustHeight]
  );

  return (
    <div className="relative border-t border-slate-800 bg-slate-900 p-3">
      {replyTo && (
        <div className="mb-2">
          <ReplyQuote authorLabel={replyTo.authorLabel} preview={replyTo.preview} onDismiss={onClearReply} />
        </div>
      )}

      {quickOpen && slashMatches.length > 0 && !sessionExpired && (
        <div className="absolute bottom-[76px] left-14 z-30 w-[min(420px,calc(100%-5rem))] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-800 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Quick replies</div>
          {slashMatches.map((item) => (
            <button key={item.id} type="button" onClick={() => applyQuickReply(item)} className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-slate-800">
              <code className="mt-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">/{item.shortcut}</code>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="truncate text-xs text-slate-500">{item.body}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {sessionExpired && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2">
          <p className="text-xs text-amber-400">24-hour session expired. Use a template to re-engage.</p>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-400 hover:text-amber-300" onClick={onOpenTemplates}>
            <LayoutTemplate className="mr-1 h-3 w-3" /> Templates
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Button variant="ghost" size="sm" className="h-9 w-9 shrink-0 p-0 text-slate-400 hover:text-white" onClick={onOpenTemplates} title="Send template">
          <LayoutTemplate className="h-4 w-4" />
        </Button>

        <Popover open={quickOpen && !text.startsWith("/")} onOpenChange={(open) => { if (!text.startsWith("/")) setQuickOpen(open); }}>
          <PopoverTrigger className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white" title="Quick replies">
            <Zap className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent align="start" side="top" className="w-80 p-1">
            {quickReplies.length === 0 ? (
              <p className="p-3 text-xs text-slate-500">Create quick replies in Settings → Inbox Tools.</p>
            ) : quickReplies.map((item) => (
              <button key={item.id} type="button" onClick={() => applyQuickReply(item)} className="w-full rounded-md px-3 py-2 text-left hover:bg-slate-800">
                <div className="flex items-center gap-2"><span className="text-sm font-medium text-white">{item.title}</span><code className="text-xs text-primary">/{item.shortcut}</code></div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{item.body}</p>
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {onSendMedia && (
          <Popover open={mediaOpen} onOpenChange={setMediaOpen}>
            <PopoverTrigger className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white" title="Media library">
              <Paperclip className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent align="start" side="top" className="w-80 p-1">
              {mediaItems.length === 0 ? (
                <p className="p-3 text-xs text-slate-500">Add public media URLs in Settings → Inbox Tools.</p>
              ) : mediaItems.map((item) => (
                <button key={item.id} type="button" disabled={sessionExpired} onClick={() => { onSendMedia(item, replyTo?.id); setMediaOpen(false); }} className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-slate-800 disabled:opacity-40">
                  <span className="mt-0.5 text-primary"><MediaIcon type={item.media_type} /></span>
                  <div className="min-w-0"><p className="text-sm font-medium text-white">{item.name}</p><p className="truncate text-xs text-slate-500">{item.caption || item.media_url}</p></div>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={sessionExpired ? "Session expired - use a template" : "Type a message... (use / for quick replies)"}
          disabled={sessionExpired}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-primary/50",
            sessionExpired && "cursor-not-allowed opacity-50"
          )}
        />

        <Button size="sm" className="h-9 w-9 shrink-0 bg-primary p-0 hover:bg-primary/90 disabled:opacity-40" disabled={!text.trim() || sessionExpired || sending} onClick={() => void handleSend()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-1 pl-[132px] text-[10px] text-slate-600">Enter to send · Shift+Enter for a new line</p>
    </div>
  );
}
