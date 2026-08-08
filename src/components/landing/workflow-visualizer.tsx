"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Sparkles, UserCheck, MessageSquareCode, Award } from "lucide-react";

interface VisualNode {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
}

const VISUAL_NODES: VisualNode[] = [
  {
    id: "lead",
    icon: <UserPlus className="w-5 h-5 text-blue-600" />,
    title: "Lead Enters",
    desc: "Ping from ad/form",
    color: "text-blue-600",
    bg: "bg-blue-50/50",
    border: "border-blue-200/60",
    glow: "rgba(59, 130, 246, 0.15)",
  },
  {
    id: "reply",
    icon: <MessageSquareCode className="w-5 h-5 text-emerald-600" />,
    title: "Auto WhatsApp",
    desc: "Instant greeting",
    color: "text-emerald-600",
    bg: "bg-emerald-50/50",
    border: "border-emerald-200/60",
    glow: "rgba(16, 185, 129, 0.15)",
  },
  {
    id: "ai",
    icon: <Sparkles className="w-5 h-5 text-purple-600" />,
    title: "AI Nurture",
    desc: "Budget qualified",
    color: "text-purple-600",
    bg: "bg-purple-50/50",
    border: "border-purple-200/60",
    glow: "rgba(168, 85, 247, 0.15)",
  },
  {
    id: "assign",
    icon: <UserCheck className="w-5 h-5 text-cyan-600" />,
    title: "Assign Specialist",
    desc: "Routed on CRM",
    color: "text-cyan-600",
    bg: "bg-cyan-50/50",
    border: "border-cyan-200/60",
    glow: "rgba(6, 182, 212, 0.15)",
  },
  {
    id: "won",
    icon: <Award className="w-5 h-5 text-indigo-600" />,
    title: "Won Deal",
    desc: "Pipeline closed",
    color: "text-indigo-600",
    bg: "bg-indigo-50/50",
    border: "border-indigo-200/60",
    glow: "rgba(99, 102, 241, 0.15)",
  },
];

export const WorkflowVisualizer: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto py-12 px-6 scrollbar-none">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4 min-w-[900px] max-w-7xl mx-auto relative">
        {/* Animated SVG connecting line backdrop */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] hidden lg:block z-0 pointer-events-none select-none">
          <svg className="w-full h-10 overflow-visible" fill="none">
            <path
              id="connectorPath"
              d="M 50,20 L 950,20"
              stroke="rgba(16, 185, 129, 0.15)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            {/* Pulsing light node animation riding along the path */}
            <motion.circle
              r="4"
              fill="#10b981"
              style={{
                filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))",
              }}
            >
              <animateMotion
                path="M 50,20 L 950,20"
                dur="8s"
                repeatCount="indefinite"
              />
            </motion.circle>
          </svg>
        </div>

        {VISUAL_NODES.map((node, idx) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.03 }}
            className={`w-[170px] border ${node.border} ${node.bg} backdrop-blur-xl p-6 rounded-[2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all duration-500 relative z-10 group`}
            style={{
              boxShadow: `0 15px 35px -10px ${node.glow}`,
            }}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-white shadow-sm border border-slate-100/50 group-hover:scale-110 transition-transform duration-500`}
            >
              {node.icon}
            </div>
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1">
              Step 0{idx + 1}
            </h4>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-tight mb-2">
              {node.title}
            </h3>
            <p className="text-xs text-slate-500 leading-normal font-medium">
              {node.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
