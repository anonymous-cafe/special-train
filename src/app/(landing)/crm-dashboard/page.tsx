"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { BarChart3, ShieldCheck, UserCheck, TrendingUp, CheckCircle } from "lucide-react";

export default function CRMDashboardPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>CRM Dashboard Overview</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Visual Deal Pipelines and Live Team Analytics
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Ditch spreadsheet updates. Automate lead scoring, monitor deal values, and track agent closure rates in real-time.
        </p>
      </div>

      {/* Main Preview Container */}
      <div className="max-w-5xl mx-auto px-4 mb-24">
        <DashboardPreview />
      </div>

      {/* Detailed Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlowCard className="bg-white border-slate-200">
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-sans">Pipeline Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drag-and-drop deals across customized stages. Calculate closed deal volume and average conversion lengths automatically.
            </p>
          </div>
        </GlowCard>

        <GlowCard className="bg-white border-slate-200">
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-sans">Lead Routing Rules</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Auto-assign new leads based on agent availability, custom tags, or incoming message content to ensure zero drop-offs.
            </p>
          </div>
        </GlowCard>

        <GlowCard className="bg-white border-slate-200">
          <div className="flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-sans">Secure RLS Controls</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Protect customer data with strict Postgres Row Level Security (RLS) ensuring agents only see assigned client details.
            </p>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
