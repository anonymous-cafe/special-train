"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { AuroraBackground } from "@/components/landing/aurora-background";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  if (isHomePage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <AuroraBackground className="text-slate-900 selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </AuroraBackground>
  );
}
