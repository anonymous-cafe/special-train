"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, HelpCircle } from "lucide-react";
import { AnimatedButton } from "@/components/landing/animated-button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative selection:bg-emerald-500 selection:text-white">
      {/* Background Blobs */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 rounded-full bg-emerald-100/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 rounded-full bg-cyan-100/30 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 flex flex-col items-center gap-6">
        {/* Logo Icon */}
        <Link href="/" className="flex items-center gap-2 group mb-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6 fill-white/10" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            GrowthSprint<span className="text-emerald-500">365</span>
          </span>
        </Link>

        {/* Animated 404 Chat bubble */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="relative bg-white border border-slate-200 p-8 rounded-[2.5rem] rounded-bl-none shadow-lg max-w-sm"
        >
          <HelpCircle className="w-12 h-12 text-emerald-600 mb-4 mx-auto" />
          <h1 className="text-6xl font-extrabold text-slate-900 leading-none mb-2">404</h1>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Page Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The link might be broken, or the page was moved. Make sure you typed the address correctly.
          </p>
        </motion.div>

        {/* CTAs */}
        <div className="flex gap-4 w-full justify-center mt-2">
          <AnimatedButton href="/" variant="primary">
            Go to Homepage
          </AnimatedButton>
          <AnimatedButton href="/login" variant="secondary">
            Sign In
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}
