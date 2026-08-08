"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { MessageSquare, CheckCircle, BarChart3, Users, Zap, CheckCircle2 } from "lucide-react";

export default function WhatsAppMarketingPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Broadcast & Campaigns</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Run High-Converting Campaigns on WhatsApp
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Ditch low-conversion emails. Reach clients directly in their primary chat application with 98% open rates.
        </p>
      </div>

      {/* Main Details Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-24">
        {/* Section: Broadcast Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-xl text-center lg:text-left items-center lg:items-start mx-auto lg:mx-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Personalized Bulk Broadcasts
            </h2>
            <p className="text-slate-500 leading-relaxed font-medium">
              Send marketing updates, event invitations, or product launch promos to thousands of segmented clients simultaneously, replacing values with per-recipient custom parameters.
            </p>
            <ul className="flex flex-col gap-3 text-left w-full">
              {[
                "Sync Meta-approved message templates automatically.",
                "Insert custom recipient parameters (e.g. {{1}} = First Name, {{2}} = Property Name).",
                "Comply with Meta rate-limiting guidelines to protect your number health.",
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <GlowCard className="h-80 flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-xs bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Template Preview</div>
              <div className="bg-[#efeae2] p-3 rounded-xl border border-slate-100 text-xs text-slate-800 leading-relaxed">
                Hi **Vikram** 👋, we have a new slot open tomorrow for your session! Reply to confirm.
              </div>
              <span className="text-[10px] text-slate-400 italic">Variables: Name = Vikram</span>
            </div>
          </GlowCard>
        </div>

        {/* Section: Accurate Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="lg:order-2 flex flex-col gap-6 max-w-xl text-center lg:text-left items-center lg:items-start mx-auto lg:mx-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Real-Time Campaign Metrics
            </h2>
            <p className="text-slate-500 leading-relaxed font-medium">
              Track campaign performance instantly. Measure message delivery rates, read confirmations, and user click-throughs in real-time.
            </p>
            <ul className="flex flex-col gap-3 text-left w-full">
              {[
                "Monitor sent vs. delivered vs. read logs per recipient.",
                "Track link clicks and conversion counts dynamically.",
                "Review daily response statistics and team messaging metrics.",
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <GlowCard className="lg:order-1 h-80 flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-xs bg-white border border-slate-200 p-5 rounded-2xl shadow-md flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Campaign #108 Stats</span>
                <span className="text-emerald-500 font-extrabold">Active</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Sent</span>
                  <span className="text-sm font-extrabold text-slate-800">5,000</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Delivered</span>
                  <span className="text-sm font-extrabold text-slate-800">98.2%</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Read</span>
                  <span className="text-sm font-extrabold text-emerald-600">91.4%</span>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
