"use client";

import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

interface StatsCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  className?: string;
}

export const StatsCounter: React.FC<StatsCounterProps> = ({
  end,
  duration = 2.5,
  prefix = "",
  suffix = "",
  decimals = 0,
  label,
  className = "",
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div ref={ref} className={`text-center ${className}`}>
      <div className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">
        {mounted && inView ? (
          <CountUp
            end={end}
            duration={duration}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        ) : (
          <span>
            {prefix}
            {end}
            {suffix}
          </span>
        )}
      </div>
      <p className="text-sm md:text-base text-slate-500 font-medium">{label}</p>
    </div>
  );
};
