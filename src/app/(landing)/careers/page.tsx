"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";

const POSITIONS = [
  {
    title: "Senior Full-Stack Engineer",
    dept: "Engineering",
    location: "Remote / India",
    type: "Full-Time",
  },
  {
    title: "AI & Conversational UX Designer",
    dept: "Design & AI",
    location: "Remote / Worldwide",
    type: "Full-Time",
  },
  {
    title: "Senior Product Marketing Manager",
    dept: "Growth",
    location: "Remote / US",
    type: "Full-Time",
  },
];

export default function CareersPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Join the Team</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Help Us Build the Future of Business Messaging
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          We are a fully remote, fast-moving team passionate about open source, clean React architectures, and high-conversion automation.
        </p>
      </div>

      {/* Positions Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Open Opportunities</h3>
        {POSITIONS.map((pos, idx) => (
          <GlowCard key={idx} className="bg-white border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {pos.dept}
              </span>
              <h4 className="text-base font-bold text-slate-800">{pos.title}</h4>
              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {pos.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {pos.type}
                </span>
              </div>
            </div>
            <AnimatedButton href="/contact" variant="outline" className="w-full sm:w-auto text-xs py-2 px-5">
              Apply Now
            </AnimatedButton>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
