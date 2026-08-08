"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, MessageSquareCode, Sparkles, UserCheck, Clock, CreditCard, Award, ArrowRight } from "lucide-react";

interface Node {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  bg: string;
  borderColor: string;
  glowColor: string;
}

const NODES: Node[] = [
  {
    id: "lead",
    icon: <UserPlus className="w-5 h-5 text-blue-600" />,
    title: "1. Lead Enters",
    desc: "Ad, web form, or WhatsApp ping",
    color: "text-blue-600",
    bg: "bg-blue-50/80",
    borderColor: "border-blue-200",
    glowColor: "rgba(59, 130, 246, 0.2)",
  },
  {
    id: "reply",
    icon: <MessageSquareCode className="w-5 h-5 text-emerald-600" />,
    title: "2. Auto Reply",
    desc: "Instant personalized greeting",
    color: "text-emerald-600",
    bg: "bg-emerald-50/80",
    borderColor: "border-emerald-200",
    glowColor: "rgba(16, 185, 129, 0.2)",
  },
  {
    id: "ai",
    icon: <Sparkles className="w-5 h-5 text-purple-600" />,
    title: "3. AI Qualifying",
    desc: "AI bot queries interest & budget",
    color: "text-purple-600",
    bg: "bg-purple-50/80",
    borderColor: "border-purple-200",
    glowColor: "rgba(168, 85, 247, 0.2)",
  },
  {
    id: "assign",
    icon: <UserCheck className="w-5 h-5 text-cyan-600" />,
    title: "4. Direct Routing",
    desc: "Assign to specialist on CRM",
    color: "text-cyan-600",
    bg: "bg-cyan-50/80",
    borderColor: "border-cyan-200",
    glowColor: "rgba(6, 182, 212, 0.2)",
  },
  {
    id: "followup",
    icon: <Clock className="w-5 h-5 text-amber-600" />,
    title: "5. Smart Followup",
    desc: "Drip templates trigger if idle",
    color: "text-amber-600",
    bg: "bg-amber-50/80",
    borderColor: "border-amber-200",
    glowColor: "rgba(245, 158, 11, 0.2)",
  },
  {
    id: "payment",
    icon: <CreditCard className="w-5 h-5 text-pink-600" />,
    title: "6. Payment Link",
    desc: "Generate & send payment request",
    color: "text-pink-600",
    bg: "bg-pink-50/80",
    borderColor: "border-pink-200",
    glowColor: "rgba(236, 72, 153, 0.2)",
  },
  {
    id: "conversion",
    icon: <Award className="w-5 h-5 text-indigo-600" />,
    title: "7. Won Deal",
    desc: "Success! Contract synced",
    color: "text-indigo-600",
    bg: "bg-indigo-50/80",
    borderColor: "border-indigo-200",
    glowColor: "rgba(99, 102, 241, 0.2)",
  },
];

export const WorkflowBuilder: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto py-8 px-4 scrollbar-none">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-3 min-w-[900px] max-w-7xl mx-auto">
        {NODES.map((node, idx) => (
          <React.Fragment key={node.id}>
            {/* Workflow Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`flex-1 min-w-[150px] max-w-[200px] border ${node.borderColor} ${node.bg} backdrop-blur-md p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative group`}
              style={{
                boxShadow: `0 10px 30px -10px ${node.glowColor}`,
              }}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white shadow-inner group-hover:scale-110 transition-transform`}
              >
                {node.icon}
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">{node.title}</h4>
              <p className="text-xs text-slate-500 leading-normal">{node.desc}</p>

              {/* Connecting Dot for visual flair */}
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Connecting Arrow */}
            {idx < NODES.length - 1 && (
              <div className="flex items-center justify-center shrink-0 py-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 0.5, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.3 }}
                  className="flex items-center text-slate-400 group relative"
                >
                  <ArrowRight className="w-5 h-5 hidden lg:block text-emerald-500" />
                  <span className="w-[1px] h-6 bg-emerald-300 block lg:hidden" />
                  
                  {/* Glowing Pulse Arrow Indicator */}
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-ping hidden lg:block" />
                </motion.div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
