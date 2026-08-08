"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Send, Phone, Video, MoreVertical, ShieldCheck, FileText, Download, Calendar as CalendarIcon, Wifi, Battery, Signal, CheckCircle2 } from "lucide-react";

interface Message {
  id: string;
  sender: "client" | "bot";
  text: string;
  timestamp: string;
  type?: "text" | "document" | "buttons" | "event";
  metadata?: any;
}

const CONVERSATION_STEPS = [
  {
    sender: "client" as const,
    text: "Hi, I'm interested in your real estate project. Can I get a brochure?",
    type: "text" as const,
  },
  {
    sender: "bot" as const,
    text: "Hi there! 👋 I'd be happy to help. Here is the brochure for **Skyline Heights**.",
    type: "document" as const,
    metadata: {
      fileName: "Skyline_Heights_Brochure.pdf",
      fileSize: "4.2 MB",
    },
  },
  {
    sender: "bot" as const,
    text: "Would you like me to schedule a call with one of our property specialists to discuss pricing?",
    type: "text" as const,
  },
  {
    sender: "client" as const,
    text: "Yes, that works. What slots do you have available for tomorrow afternoon?",
    type: "text" as const,
  },
  {
    sender: "bot" as const,
    text: "Great! I have the following slots open tomorrow. Which slot works best for you?",
    type: "buttons" as const,
    metadata: {
      options: ["2:00 PM", "3:30 PM", "5:00 PM"],
    },
  },
  {
    sender: "client" as const,
    text: "Let's do 3:30 PM.",
    type: "text" as const,
  },
  {
    sender: "bot" as const,
    text: "Perfect! 🗓️ I have booked your session. Here are the meeting details:",
    type: "event" as const,
    metadata: {
      title: "Discovery Call - Skyline Heights",
      date: "Tomorrow (May 27, 2026)",
      time: "3:30 PM - 3:45 PM",
      location: "Google Meet",
    },
  },
];

export const AIChatSimulation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stepIndex >= CONVERSATION_STEPS.length) {
      const timer = setTimeout(() => {
        setMessages([]);
        setStepIndex(0);
        setSelectedSlot(null);
      }, 7000);
      return () => clearTimeout(timer);
    }

    const nextStep = CONVERSATION_STEPS[stepIndex];
    const isBot = nextStep.sender === "bot";
    const delay = isBot ? 2800 : 1800;
    const typingTime = isBot ? 1800 : 900;

    const timer = setTimeout(() => {
      setIsTyping(true);

      const typingTimer = setTimeout(() => {
        setIsTyping(false);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: nextStep.sender,
            text: nextStep.text,
            timestamp: timeStr,
            type: nextStep.type,
            metadata: nextStep.metadata,
          },
        ]);
        setStepIndex((prev) => prev + 1);
      }, typingTime);

      return () => clearTimeout(typingTimer);
    }, delay);

    return () => clearTimeout(timer);
  }, [stepIndex]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="w-full max-w-[340px] md:max-w-[350px] mx-auto rounded-[3.2rem] border-[12px] border-slate-900 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden relative border-t-[14px]">
      {/* iOS Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-between px-3.5">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
        <div className="w-8 h-1 bg-slate-800 rounded-full" />
      </div>

      {/* iOS Status Bar */}
      <div className="bg-emerald-600 text-white/90 text-[10px] px-6 pt-1 flex justify-between items-center relative z-20 font-sans font-medium select-none">
        <span>09:41</span>
        <div className="flex items-center gap-1">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* WhatsApp Custom Premium Header */}
      <div className="bg-emerald-600 text-white px-4 pt-3 pb-3.5 flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-800 font-extrabold flex items-center justify-center text-sm shadow-inner">
              AI
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-600 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-bold leading-none tracking-tight">Smart Booking Bot</h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-white fill-emerald-500/20" />
            </div>
            <span className="text-[9px] text-emerald-100 opacity-90 leading-none">Online & active</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Video className="w-4 h-4 opacity-90 hover:opacity-100 cursor-pointer" />
          <Phone className="w-4 h-4 opacity-90 hover:opacity-100 cursor-pointer" />
          <MoreVertical className="w-4 h-4 opacity-90 hover:opacity-100 cursor-pointer" />
        </div>
      </div>

      {/* WhatsApp Chat Area with Grid Wallpaper */}
      <div
        ref={containerRef}
        className="h-96 overflow-y-auto bg-[#eae6df] p-4 flex flex-col gap-3 scroll-smooth relative"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.02) 1px, transparent 0)`,
          backgroundSize: "16px 16px",
        }}
      >
        <div className="mx-auto bg-white/70 border border-slate-200/40 text-[9px] text-slate-500 py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Messages are secured. Powered by GrowthSprint365 AI.</span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isClient = msg.sender === "client";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className={`flex flex-col max-w-[85%] ${
                  isClient ? "self-end items-end" : "self-start items-start"
                }`}
              >
                {/* Standard Message Bubble */}
                <div
                  className={`p-3 rounded-2xl text-xs md:text-sm shadow-sm relative leading-relaxed flex flex-col gap-2 ${
                    isClient
                      ? "bg-[#d9fdd3] text-slate-800 rounded-tr-none"
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-200/40"
                  }`}
                >
                  <div className="whitespace-pre-line font-medium">{msg.text}</div>

                  {/* CUSTOM UI ATTACHMENTS (Premium visual elements) */}
                  {/* 1. Document download card */}
                  {msg.type === "document" && msg.metadata && (
                    <div className="mt-1 bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-800 truncate max-w-[120px]">
                            {msg.metadata.fileName}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold">
                            {msg.metadata.fileSize}
                          </span>
                        </div>
                      </div>
                      <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 shadow-sm cursor-pointer transition">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* 2. Interactive buttons */}
                  {msg.type === "buttons" && msg.metadata && (
                    <div className="mt-2 flex flex-col gap-1.5 w-full">
                      {msg.metadata.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => {
                            if (!selectedSlot) setSelectedSlot(opt);
                          }}
                          className={`w-full py-2 px-3 border rounded-xl text-center text-[10px] font-bold tracking-tight transition cursor-pointer ${
                            selectedSlot === opt
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 3. Event schedule summary card */}
                  {msg.type === "event" && msg.metadata && (
                    <div className="mt-1 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 p-3 rounded-xl flex flex-col gap-2.5 shadow-inner">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow">
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-800">
                            {msg.metadata.title}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold">
                            {msg.metadata.location}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-emerald-200/30 pt-2 flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>{msg.metadata.date}</span>
                        <span>{msg.metadata.time}</span>
                      </div>
                    </div>
                  )}

                  {/* Time + Status tick */}
                  <div className="text-[8px] text-slate-400 mt-0.5 flex items-center justify-end gap-1 select-none font-semibold">
                    <span>{msg.timestamp}</span>
                    {isClient && (
                      <CheckCheck className="w-3 h-3 text-sky-500" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white text-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[50%] self-start shadow-sm flex items-center gap-1.5 border border-slate-200/40"
          >
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </motion.div>
        )}
      </div>

      {/* WhatsApp Input Field */}
      <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 relative z-10 border-t border-slate-200/80">
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center border border-slate-200/60 shadow-inner">
          <input
            disabled
            type="text"
            placeholder="Type a message..."
            className="w-full bg-transparent border-none text-[11px] outline-none text-slate-500 cursor-not-allowed font-medium"
          />
        </div>
        <div className="w-8.5 h-8.5 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow hover:bg-emerald-500 transition cursor-pointer">
          <Send className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
