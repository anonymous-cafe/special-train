"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import { AnimatedButton } from "./animated-button";

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "AI Automation", href: "/ai-automation" },
      { name: "Shared Inbox", href: "/shared-inbox" },
      { name: "CRM Dashboard", href: "/crm-dashboard" },
      { name: "WhatsApp Marketing", href: "/whatsapp-marketing" },
      { name: "Integrations", href: "/integrations" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { name: "Real Estate", href: "/solutions" },
      { name: "Healthcare", href: "/solutions" },
      { name: "E-commerce", href: "/solutions" },
      { name: "Agencies", href: "/solutions" },
      { name: "Coaches", href: "/solutions" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "Customers", href: "/customers" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", href: "/blog" },
      { name: "API Docs", href: "/api-docs" },
      { name: "Terms of Service", href: "/" },
      { name: "Privacy Policy", href: "/" },
    ],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/60 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-6 mb-12">
          {/* Brand Panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5 fill-white/10" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                GrowthSprint365<span className="text-emerald-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              The complete enterprise-grade CRM and AI automation platform built to help startups, clinics, agencies, and realtors scale sales directly on WhatsApp.
            </p>
            {/* Newsletter Subscribe */}
            <div className="flex flex-col gap-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Subscribe to our newsletter
              </h5>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
                />
                <button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-2.5 flex items-center justify-center shadow transition cursor-pointer">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {section.title}
              </h5>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-emerald-600 transition"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Panel */}
        <div className="border-t border-slate-200/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} GrowthSprint365. All rights reserved.
          </p>
          {/* Socials */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              aria-label="Twitter / X"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-500/20 shadow-sm transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </Link>
            <Link
              href="/"
              aria-label="LinkedIn"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-500/20 shadow-sm transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </Link>
            <Link
              href="/"
              aria-label="GitHub"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-500/20 shadow-sm transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
