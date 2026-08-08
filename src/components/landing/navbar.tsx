"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { AnimatedButton } from "./animated-button";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  {
    name: "Features",
    href: "/features",
    dropdown: [
      { name: "WhatsApp Marketing", href: "/whatsapp-marketing", desc: "Broadcast campaigns and automated templates." },
      { name: "Shared Team Inbox", href: "/shared-inbox", desc: "Collaborative inbox for multiple agents." },
      { name: "CRM Dashboard", href: "/crm-dashboard", desc: "Manage leads, tasks, and followups." },
      { name: "AI Automation", href: "/ai-automation", desc: "Auto qualifying bots and appointment schedulers." },
    ],
  },
  { name: "Solutions", href: "/solutions" },
  { name: "Pricing", href: "/pricing" },
  { name: "Integrations", href: "/integrations" },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-sm"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 relative z-50 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 fill-white/10" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              GrowthSprint365<span className="text-emerald-500">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => link.dropdown && setActiveDropdown(null)}
              >
                {link.dropdown ? (
                  <button className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium py-2 text-sm transition cursor-pointer">
                    <span>{link.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition py-2 ${
                      pathname === link.href
                        ? "text-emerald-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {link.name}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {link.dropdown && (
                  <AnimatePresence>
                    {activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full w-80 bg-white border border-slate-200 rounded-3xl p-4 shadow-xl mt-2 z-50"
                      >
                        <div className="grid gap-2">
                          {link.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="group flex flex-col p-3 rounded-2xl hover:bg-slate-50 transition"
                            >
                              <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition">
                                {subItem.name}
                              </span>
                              <span className="text-xs text-slate-500 mt-0.5">
                                {subItem.desc}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Sign In
            </Link>
            <AnimatedButton href="/book-demo" variant="outline">
              Book Demo
            </AnimatedButton>
            <AnimatedButton href="/signup" variant="primary">
              Start Free
            </AnimatedButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-950 focus:outline-none relative z-50 transition cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 overflow-hidden shadow-lg absolute top-full left-0 right-0"
          >
            <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <div key={link.name}>
                  {link.dropdown ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {link.name}
                      </span>
                      {link.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="pl-2 py-1 text-sm font-medium text-slate-600 hover:text-emerald-600"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="block py-2 text-base font-semibold text-slate-700 hover:text-emerald-600"
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="py-2 text-center text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Sign In
                </Link>
                <AnimatedButton href="/book-demo" variant="outline" className="w-full">
                  Book Demo
                </AnimatedButton>
                <AnimatedButton href="/signup" variant="primary" className="w-full">
                  Start Free
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
