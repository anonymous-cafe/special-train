"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { TrendingUp, Clock, Calendar, CheckCircle2 } from "lucide-react";

const CASE_STUDIES = [
  {
    client: "Apex Marketing Agency",
    metric: "+180% Sales Growth",
    sub: "Response time reduced to <2 minutes",
    desc: "How Apex automated incoming client intake queries using visual builders, allowing 5 agents to handle 3,000+ incoming chats per month without delay.",
    statIcon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
  },
  {
    client: "Metro Dental Clinic Group",
    metric: "-85% Appointment No-Shows",
    sub: "98% read rate via custom templates",
    desc: "Metro Dental set up automatic patient reminders on WhatsApp, giving patients instant reschedule and confirmation options using custom Meta template buttons.",
    statIcon: <Clock className="w-5 h-5 text-blue-600" />,
  },
  {
    client: "Horizon Luxury Realtors",
    metric: "$5.2M Real Estate Sold",
    sub: "82% bookings qualified by AI agent",
    desc: "How Horizon Realtor Group deployed custom booking bots that screens prospect budgets and coordinates property showing appointments automatically.",
    statIcon: <Calendar className="w-5 h-5 text-purple-600" />,
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Success Stories</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          See How Brands Scale Sales with GrowthSprint365
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Real metrics, real conversion increases, and proven hours of support time saved by real companies.
        </p>
      </div>

      {/* Case Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {CASE_STUDIES.map((study) => (
          <GlowCard key={study.client} className="flex flex-col justify-between h-full border-slate-200 bg-white">
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center shadow-inner">
                {study.statIcon}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{study.client}</h3>
              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                <span className="text-sm font-bold text-emerald-700 block">{study.metric}</span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">{study.sub}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                {study.desc}
              </p>
            </div>
            <button className="text-xs font-bold text-slate-800 hover:text-emerald-600 mt-6 flex items-center gap-1.5 cursor-pointer">
              <span>Read Full Case Study</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
