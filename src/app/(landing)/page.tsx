import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  GitBranch,
  Globe2,
  Inbox,
  Layers3,
  ListTodo,
  MessageCircleMore,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

const features = [
  { icon: Inbox, title: "Shared WhatsApp Inbox", text: "One focused inbox for customer conversations, priorities, snooze, quick replies and agent assignment." },
  { icon: Users, title: "Contacts & CRM", text: "Keep customer details, tags, notes, custom fields and activity in a single customer record." },
  { icon: ListTodo, title: "Tasks & Follow-ups", text: "Never lose the next action. Track due dates, overdue work, priority and assigned team members." },
  { icon: GitBranch, title: "Sales Pipelines", text: "Move deals through flexible stages, forecast weighted value and keep follow-up dates visible." },
  { icon: Radio, title: "Broadcasts", text: "Build segmented WhatsApp campaigns with scheduling, opt-out protection, retries and delivery reporting." },
  { icon: Workflow, title: "Automation & Flows", text: "Trigger follow-ups, tags, pipeline actions, webhooks and no-response workflows without repetitive manual work." },
  { icon: Bot, title: "AI CRM", text: "Summarize conversations, suggest replies, detect intent, score leads and use your knowledge base." },
  { icon: Search, title: "Fast Customer Search", text: "Jump between contacts, deals and conversations quickly from the CRM workspace." },
];

const workflow = [
  ["01", "Connect", "Connect WhatsApp Cloud API or prepare a supported coexistence setup."],
  ["02", "Organize", "Capture contacts, conversations, tasks, notes, tags and deals automatically."],
  ["03", "Automate", "Build broadcasts and workflows for repeatable sales and support processes."],
  ["04", "Grow", "Use pipeline visibility and AI assistance to prioritize the conversations that matter."],
] as const;

const faqs = [
  ["What is GrowthSprint365?", "GrowthSprint365 is a WhatsApp-first CRM built around customer conversations, contacts, follow-ups, sales pipelines, broadcasts, automation and AI-assisted workflows."],
  ["Can I keep using the WhatsApp Business app?", "The CRM includes a coexistence-ready connection mode and onboarding foundation. Actual availability depends on Meta eligibility and the business number/account being connected."],
  ["Where is the application hosted?", "The production architecture is designed for GitHub source control, Vercel for the Next.js application and Supabase for Postgres, Auth, Storage and Realtime."],
  ["Is customer data public?", "No. The database uses Supabase Row Level Security for user-scoped CRM data. Production security review and stronger multi-user RBAC are scheduled for the dedicated hardening phase."],
] as const;

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative grid size-10 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-lg shadow-fuchsia-950/30">
        <MessageCircleMore className="size-5 text-white" />
        <span className="absolute inset-x-2 bottom-1 h-px bg-white/40" />
      </span>
      <span className="text-base font-black tracking-tight text-white sm:text-lg">GrowthSprint365</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070614] text-white selection:bg-fuchsia-400/30">
      <section className="relative isolate border-b border-white/10">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_15%_5%,rgba(139,92,246,.28),transparent_32rem),radial-gradient(circle_at_85%_10%,rgba(34,211,238,.18),transparent_30rem),radial-gradient(circle_at_60%_65%,rgba(236,72,153,.14),transparent_34rem),linear-gradient(180deg,#0b071d_0%,#070614_75%)]" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

        <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" aria-label="GrowthSprint365 home"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/65 lg:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#coexistence" className="transition hover:text-white">WhatsApp</a>
            <a href="#workflow" className="transition hover:text-white">Workflow</a>
            <a href="#architecture" className="transition hover:text-white">Architecture</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white sm:inline-flex">Sign in</Link>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-xl shadow-white/5 transition hover:-translate-y-0.5 hover:bg-cyan-50">
              Open workspace <ArrowRight className="size-4" />
            </Link>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[.95fr_1.05fr] lg:px-8 lg:pb-32 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3.5 py-2 text-xs font-bold text-violet-100 shadow-lg shadow-violet-950/20">
              <Sparkles className="size-3.5 text-cyan-300" /> WhatsApp-first sales & support workspace
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[.96] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Turn customer chats into
              <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">organized growth.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              GrowthSprint365 brings your WhatsApp inbox, CRM contacts, follow-ups, pipelines, broadcasts, automations and AI tools into one clear workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3.5 text-sm font-black shadow-2xl shadow-fuchsia-950/30 transition hover:-translate-y-0.5">
                Start with GrowthSprint365 <ArrowRight className="size-4" />
              </Link>
              <a href="#features" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.05] px-6 py-3.5 text-sm font-bold text-white/80 backdrop-blur transition hover:bg-white/[.09] hover:text-white">
                Explore the CRM <ChevronRight className="size-4" />
              </a>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[['Inbox', 'Realtime'], ['Follow-up', 'Task driven'], ['Automation', 'Always on']].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] p-3.5 backdrop-blur">
                  <p className="text-sm font-black text-white">{value}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-white/35">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-cyan-400/20 blur-3xl" />
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1020]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-red-400" /><span className="size-2.5 rounded-full bg-amber-300" /><span className="size-2.5 rounded-full bg-emerald-400" /></div>
                <span className="text-[10px] font-bold uppercase tracking-[.24em] text-white/35">GrowthSprint365 Command Center</span>
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">Live</span>
              </div>
              <div className="grid min-h-[430px] grid-cols-[74px_1fr]">
                <aside className="border-r border-white/8 bg-white/[.025] p-3">
                  <div className="mx-auto grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500"><MessageCircleMore className="size-4" /></div>
                  <div className="mt-8 space-y-4">
                    {[Layers3, Inbox, Users, GitBranch, Zap].map((Icon, i) => <div key={i} className={`mx-auto grid size-8 place-items-center rounded-lg ${i === 1 ? 'bg-white/10 text-cyan-300' : 'text-white/30'}`}><Icon className="size-4" /></div>)}
                  </div>
                </aside>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs text-white/40">Today</p><h2 className="mt-1 text-xl font-black">Sales workspace</h2></div>
                    <div className="rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-white/55">Search contacts…</div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {[['Unread', '18'], ['Due today', '7'], ['Pipeline', '$24.8K']].map(([label, value]) => <div key={label} className="rounded-xl border border-white/8 bg-white/[.035] p-3"><p className="text-lg font-black">{value}</p><p className="mt-1 text-[10px] text-white/35">{label}</p></div>)}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1.05fr_.95fr]">
                    <div className="rounded-2xl border border-white/8 bg-white/[.03] p-3.5">
                      <div className="flex items-center justify-between"><p className="text-xs font-bold text-white/70">Priority inbox</p><Inbox className="size-4 text-cyan-300" /></div>
                      <div className="mt-3 space-y-2">
                        {[['A', 'Ava Rahman', 'Need pricing for 50 seats', '2m'], ['M', 'Mahir Studio', 'Can we book a demo?', '8m'], ['N', 'Northstar Ltd', 'Order follow-up', '21m']].map(([initial, name, text, time], i) => (
                          <div key={name} className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${i === 0 ? 'border-violet-400/25 bg-violet-400/8' : 'border-white/5 bg-white/[.02]'}`}>
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/80 to-fuchsia-500/80 text-xs font-black">{initial}</span>
                            <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{name}</p><p className="mt-0.5 truncate text-[10px] text-white/35">{text}</p></div>
                            <span className="text-[9px] text-white/25">{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[.045] to-white/[.02] p-3.5">
                      <div className="flex items-center justify-between"><p className="text-xs font-bold text-white/70">Next actions</p><ListTodo className="size-4 text-fuchsia-300" /></div>
                      <div className="mt-4 space-y-3">
                        {[['Follow up proposal', 'Due 11:30'], ['Send onboarding form', 'Due 15:00'], ['Review hot leads', '4 leads']].map(([title, meta], i) => <div key={title} className="flex gap-2"><span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${i === 0 ? 'border-fuchsia-300/50 bg-fuchsia-300/10' : 'border-white/15'}`}>{i === 0 && <CircleDot className="size-2.5 text-fuchsia-300" />}</span><div><p className="text-[11px] font-semibold text-white/75">{title}</p><p className="mt-0.5 text-[9px] text-white/30">{meta}</p></div></div>)}
                      </div>
                      <div className="mt-5 rounded-xl border border-emerald-400/10 bg-emerald-400/[.05] p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-emerald-300"><Bot className="size-3.5" /> AI insight</div><p className="mt-1.5 text-[10px] leading-4 text-white/40">3 conversations show high purchase intent. Prioritize them first.</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#f6f7fb] px-4 py-24 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.28em] text-violet-600">One workspace</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Everything around the customer conversation.</h2><p className="mt-5 text-lg leading-8 text-slate-600">GrowthSprint365 is designed so the inbox, CRM record, sales action and automation stay connected instead of living in separate tools.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => <article key={title} className="group rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-950/5"><span className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-fuchsia-500"><Icon className="size-5" /></span><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="coexistence" className="relative overflow-hidden bg-slate-950 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(16,185,129,.14),transparent_26rem),radial-gradient(circle_at_10%_30%,rgba(139,92,246,.14),transparent_28rem)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-3 py-2 text-xs font-bold text-emerald-200"><MessageCircleMore className="size-4" /> WhatsApp connection modes</div><h2 className="mt-6 text-4xl font-black tracking-[-.04em] sm:text-5xl">Built for Cloud API. Ready for coexistence onboarding.</h2><p className="mt-5 max-w-xl text-base leading-8 text-white/55">Use the standard WhatsApp Cloud API setup today, while the CRM keeps a dedicated coexistence mode for eligible businesses that want the Business App and API workflow together.</p><div className="mt-7 space-y-3">{['Manual Cloud API credentials remain available for advanced setup.', 'Coexistence connection metadata and onboarding status are tracked in Settings.', 'Webhook, template sync and CRM messaging continue through the same secured server routes.'].map((item) => <div key={item} className="flex gap-3 text-sm text-white/70"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />{item}</div>)}</div></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/8 bg-[#0b1220] p-5"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><MessageCircleMore className="size-5" /></span><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">Recommended when eligible</span></div><h3 className="mt-5 font-black">Business App + CRM</h3><p className="mt-2 text-xs leading-5 text-white/45">Coexistence-ready mode with connection state and embedded-signup preparation.</p></div><div className="rounded-2xl border border-white/8 bg-[#0b1220] p-5"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Globe2 className="size-5" /></span><span className="rounded-full bg-violet-400/10 px-2 py-1 text-[10px] font-bold text-violet-300">Standard</span></div><h3 className="mt-5 font-black">Cloud API only</h3><p className="mt-2 text-xs leading-5 text-white/45">Phone Number ID, WABA ID and encrypted server-side access token configuration.</p></div></div>
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-white px-4 py-24 text-slate-950 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.28em] text-fuchsia-600">Workflow</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">From first message to next action.</h2></div><div className="mt-12 grid gap-4 lg:grid-cols-4">{workflow.map(([n,title,text]) => <article key={n} className="relative rounded-[1.7rem] border border-slate-200 bg-slate-50 p-6"><span className="text-4xl font-black text-slate-200">{n}</span><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></article>)}</div></div></section>

      <section id="architecture" className="bg-[#0b0b13] px-4 py-24 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.28em] text-cyan-300">Deployment architecture</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Simple stack. Clear responsibility.</h2><p className="mt-5 text-base leading-8 text-white/55">The project is prepared around the deployment model you want: GitHub for source control, Vercel for Next.js and Supabase for database, Auth, Realtime and Storage.</p><Link href="/signup" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">Open GrowthSprint365 <ArrowRight className="size-4" /></Link></div><div className="grid gap-3 sm:grid-cols-3">{[[Globe2,'GitHub','Version-controlled source and deployment branch.'],[Zap,'Vercel','Next.js hosting, API routes and scheduled cron triggers.'],[ShieldCheck,'Supabase','Postgres, Auth, Realtime, Storage and RLS.']].map(([Icon,title,text]) => { const C=Icon as typeof Globe2; return <div key={String(title)} className="rounded-[1.6rem] border border-white/10 bg-white/[.04] p-5"><C className="size-6 text-cyan-300" /><h3 className="mt-5 font-black">{String(title)}</h3><p className="mt-2 text-xs leading-5 text-white/45">{String(text)}</p></div>})}</div></div></div></section>

      <section id="faq" className="bg-[#f6f7fb] px-4 py-24 text-slate-950 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><div className="text-center"><p className="text-xs font-black uppercase tracking-[.28em] text-violet-600">FAQ</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Before you connect.</h2></div><div className="mt-10 space-y-3">{faqs.map(([q,a],i) => <details key={q} open={i===0} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold"><span>{q}</span><span className="grid size-7 place-items-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-90"><ChevronRight className="size-4" /></span></summary><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{a}</p></details>)}</div></div></section>

      <section className="bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-800 px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-6xl flex-col items-center text-center"><span className="grid size-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20"><Sparkles className="size-6" /></span><h2 className="mt-6 text-4xl font-black tracking-[-.04em] sm:text-5xl">Build the customer workflow around the conversation.</h2><p className="mt-4 max-w-2xl text-white/65">GrowthSprint365 keeps the inbox simple while giving sales and support teams the structure they need behind it.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">Create workspace <ArrowRight className="size-4" /></Link><Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold">Sign in</Link></div></div></section>

      <footer className="border-t border-white/8 bg-[#070614] px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><Logo /><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/40"><a href="#features" className="hover:text-white">Features</a><a href="#coexistence" className="hover:text-white">WhatsApp</a><a href="#architecture" className="hover:text-white">Architecture</a><span>© 2026 GrowthSprint365</span></div></div></footer>
    </main>
  );
}
