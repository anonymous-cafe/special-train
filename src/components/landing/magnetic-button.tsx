"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  showArrow?: boolean;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  href,
  onClick,
  variant = "primary",
  showArrow = false,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    // Magnetic pull threshold (max 15px shift)
    setPosition({ x: x * 0.25, y: y * 0.25 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseStyles =
    "relative inline-flex items-center justify-center font-bold tracking-tight rounded-full transition-all duration-300 py-3.5 px-8 text-sm md:text-base cursor-pointer focus:outline-none shadow-sm select-none";

  const variants = {
    primary:
      "bg-[#10b981] hover:bg-[#059669] text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)]",
    secondary:
      "bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800",
    outline:
      "bg-transparent border border-slate-300 text-slate-700 hover:border-slate-800 hover:text-slate-900",
  };

  const buttonContent = (
    <span className="flex items-center gap-2 relative z-10">
      {children}
      {showArrow && (
        <motion.span
          animate={{ x: position.x * 0.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <ArrowRight className="w-4 h-4 shrink-0" />
        </motion.span>
      )}
    </span>
  );

  const innerGradEffect = variant === "primary" && (
    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.8 }}
      >
        {href ? (
          <Link href={href} className={`${baseStyles} ${variants[variant]} ${className}`}>
            {innerGradEffect}
            {buttonContent}
          </Link>
        ) : (
          <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
            {innerGradEffect}
            {buttonContent}
          </button>
        )}
      </motion.div>
    </div>
  );
};
