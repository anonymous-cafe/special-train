"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Loader2, MessageSquare, Search, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

type Result = {
  id: string;
  kind: "contact" | "conversation" | "deal";
  title: string;
  subtitle: string;
  href: string;
};

export function GlobalSearch() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const normalized = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!user || normalized.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const safe = normalized.replace(/[%_]/g, "");
      const [contactsRes, dealsRes] = await Promise.all([
        supabase
          .from("contacts")
          .select("id,name,phone,email,company")
          .eq("user_id", user.id)
          .or(`name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%,company.ilike.%${safe}%`)
          .limit(6),
        supabase
          .from("deals")
          .select("id,title,value,currency,conversation_id,contact_id")
          .eq("user_id", user.id)
          .ilike("title", `%${safe}%`)
          .limit(5),
      ]);
      if (cancelled) return;

      const contactResults: Result[] = (contactsRes.data ?? []).map((contact) => ({
        id: contact.id,
        kind: "contact",
        title: contact.name || contact.phone,
        subtitle: [contact.phone, contact.company].filter(Boolean).join(" · "),
        href: `/contacts?contact=${contact.id}`,
      }));
      const dealResults: Result[] = (dealsRes.data ?? []).map((deal) => ({
        id: deal.id,
        kind: "deal",
        title: deal.title,
        subtitle: `${deal.currency || "$"}${Number(deal.value || 0).toLocaleString()}`,
        href: deal.conversation_id ? `/inbox?c=${deal.conversation_id}` : "/pipelines",
      }));
      setResults([...contactResults, ...dealResults]);
      setLoading(false);
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [normalized, user]);


  const openResult = (result: Result) => {
    setQuery("");
    if (result.kind === "contact" && window.location.pathname === "/contacts") {
      window.location.assign(result.href);
      return;
    }
    router.push(result.href);
  };

  const iconFor = (kind: Result["kind"]) => {
    if (kind === "deal") return BriefcaseBusiness;
    if (kind === "conversation") return MessageSquare;
    return UserRound;
  };

  return (
    <Popover>
      <PopoverTrigger className="hidden h-9 w-64 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 text-left text-sm text-slate-500 transition hover:border-slate-700 hover:text-slate-300 md:flex xl:w-80">
        <Search className="size-4" />
        <span className="flex-1">Search CRM…</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,420px)] border-slate-700 bg-slate-900 p-3 text-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contacts or deals" className="h-10 border-slate-700 bg-slate-950 pl-9 text-white" />
        </div>
        <div className="mt-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="size-5 animate-spin text-primary" /></div>
          ) : normalized.length < 2 ? (
            <p className="px-2 py-6 text-center text-xs text-slate-500">Type at least 2 characters.</p>
          ) : results.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-slate-500">No matching CRM records.</p>
          ) : (
            <div className="space-y-1">
              {results.map((result) => {
                const Icon = iconFor(result.kind);
                return (
                  <button key={`${result.kind}-${result.id}`} type="button" onClick={() => openResult(result)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-800">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{result.title}</span><span className="block truncate text-xs text-slate-500">{result.subtitle}</span></span>
                    <span className="text-[10px] uppercase text-slate-600">{result.kind}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
