"use client";

import React, { MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  glowColor = "rgba(16, 185, 129, 0.08)", // subtle emerald
  borderColor = "rgba(16, 185, 129, 0.2)",
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 400 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-white/60 p-8 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-slate-300/80 group ${className}`}
    >
      {/* Dynamic Radial Background Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${smoothX}px ${smoothY}px, ${glowColor}, transparent 80%)`,
        }}
      />

      {/* Dynamic Border Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
        style={{
          background: `radial-gradient(200px circle at ${smoothX}px ${smoothY}px, ${borderColor}, transparent 80%)`,
          maskImage: "linear-gradient(black, black)",
          WebkitMaskImage: "linear-gradient(black, black)",
          maskClip: "content-box",
          WebkitMaskClip: "content-box",
          padding: "1px",
        }}
      />

      <div className="relative z-20">{children}</div>
    </div>
  );
};
