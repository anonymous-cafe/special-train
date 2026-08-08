"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { Users, CheckCircle, MessageCircle, MoreHorizontal, UserCheck, ShieldCheck } from "lucide-react";

export default function SharedInboxPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Multi-Agent Inbox</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Unify Your Messaging Under One Central Hub
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Coordinate support, sync lead contexts, and manage routing rules without logging in and out of different devices.
        </p>
      </div>

      {/* Main Details Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-24">
        {/* Section: Multi-Agent Inbox */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              One WhatsApp Number. Capped By Nothing.
            </h2>
            <p className="text-slate-500 leading-relaxed font-medium">
              Link your official business line to GrowthSprint365 and invite your sales reps and support agents. Everyone can chat with customers simultaneously, assigning tickets, tagging users, and setting custom filters.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Route incoming inquiries automatically to active agents.",
                "Brief colleagues using internal notes directly in the chat thread.",
                "Review agent response rates and closed-deal values on the dashboard.",
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm">
                  <UserCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <GlowCard className="h-80 flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  JD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">John Doe (Lead)</h4>
                  <span className="text-[9px] text-slate-400">Assigned to Vikram Mehta</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] text-slate-500 italic">
                John added internal note: "Interested in the 3 BHK layout. Send layout plan before call."
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
