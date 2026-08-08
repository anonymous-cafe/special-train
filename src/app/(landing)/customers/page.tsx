"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { TestimonialSlider } from "@/components/landing/testimonial-slider";
import { MessageSquare, Star } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Customer Feedback</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Helping Thousands of Brands Grow Sales
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          See what real founders, managers, and agency owners say about our team inbox and automations.
        </p>
      </div>

      {/* Testimonials Slider */}
      <div className="mb-24">
        <TestimonialSlider />
      </div>

      {/* Grid of reviews */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: "John Carter", role: "Founder, Apex Real Estate", review: "GrowthSprint365 helped us capture and qualify 100% of our incoming property inquiries instantly. Best software decision we made this year!" },
          { name: "Aria Smith", role: "Intake Coordinator, CareDental", review: "Our appointment cancellations dropped to zero once we set up automatic follow-up reminders. Highly recommended!" },
        ].map((item, idx) => (
          <GlowCard key={idx} className="bg-white border-slate-200">
            <div className="flex gap-1 mb-3 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed italic mb-4">
              "{item.review}"
            </p>
            <span className="text-xs font-bold text-slate-800 block">{item.name}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{item.role}</span>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
