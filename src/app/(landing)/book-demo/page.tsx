"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { AnimatedButton } from "@/components/landing/animated-button";
import { Calendar, Video, Clock, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

export default function BookDemoPage() {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [volume, setVolume] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setStep(1);
    setIndustry("");
    setVolume("");
    setDate("");
    setTime("");
  };

  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <span>Interactive Demo Setup</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Book a 15-Minute Technical Call
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Let an integration architect design your custom AI appointment bot or database webhook connection live.
        </p>
      </div>

      {/* Scheduler UI */}
      <div className="max-w-xl mx-auto px-4">
        <GlowCard className="bg-white border-slate-200 p-8 min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1 of 3</span>
                  <span className="text-xs font-semibold text-slate-700">Choose Industry</span>
                </div>
                <div className="flex flex-col gap-3">
                  {["Real Estate", "Healthcare / Clinic", "Coaching", "Ecommerce / D2C", "Agency / B2B"].map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setIndustry(ind)}
                      className={`w-full p-4 text-left border rounded-2xl text-sm font-semibold transition flex items-center justify-between cursor-pointer ${
                        industry === ind
                          ? "border-emerald-500 bg-emerald-50/40 text-slate-900"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <span>{ind}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 ${industry === ind ? "text-emerald-600" : ""}`} />
                    </button>
                  ))}
                </div>
                <AnimatedButton
                  disabled={!industry}
                  onClick={handleNext}
                  variant="primary"
                  className="w-full mt-4"
                  showArrow
                >
                  Continue
                </AnimatedButton>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 2 of 3</span>
                  <span className="text-xs font-semibold text-slate-700">Select Volume</span>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    "Less than 1,000 messages / mo",
                    "1,000 - 10,000 messages / mo",
                    "10,000 - 50,000 messages / mo",
                    "More than 50,000 messages / mo",
                  ].map((vol) => (
                    <button
                      key={vol}
                      onClick={() => setVolume(vol)}
                      className={`w-full p-4 text-left border rounded-2xl text-sm font-semibold transition flex items-center justify-between cursor-pointer ${
                        volume === vol
                          ? "border-emerald-500 bg-emerald-50/40 text-slate-900"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <span>{vol}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 ${volume === vol ? "text-emerald-600" : ""}`} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleBack}
                    className="flex-1 border border-slate-200 hover:border-slate-300 rounded-full py-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <AnimatedButton
                    disabled={!volume}
                    onClick={handleNext}
                    variant="primary"
                    className="flex-1"
                    showArrow
                  >
                    Continue
                  </AnimatedButton>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 3 of 3</span>
                  <span className="text-xs font-semibold text-slate-700">Pick Date & Time</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Calendar Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-500 shadow-inner"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Time Slot</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-500 shadow-inner"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleBack}
                    className="flex-1 border border-slate-200 hover:border-slate-300 rounded-full py-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <AnimatedButton
                    disabled={!date || !time}
                    onClick={handleNext}
                    variant="primary"
                    className="flex-1"
                  >
                    Confirm Booking
                  </AnimatedButton>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Demo Scheduled!</h3>
                <p className="text-xs md:text-sm text-slate-500 max-w-sm mx-auto">
                  Your Google Meet invitation has been generated. We will review your **{industry}** setup details (volume: **{volume}**) and meet you on **{date}** at **{time}**.
                </p>
                <div className="flex items-center gap-2 border border-slate-100 py-2.5 px-4 rounded-xl bg-slate-50/50 mt-2 text-xs text-slate-600 font-semibold">
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Google Meet &middot; 15 mins</span>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-6 text-xs font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer"
                >
                  Schedule Another Demo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </GlowCard>
      </div>
    </div>
  );
}
