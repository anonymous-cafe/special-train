"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";

const CATEGORIES = ["All", "Guides", "Case Studies", "AI Automations", "WhatsApp Tips"];

const ARTICLES = [
  {
    title: "Configure the Official Meta WhatsApp Cloud API in 15 Minutes",
    desc: "A complete step-by-step developer guide to setting up your developer account, registering your business phone line, and fetching temporary tokens.",
    category: "Guides",
    readTime: "6 min read",
    date: "May 24, 2026",
    featured: true,
  },
  {
    title: "5 WhatsApp Automation Triggers Every Realtor Needs",
    desc: "Qualify home buyers instantly on WhatsApp from click-to-chat listings ads and distribute PDF brochures automatically.",
    category: "AI Automations",
    readTime: "4 min read",
    date: "May 20, 2026",
  },
  {
    title: "Case Study: Apex Reduced Lead Drop-Offs by 95%",
    desc: "See how a growing marketing agency automated incoming client pings using visual drag-and-drop builders.",
    category: "Case Studies",
    readTime: "5 min read",
    date: "May 15, 2026",
  },
  {
    title: "Why WhatsApp Outperforms Traditional Email Marketing Campaigns",
    desc: "Ditch low conversion newsletter lists. Discover why mobile messaging triggers 98% open rates and 40%+ CTR.",
    category: "WhatsApp Tips",
    readTime: "3 min read",
    date: "May 10, 2026",
  },
];

export default function BlogPage() {
  const [selectedCat, setSelectedCat] = useState("All");

  const filteredArticles = ARTICLES.filter(
    (art) => selectedCat === "All" || art.category === selectedCat
  );

  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          <span>GrowthSprint365 Insights</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Product Guides and Sales Automation Insights
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Learn how to construct custom AI booking agents, configure webhooks, and scale business messaging.
        </p>
      </div>

      {/* Categories filter */}
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-2 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
              selectedCat === cat
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured & grid list */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {filteredArticles.map((art, idx) => (
          <GlowCard
            key={art.title}
            className={`bg-white border-slate-200/80 p-8 ${
              art.featured ? "bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-200/50" : ""
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                  {art.category}
                </span>
                <span>&middot;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {art.date}
                </span>
                <span>&middot;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {art.readTime}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
                {art.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-3xl">
                {art.desc}
              </p>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1.5 w-fit mt-4 cursor-pointer">
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
