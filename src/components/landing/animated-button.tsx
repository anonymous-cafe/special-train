"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AnimatedButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  showArrow?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  href,
  onClick,
  variant = "primary",
  showArrow = false,
  className = "",
  type = "button",
  disabled = false,
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 py-3 px-6 text-sm md:text-base";

  const variants = {
    primary:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)] border border-emerald-500/20",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-900 shadow-sm border border-slate-200/80 hover:border-slate-300",
    outline:
      "bg-transparent border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-600",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
  };

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "";

  const buttonContent = (
    <motion.span
      className="relative z-10 flex items-center gap-2"
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled ? {} : { y: 1 }}
    >
      {children}
      {showArrow && (
        <motion.span
          initial={{ x: 0 }}
          whileHover={disabled ? {} : { x: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <ArrowRight className="h-4 w-4" />
        </motion.span>
      )}
    </motion.span>
  );

  const innerEffect = !disabled && variant === "primary" && (
    <span className="absolute inset-0 z-0 overflow-hidden rounded-full">
      <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 hover:opacity-100 transition-opacity duration-500" />
    </span>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}>
        {innerEffect}
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}
    >
      {innerEffect}
      {buttonContent}
    </button>
  );
};
