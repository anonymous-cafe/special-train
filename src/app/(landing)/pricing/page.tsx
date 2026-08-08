"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, HelpCircle, ArrowRight, Minus, Plus } from "lucide-react";
import { AnimatedButton } from "@/components/landing/animated-button";
import { GlowCard } from "@/components/landing/glow-card";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  
  // Calculator state
  const [agents, setAgents] = useState(3);
  const [sessions, setSessions] = useState(1000);

  // Estimate pricing
  const calculatePrice = () => {
    const baseRate = 29;
    const additionalAgents = Math.max(0, agents - 3) * 10;
    const additionalSessions = Math.max(0, Math.ceil((sessions - 1000) / 1000)) * 15;
    const total = baseRate + additionalAgents + additionalSessions;
    return billingPeriod === "monthly" ? total : Math.round(total * 0.8);
  };

  const calculateROI = () => {
    // ROI calculation: time saved + recovered leads
    const hoursSaved = agents * 12; // 12 hours saved per agent per month
    const valueSaved = hoursSaved * 25; // $25/hour rate
    const recoveredLeads = Math.round(sessions * 0.05); // 5% recovery rate
    const conversionValue = recoveredLeads * 120; // $120 average conversion value
    return valueSaved + conversionValue;
  };

  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Flexible Plans for Teams of All Sizes
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Choose a plan that fits your current requirements. Upgrade or downgrade as your messaging volume scales.
        </p>

        {/* Toggle Billing */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className={`text-sm font-semibold ${billingPeriod === "monthly" ? "text-slate-900" : "text-slate-400"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="w-12 h-6 bg-emerald-600 rounded-full p-1 transition-all flex items-center relative cursor-pointer"
          >
            <motion.span
              layout
              className="w-4 h-4 bg-white rounded-full block shadow-sm"
              animate={{ x: billingPeriod === "yearly" ? 24 : 0 }}
            />
          </button>
          <span className={`text-sm font-semibold ${billingPeriod === "yearly" ? "text-slate-900 animate-pulse" : "text-slate-400"}`}>
            Yearly (Save 20%)
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {/* Starter */}
        <GlowCard className="flex flex-col justify-between p-8 border-slate-200 bg-white">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Starter</span>
            <div className="flex items-baseline mt-4 mb-2">
              <span className="text-4xl font-extrabold text-slate-900">
                {billingPeriod === "monthly" ? "$29" : "$23"}
              </span>
              <span className="text-slate-400 text-xs ml-1">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Essential messaging capabilities for sole proprietors or small teams.</p>
            <ul className="flex flex-col gap-3 border-t border-slate-100 pt-6">
              {[
                "1 Active WhatsApp Number",
                "Up to 3 Agent Accounts",
                "1,000 Free Monthly Sessions",
                "Basic Custom Tags & Filters",
                "Core Kanban Pipeline Board",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <AnimatedButton href="/signup" variant="outline" className="w-full mt-8">
            Get Starter
          </AnimatedButton>
        </GlowCard>

        {/* Growth (Highlighted) */}
        <GlowCard className="flex flex-col justify-between p-8 border-2 border-emerald-500/80 bg-white relative">
          <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Most Popular
          </span>
          <div>
            <span className="text-xs uppercase font-bold text-slate-700 tracking-wider">Growth</span>
            <div className="flex items-baseline mt-4 mb-2">
              <span className="text-4xl font-extrabold text-slate-900">
                {billingPeriod === "monthly" ? "$79" : "$63"}
              </span>
              <span className="text-slate-400 text-xs ml-1">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Qualify applications, recover carts, and schedule booking slots.</p>
            <ul className="flex flex-col gap-3 border-t border-slate-100 pt-6">
              {[
                "2 Active WhatsApp Numbers",
                "Up to 10 Agent Accounts",
                "5,000 Free Monthly Sessions",
                "No-Code Visual Automations",
                "AI Qualifying Booking Agent",
                "Advanced CSV Import & Filters",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <AnimatedButton href="/signup" variant="primary" className="w-full mt-8 shadow-md">
            Get Growth
          </AnimatedButton>
        </GlowCard>

        {/* Scale */}
        <GlowCard className="flex flex-col justify-between p-8 border-slate-200 bg-white">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Scale</span>
            <div className="flex items-baseline mt-4 mb-2">
              <span className="text-4xl font-extrabold text-slate-900">
                {billingPeriod === "monthly" ? "$149" : "$119"}
              </span>
              <span className="text-slate-400 text-xs ml-1">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Designed for larger organizations with high volume routing needs.</p>
            <ul className="flex flex-col gap-3 border-t border-slate-100 pt-6">
              {[
                "5 Active WhatsApp Numbers",
                "Uncapped Agent Accounts",
                "15,000 Free Monthly Sessions",
                "Custom System Prompts & Logic",
                "API Access & Webhooks",
                "Priority Video Setup Support",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <AnimatedButton href="/signup" variant="outline" className="w-full mt-8">
            Get Scale
          </AnimatedButton>
        </GlowCard>
      </div>

      {/* Interactive Cost & ROI Calculator */}
      <section className="bg-slate-50 border-y border-slate-200/50 py-20 mb-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 flex flex-col gap-3">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Interactive Value Calculator
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Scale your agents and conversation sessions to calculate your custom plan cost and estimated ROI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-slate-200/80 p-8 rounded-[2.5rem] shadow-sm">
            {/* Controls */}
            <div className="flex flex-col gap-8">
              {/* Agent Slider */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                  <span>Support/Sales Agents</span>
                  <span className="text-emerald-600">{agents} Seats</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAgents((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={agents}
                    onChange={(e) => setAgents(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <button
                    onClick={() => setAgents((prev) => Math.min(50, prev + 1))}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sessions Input */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                  <span>Monthly Message Sessions</span>
                  <span className="text-emerald-600">{sessions.toLocaleString()} / mo</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSessions((prev) => Math.max(1000, prev - 1000))}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={sessions}
                    onChange={(e) => setSessions(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <button
                    onClick={() => setSessions((prev) => Math.min(100000, prev + 1000))}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-6 text-center">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Estimated Monthly Investment</span>
                <div className="text-4xl font-extrabold text-slate-900 mt-2">
                  ${calculatePrice()}
                  <span className="text-xs text-slate-400 font-semibold ml-1">/ mo</span>
                </div>
              </div>

              <div className="border-t border-slate-200/50 pt-4">
                <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">Estimated Monthly Value Saved</span>
                <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                  +${calculateROI().toLocaleString()}
                  <span className="text-xs text-emerald-500 font-semibold ml-1">/ mo</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Calculated based on average hourly agent time savings and recovered leads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 text-center">Compare All Core Features</h3>
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
                <th className="p-4 md:p-5">Feature</th>
                <th className="p-4 md:p-5 text-center">Starter</th>
                <th className="p-4 md:p-5 text-center">Growth</th>
                <th className="p-4 md:p-5 text-center">Scale</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Active WhatsApp Numbers", starter: "1", growth: "2", scale: "5" },
                { name: "Agent Accounts Included", starter: "3", growth: "10", scale: "Uncapped" },
                { name: "Inbox Assignments", starter: "Manual", growth: "Automatic", scale: "Custom Rules" },
                { name: "Visual Automations Builder", starter: "No", growth: "Yes", scale: "Yes" },
                { name: "AI Qualifying Chatbot", starter: "No", growth: "Yes", scale: "Yes" },
                { name: "API & Webhooks Access", starter: "No", growth: "No", scale: "Yes" },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                  <td className="p-4 md:p-5 font-medium text-slate-800">{row.name}</td>
                  <td className="p-4 md:p-5 text-center text-slate-500">{row.starter}</td>
                  <td className="p-4 md:p-5 text-center text-slate-600 font-medium">{row.growth}</td>
                  <td className="p-4 md:p-5 text-center text-slate-600 font-medium">{row.scale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
