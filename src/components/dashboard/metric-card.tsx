"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  suffix = "",
  trend,
  icon,
  subtitle
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Smooth counter animation
  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1s
    const steps = 60;
    const stepTime = duration / steps;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start * 10) / 10);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <GlassCard hoverEffect={true} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 p-2.5 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          {displayValue}
        </motion.span>
        {suffix && (
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {suffix}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 mt-1">
        {trend ? (
          <div className="flex items-center gap-1">
            <span
              className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-lg ${
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight size={14} className="inline mr-0.5" />
              ) : (
                <ArrowDownRight size={14} className="inline mr-0.5" />
              )}
              {trend.value}%
            </span>
            <span className="text-[10px] text-slate-450 dark:text-slate-500">
              {"o'tgan oydan"}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle || "Barqaror ko'rsatkich"}
          </span>
        )}
      </div>
    </GlassCard>
  );
}
