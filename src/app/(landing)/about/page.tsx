"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { ShieldCheck, Heart, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Our Journey</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Democratizing Customer Communication for Teams
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          We build robust, developer-friendly, and enterprise-grade tools that link the official WhatsApp API directly to your sales pipeline.
        </p>
      </div>

      {/* Values Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlowCard className="bg-white border-slate-200 text-center flex flex-col items-center p-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">Customer Empowerment</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We put ownership first. Our software is designed to let you control your own project instance, database credentials, and WhatsApp configurations.
          </p>
        </GlowCard>

        <GlowCard className="bg-white border-slate-200 text-center flex flex-col items-center p-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">Built with Integrity</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Zero bloat, clean interfaces, and robust systems. We keep our codebase modular and performant so you can adapt it to any workflow.
          </p>
        </GlowCard>

        <GlowCard className="bg-white border-slate-200 text-center flex flex-col items-center p-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">Security Priority</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All customer tokens are encrypted with AES-256-GCM. Row Level Security guarantees absolute data isolation across tables.
          </p>
        </GlowCard>
      </div>
    </div>
  );
}
