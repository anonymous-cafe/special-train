"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { CheckCircle, Users, Bot, BarChart3, MessageCircle, Zap } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
          <span>Detailed Product Features</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Supercharge Your Sales & Support Engine
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          GrowthSprint365 combines the simplicity of WhatsApp with the power of enterprise lead management and visual chatbots.
        </p>
      </div>

      {/* Feature Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-24">
        {/* Section: Shared Inbox */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Shared Team Inbox
            </h2>
            <p className="text-slate-500 leading-relaxed font-medium">
              Eliminate log-in bottlenecks. Allow multiple support agents and sales specialists to respond to clients simultaneously under one central number.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Assign chats to specific reps automatically based on status or tags.",
                "Mention colleagues and add internal team notes directly within the message thread.",
                "Build unified contact records showing agent activity and conversation logs.",
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <GlowCard className="h-80 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Incoming Inquiry from Acme Corp</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">Unassigned</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs shadow cursor-pointer">
                  Claim Chat
                </button>
                <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-xl text-xs shadow cursor-pointer">
                  Delegate Rep
                </button>
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Section: AI Automation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="lg:order-2 flex flex-col gap-6 max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              No-Code Automations & AI Agent
            </h2>
            <p className="text-slate-500 leading-relaxed font-medium">
              Take the work out of follow-ups. Set up smart chatbot behaviors, automated template replies, and external webhook triggers in minutes.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Qualify leads by asking predefined questions automatically.",
                "Send immediate confirmation messages and digital assets.",
                "Trigger external webhooks to update CRMs or payment links in real-time.",
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <GlowCard className="lg:order-1 h-80 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col gap-2 w-full max-w-xs font-mono text-[10px] text-slate-500 bg-white border border-slate-200 p-5 rounded-2xl shadow-inner">
              <div className="text-slate-800 font-bold border-b border-slate-100 pb-2 mb-2">Automated Flow Summary</div>
              <div>💬 Inbound keyword: <span className="text-emerald-600 font-bold">"pricing"</span></div>
              <div>🤖 Bot: Send rate card brochure PDF</div>
              <div>⏳ Wait: 15 minutes</div>
              <div>❓ Ask: "Would you like to speak to an agent?"</div>
            </div>
          </GlowCard>
        </div>

        {/* Section: CRM & Sales Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              CRM & Sales Pipeline
            </h2>
            <p className="text-slate-500 leading-relaxed font-medium">
              Bring visual clarity to deal structures. A fully featured Kanban-style board handles lead tracking directly linked to conversation details.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Drag-and-drop deals across stages: Lead, Contacted, Proposal, Won.",
                "Update pipeline values and close metrics dynamically.",
                "Filter leads by customized tags, sources, or assignees.",
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <GlowCard className="h-80 flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-xs bg-white border border-slate-200 rounded-2xl p-4 shadow-md flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
                <span>Kanban Deal Card</span>
                <span className="text-emerald-500 font-extrabold">$12,500</span>
              </div>
              <p className="text-xs text-slate-500">Realtor contract signed for prime property deal.</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full text-slate-500">
                  Real Estate
                </span>
                <span className="text-[10px] text-slate-400">Owner: John Doe</span>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>

      {/* Feature CTA */}
      <div className="max-w-4xl mx-auto px-4 text-center mt-24">
        <GlowCard className="bg-slate-900 text-white p-12 border-slate-800">
          <h3 className="text-2xl md:text-3xl font-extrabold mb-4">
            Experience GrowthSprint365 in Action
          </h3>
          <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">
            Get started today with a 7-day free trial. Setup only takes 15 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton href="/signup" variant="primary">
              Start Free Trial
            </AnimatedButton>
            <AnimatedButton href="/book-demo" variant="secondary" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-750">
              Book Call with Advisor
            </AnimatedButton>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
