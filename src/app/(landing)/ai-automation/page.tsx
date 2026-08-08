"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { AIChatSimulation } from "@/components/landing/ai-chat-simulation";
import { Sparkles, CheckCircle2, Cpu, Calendar, ShieldCheck, Zap } from "lucide-react";

export default function AIAutomationPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
          <span>Futuristic AI Agents</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Automate Leads Nurturing with Conversational AI
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Deploy visual booking bots, qualify budgets in real-time, and transfer high-value deals directly to live specialists.
        </p>
      </div>

      {/* Main Feature Show */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
        <div className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start mx-auto lg:mx-0">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Conversational Lead Qualification
          </h2>
          <p className="text-slate-500 leading-relaxed font-medium">
            Tired of missing prospects pinging you at midnight? Our AI booking assistants automatically converse with clients, understand their project requirements, and schedule discovery calls directly into your calendar.
          </p>
          <div className="flex flex-col gap-4 text-left">
            {[
              { title: "24/7 Intake Coverage", desc: "Instantly reply to incoming marketing leads within seconds, day or night." },
              { title: "Smart Intent Recognition", desc: "Identify budget ranges, property requirements, and scheduling preferences." },
              { title: "Hot Lead Alerts", desc: "Instantly tag and ping live agents when a premium deal is qualified." },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <AIChatSimulation />
        </div>
      </div>

      {/* Bento Capabilities Grid */}
      <section className="bg-slate-50 border-y border-slate-200/50 py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise-Grade AI Architecture
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              We leverage semantic embeddings and advanced LLMs to deliver context-aware, highly personalized replies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlowCard className="bg-white border-slate-200">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Advanced Intent Logic</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Identify buyer intent and map client questions to accurate knowledgebase documents without hallucination.
                </p>
              </div>
            </GlowCard>

            <GlowCard className="bg-white border-slate-200">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Direct Calendar Booking</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Integrate with Google Calendar or Cal.com. Let AI present slots and write calendar bookings automatically.
                </p>
              </div>
            </GlowCard>

            <GlowCard className="bg-white border-slate-200">
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Guardrails & Safety</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Define strict prompt bounds so the AI only speaks within permitted guidelines, keeping your brand messages safe.
                </p>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>
    </div>
  );
}
