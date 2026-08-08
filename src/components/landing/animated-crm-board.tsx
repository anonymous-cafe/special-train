"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, TrendingUp, Clock, UserCheck, Plus, ChevronRight, Award } from "lucide-react";

interface DealCard {
  id: string;
  name: string;
  value: string;
  source: string;
  tag: string;
  time: string;
}

const DEALS: DealCard[] = [
  { id: "1", name: "Apex Agency", value: "$4,500", source: "Facebook Ad", tag: "Marketing", time: "5m ago" },
  { id: "2", name: "Metro Dental Group", value: "$9,200", source: "Google Map", tag: "Healthcare", time: "12m ago" },
  { id: "3", name: "Horizon Properties", value: "$15,800", source: "WhatsApp Ad", tag: "Real Estate", time: "30m ago" },
  { id: "4", name: "Dr. Ronald Hill", value: "$1,800", source: "Referral", tag: "Clinic", time: "2h ago" },
];

export const AnimatedCRMBoard: React.FC = () => {
  const [dealList, setDealList] = useState<DealCard[]>(DEALS);
  const [wonAlerts, setWonAlerts] = useState<string[]>([]);

  const handleCloseDeal = (id: string, name: string, value: string) => {
    setDealList((prev) => prev.filter((d) => d.id !== id));
    setWonAlerts((prev) => [...prev, `${name} closed! (${value})`]);
    setTimeout(() => {
      setWonAlerts((prev) => prev.filter((a) => a !== `${name} closed! (${value})`));
    }, 4000);
  };

  return (
    <div className="w-full bg-white/70 border border-slate-200/60 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 backdrop-blur-xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-150/50 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Active Deal Pipeline</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Drag/click deals to mark as closed-won.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-emerald-50 border border-emerald-200/50 text-[10px] font-bold text-emerald-700 px-3 py-1.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+$31,300 Open Value</span>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Deal Column 1: Leads */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex justify-between items-center">
            <span>Inbound Chats</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          </h4>
          <div className="flex flex-col gap-3 min-h-[220px]">
            {dealList.filter((d) => ["1", "2"].includes(d.id)).map((deal) => (
              <motion.div
                key={deal.id}
                layout
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:border-slate-350 transition-all cursor-pointer flex flex-col gap-2 relative group"
              >
                <div className="flex justify-between items-start">
                  <h5 className="text-xs font-bold text-slate-800">{deal.name}</h5>
                  <span className="text-xs font-extrabold text-emerald-600">{deal.value}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full text-slate-500 font-semibold">
                    {deal.tag}
                  </span>
                  <button
                    onClick={() => handleCloseDeal(deal.id, deal.name, deal.value)}
                    className="text-[9px] font-bold text-emerald-600 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                  >
                    <span>Close Won</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Deal Column 2: Negotiation */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex justify-between items-center">
            <span>Proposal Sent</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          </h4>
          <div className="flex flex-col gap-3 min-h-[220px]">
            {dealList.filter((d) => ["3", "4"].includes(d.id)).map((deal) => (
              <motion.div
                key={deal.id}
                layout
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:border-slate-350 transition-all cursor-pointer flex flex-col gap-2 relative group"
              >
                <div className="flex justify-between items-start">
                  <h5 className="text-xs font-bold text-slate-800">{deal.name}</h5>
                  <span className="text-xs font-extrabold text-emerald-600">{deal.value}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full text-slate-500 font-semibold">
                    {deal.tag}
                  </span>
                  <button
                    onClick={() => handleCloseDeal(deal.id, deal.name, deal.value)}
                    className="text-[9px] font-bold text-emerald-600 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                  >
                    <span>Close Won</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Metrics Column */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Live Funnel Metrics</h4>
          <div className="flex flex-col gap-3">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Avg Response Time</span>
                <h4 className="text-lg font-extrabold text-slate-800 mt-1">1.8m</h4>
              </div>
              <Clock className="w-6 h-6 text-emerald-600 opacity-80" />
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Bot Auto-Replies</span>
                <h4 className="text-lg font-extrabold text-slate-800 mt-1">84.2%</h4>
              </div>
              <Sparkles className="w-6 h-6 text-purple-600 opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Won alerts notification stack overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-2 pointer-events-none select-none">
        <AnimatePresence>
          {wonAlerts.map((alert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white py-2 px-4 rounded-full text-xs font-bold shadow-lg flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{alert}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
