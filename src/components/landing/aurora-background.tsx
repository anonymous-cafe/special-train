"use client";

import React from "react";
import { motion } from "framer-motion";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`relative min-h-screen bg-slate-50 overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Immersive ambient glowing orbs */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none select-none">
        {/* Orb 1: Emerald/Teal */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] rounded-full bg-emerald-300/20 blur-[130px] opacity-75"
        />

        {/* Orb 2: Cyan/Aqua */}
        <motion.div
          animate={{
            x: [0, -90, 50, 0],
            y: [0, 80, -60, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[20%] right-[-10%] w-[55vw] h-[55vw] max-w-[700px] rounded-full bg-cyan-300/15 blur-[120px] opacity-80"
        />

        {/* Orb 3: Blue/Purple Accent */}
        <motion.div
          animate={{
            x: [0, 50, -80, 0],
            y: [0, -90, 70, 0],
            scale: [1, 1.1, 0.85, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-10%] left-[20%] w-[65vw] h-[65vw] max-w-[900px] rounded-full bg-indigo-300/15 blur-[140px] opacity-70"
        />
      </div>

      {/* Subtle Premium Noise Grain Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.025] z-10 select-none bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Foreground Contents */}
      <div className="relative z-20 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
