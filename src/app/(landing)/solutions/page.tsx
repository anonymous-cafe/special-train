"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { Building, HeartPulse, GraduationCap, ShoppingBag, Laptop, Check } from "lucide-react";

const SOLUTIONS_DATA = [
  {
    title: "Real Estate Realtors",
    icon: <Building className="w-6 h-6 text-blue-600" />,
    intro: "Automate brochures & schedule site visits.",
    bullets: [
      "Send PDF property flyers automatically when users ping from listing ads.",
      "Sync showing calendars to let clients pick site-visit slots inside WhatsApp.",
      "Assign interested buyers directly to regional realtors.",
    ],
    bgClass: "from-blue-500/5 to-transparent",
  },
  {
    title: "Healthcare & Clinics",
    icon: <HeartPulse className="w-6 h-6 text-rose-600" />,
    intro: "Automate appointment reminders and intake checks.",
    bullets: [
      "Send automated appointment alerts reducing patient no-shows by 85%.",
      "Let patients confirm or request reschedule options via interactive buttons.",
      "Collect pre-visit intake details secure under standard RLS policies.",
    ],
    bgClass: "from-rose-500/5 to-transparent",
  },
  {
    title: "Coaches & Content Creators",
    icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
    intro: "Qualify applications and manage booking drip sequences.",
    bullets: [
      "Screen booking applications automatically to focus on high-ticket clients.",
      "Trigger automated drip reminders to nurture signups who went cold.",
      "Sync payment links to collect enrollment fees directly from message threads.",
    ],
    bgClass: "from-emerald-500/5 to-transparent",
  },
  {
    title: "E-commerce & D2C Brands",
    icon: <ShoppingBag className="w-6 h-6 text-pink-600" />,
    intro: "Recover cart abandons and send shipping tracking.",
    bullets: [
      "Send cart recovery notifications with high conversion rates compared to email.",
      "Automate post-purchase support, tracking links, and review requests.",
      "Broadcast exclusive promo codes to segmented lists based on purchase history.",
    ],
    bgClass: "from-pink-500/5 to-transparent",
  },
  {
    title: "Agencies & B2B Teams",
    icon: <Laptop className="w-6 h-6 text-indigo-600" />,
    intro: "Coordinate multi-agent replies and manage B2B sales pipelines.",
    bullets: [
      "Consolidate team replies under a single official business number.",
      "Track complex sales pipelines and move deal stages visually.",
      "Create internal private notes to brief team members before handing off conversations.",
    ],
    bgClass: "from-indigo-500/5 to-transparent",
  },
];

export default function SolutionsPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Tailored Industry Solutions</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          SaaS Workflows Custom Built for Your Sector
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          See how specialized industries streamline lead qualification and close deals faster on WhatsApp.
        </p>
      </div>

      {/* Solutions Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {SOLUTIONS_DATA.map((solution, idx) => (
          <GlowCard key={solution.title} className={`bg-gradient-to-br ${solution.bgClass} p-8 md:p-10 border-slate-200/80`}>
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-inner">
                    {solution.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-800">{solution.title}</h3>
                </div>
                <p className="text-sm font-semibold text-slate-600 italic">
                  &ldquo;{solution.intro}&rdquo;
                </p>
              </div>

              <div className="flex-[2] flex flex-col gap-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Key Capabilities</h4>
                <ul className="grid grid-cols-1 gap-3">
                  {solution.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm md:text-base leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Solutions CTA */}
      <div className="max-w-4xl mx-auto px-4 text-center mt-24">
        <div className="bg-slate-900 text-white p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-slate-800">
          <h3 className="text-2xl md:text-3xl font-extrabold mb-4">
            Ready to Streamline Customer Communication?
          </h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Choose your plan or chat with an integration advisor to see how GrowthSprint365 fits into your custom stack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton href="/signup" variant="primary">
              Get Started Now
            </AnimatedButton>
            <AnimatedButton href="/contact" variant="secondary" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-750">
              Talk to Specialist
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
}
