"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { MessageSquare, ShoppingBag, Database, MessageCircle, Link as LinkIcon, HelpCircle, Activity, ArrowRight } from "lucide-react";

const INTEGRATIONS = [
  {
    name: "Shopify",
    icon: <ShoppingBag className="w-6 h-6 text-emerald-600" />,
    desc: "Recover abandoned carts, send tracking links, and update inventory details on WhatsApp.",
    status: "Native",
  },
  {
    name: "HubSpot",
    icon: <Database className="w-6 h-6 text-orange-600" />,
    desc: "Sync WhatsApp chat records, lead custom fields, and ticket statuses directly to your CRM.",
    status: "Native",
  },
  {
    name: "Stripe",
    icon: <LinkIcon className="w-6 h-6 text-indigo-600" />,
    desc: "Generate custom checkout invoices and send payment request links securely inside message bubbles.",
    status: "Ready",
  },
  {
    name: "Slack",
    icon: <MessageCircle className="w-6 h-6 text-purple-600" />,
    desc: "Forward unresolved client inquiries and urgent escalations directly into slack channels.",
    status: "Ready",
  },
  {
    name: "Zapier",
    icon: <Activity className="w-6 h-6 text-amber-600" />,
    desc: "Connect GrowthSprint365 webhook events to 5,000+ third-party tools and applications in minutes.",
    status: "Webhooks",
  },
  {
    name: "Meta Ads Manager",
    icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
    desc: "Attribute inbound WhatsApp pings directly to Facebook and Instagram click-to-chat campaigns.",
    status: "Native",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Connected Ecosystem</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Seamless Integrations with Your Core Stack
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Connect GrowthSprint365 to your e-commerce platforms, payment gateways, and databases to sync lead details automatically.
        </p>
      </div>

      {/* Connected Logos Visualization */}
      <section className="bg-slate-50 border-y border-slate-200/50 py-16 mb-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center relative">
          {/* Main Logo */}
          <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center shadow-lg relative z-20">
            <MessageSquare className="w-10 h-10" />
          </div>

          {/* Floating Connected Circles */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 max-w-2xl relative z-20">
            {["Shopify", "HubSpot", "Stripe", "Slack", "Zapier", "Meta Ads"].map((logo, idx) => (
              <motion.div
                key={logo}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4 + idx, ease: "easeInOut" }}
                className="bg-white border border-slate-200 py-2 px-5 rounded-full flex items-center gap-2 shadow-sm font-semibold text-xs text-slate-700"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{logo}</span>
              </motion.div>
            ))}
          </div>

          {/* Line Connections Backdrop */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-80 h-80 rounded-full border border-dashed border-slate-300 animate-spin-slow" />
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATIONS.map((integ) => (
          <GlowCard key={integ.name} className="flex flex-col justify-between h-full border-slate-200 bg-white">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                  {integ.icon}
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {integ.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">{integ.name}</h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                {integ.desc}
              </p>
            </div>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1.5 mt-6 cursor-pointer">
              <span>Setup Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
