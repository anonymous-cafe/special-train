"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, TrendingUp, Clock, CheckCircle2, ChevronRight, Play } from "lucide-react";

interface PipelineColumn {
  title: string;
  count: number;
  color: string;
  deals: {
    id: string;
    client: string;
    value: string;
    tag: string;
    time: string;
  }[];
}

const PIPELINE: PipelineColumn[] = [
  {
    title: "New Leads",
    count: 3,
    color: "bg-blue-500",
    deals: [
      { id: "1", client: "Acme Corp", value: "$4,500", tag: "Enterprise", time: "2m ago" },
      { id: "2", client: "Dr. Ronald Hill", value: "$1,200", tag: "Clinic", time: "1h ago" },
    ],
  },
  {
    title: "Contacted",
    count: 4,
    color: "bg-amber-500",
    deals: [
      { id: "3", client: "Elena Homes", value: "$9,800", tag: "Real Estate", time: "30m ago" },
      { id: "4", client: "Jane Smith", value: "$600", tag: "Coaching", time: "3h ago" },
    ],
  },
  {
    title: "Proposal Sent",
    count: 2,
    color: "bg-purple-500",
    deals: [
      { id: "5", client: "TechVibe Ltd", value: "$3,200", tag: "SaaS", time: "10m ago" },
    ],
  },
  {
    title: "Won Deals",
    count: 8,
    color: "bg-emerald-500",
    deals: [
      { id: "6", client: "Prime Realtors", value: "$12,500", tag: "Real Estate", time: "1d ago" },
      { id: "7", client: "Alpha Fitness", value: "$2,400", tag: "Coaching", time: "2d ago" },
    ],
  },
];

export const DashboardPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pipeline" | "analytics">("pipeline");

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
      {/* Top Header Mockup */}
      <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="h-4 w-[1px] bg-slate-800 mx-2" />
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>wacrm-production.vercel.app</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              activeTab === "pipeline" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Pipeline Board
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              activeTab === "analytics" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Live Analytics
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 h-[400px] md:h-[450px] overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between">
        {activeTab === "pipeline" ? (
          /* Kanban Board Mockup */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full overflow-y-auto pr-2 pb-6 scrollbar-thin">
            {PIPELINE.map((column, idx) => (
              <motion.div
                key={column.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 min-h-[300px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${column.color}`} />
                    <span className="text-xs font-bold text-slate-300">{column.title}</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                    {column.count}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {column.deals.map((deal) => (
                    <motion.div
                      key={deal.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col gap-2 shadow-sm cursor-pointer hover:border-slate-700 transition"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-semibold text-slate-200 truncate">{deal.client}</span>
                        <span className="text-[10px] font-bold text-emerald-400">{deal.value}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                          {deal.tag}
                        </span>
                        <span className="text-[8px] text-slate-500">{deal.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Live Analytics Mockup */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full h-full pb-6 overflow-y-auto scrollbar-thin">
            {/* Stats Cards */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Conversations</span>
                <h4 className="text-2xl font-extrabold text-white mt-1">1,482</h4>
                <span className="text-[9px] text-emerald-400 flex items-center mt-1">+12.4% vs yesterday</span>
              </div>
              <MessageSquare className="w-8 h-8 text-emerald-500 opacity-60" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Sales</span>
                <h4 className="text-2xl font-extrabold text-white mt-1">$48,250</h4>
                <span className="text-[9px] text-emerald-400 flex items-center mt-1">+18.2% this month</span>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-500 opacity-60" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Response Time</span>
                <h4 className="text-2xl font-extrabold text-white mt-1">1.8m</h4>
                <span className="text-[9px] text-emerald-400 flex items-center mt-1">-30s average drops</span>
              </div>
              <Clock className="w-8 h-8 text-purple-500 opacity-60" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bot Automation</span>
                <h4 className="text-2xl font-extrabold text-white mt-1">82.4%</h4>
                <span className="text-[9px] text-cyan-400 flex items-center mt-1">1,212 bot replies run</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-pink-500 opacity-60" />
            </div>

            {/* Custom SVG Simulated Dashboard Chart */}
            <div className="md:col-span-2 lg:col-span-4 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">Conversion Funnel History</span>
                <span className="text-[10px] text-slate-500">Live data updated 1s ago</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-40 pt-4 px-2">
                {[45, 60, 52, 70, 85, 64, 78, 92, 100, 80, 95, 110].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative bg-slate-800 rounded-md overflow-hidden h-28 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 0.8 }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-cyan-400 rounded-md group-hover:from-emerald-500 group-hover:to-cyan-300 transition-colors"
                      />
                    </div>
                    <span className="text-[8px] text-slate-500">M{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Futuristic Floating Widget */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute bottom-6 right-6 bg-slate-900 border border-emerald-500/30 text-white py-3 px-4 rounded-2xl flex items-center gap-3 shadow-lg z-20"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 leading-none mb-0.5">Live Alert</span>
          <span className="text-xs text-slate-200 font-semibold">Client booked meeting &middot; $12,500</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </motion.div>
    </div>
  );
};
