"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "@/components/landing/glow-card";
import { Terminal, Shield, Zap, RefreshCw, Copy, Check } from "lucide-react";

const CODE_LANGS = ["cURL", "Node.js", "Python"];

const SNIPPETS = {
  cURL: `curl -X POST https://your-domain.com/api/whatsapp/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "type": "text",
    "text": { "body": "Hello from GrowthSprint365 API!" }
  }'`,
  "Node.js": `const response = await fetch('https://your-domain.com/api/whatsapp/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '+919876543210',
    type: 'text',
    text: { body: 'Hello from GrowthSprint365 API!' }
  })
});
const data = await response.json();
console.log(data);`,
  Python: `import requests

url = "https://your-domain.com/api/whatsapp/send"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "to": "+919876543210",
    "type": "text",
    "text": { "body": "Hello from GrowthSprint365 API!" }
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
};

export default function ApiDocsPage() {
  const [lang, setLang] = useState<"cURL" | "Node.js" | "Python">("cURL");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative pt-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 text-xs text-emerald-800 font-semibold">
          <Terminal className="w-3.5 h-3.5 text-emerald-500" />
          <span>Developer Documentation</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Flexible & Robust Messaging APIs
        </h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium">
          Trigger transactional messages, fetch conversation histories, and sync custom webhooks into your stack.
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Info Panel */}
        <div className="flex flex-col gap-6 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Send Transactional Alerts Instantly
          </h2>
          <p className="text-slate-500 leading-relaxed font-medium">
            Connect your existing database, billing scripts, or checkout systems. Send booking links, payment confirmations, and reminders under secure HMAC token validations.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { title: "Secure Bearer Tokens", desc: "Validate authorization header against Supabase API key policies." },
              { title: "Real-Time Callback Webhooks", desc: "Sync delivery, read status, and message replies in real-time." },
              { title: "Standard JSON Formats", desc: "Meta-compatible structured payloads for quick integrations." },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Code Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {/* Header Code bar */}
          <div className="border-b border-slate-850 px-5 py-3.5 bg-slate-950 flex items-center justify-between">
            <div className="flex gap-2">
              {CODE_LANGS.map((c) => (
                <button
                  key={c}
                  onClick={() => setLang(c as any)}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition cursor-pointer ${
                    lang === c ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Snippet Output */}
          <div className="p-6 overflow-x-auto text-[11px] md:text-xs font-mono text-slate-300 bg-slate-950/80 leading-relaxed whitespace-pre h-64 scrollbar-thin">
            {SNIPPETS[lang]}
          </div>
        </div>
      </div>
    </div>
  );
}
