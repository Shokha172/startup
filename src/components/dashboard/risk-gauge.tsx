"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";

interface RiskGaugeProps {
  value: number; // 0 to 100
  label: string;
}

export function RiskGauge({ value, label }: RiskGaugeProps) {
  // Determine risk level category
  const getRiskStatus = (val: number) => {
    if (val < 35) return { text: "Kam (Xavfsiz)", color: "text-emerald-500", border: "border-emerald-500/20", icon: CheckCircle, bg: "bg-emerald-500/10" };
    if (val < 70) return { text: "O'rtacha", color: "text-yellow-500", border: "border-yellow-500/20", icon: AlertTriangle, bg: "bg-yellow-500/10" };
    return { text: "Yuqori (Xavfli)", color: "text-red-500", border: "border-red-500/20", icon: ShieldAlert, bg: "bg-red-500/10" };
  };

  const status = getRiskStatus(value);
  const Icon = status.icon;

  return (
    <GlassCard className="flex flex-col gap-6 items-center text-center justify-between">
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left">
          {label}
        </span>
        <span className="text-xs font-bold text-slate-400 dark:text-slate-450">
          AI Monitoring
        </span>
      </div>

      {/* SVG Semi Circle Gauge */}
      <div className="relative w-48 h-24 flex items-end justify-center overflow-hidden">
        {/* Grey background arc */}
        <svg className="absolute w-44 h-44 bottom-0" viewBox="0 0 100 50">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(148, 163, 184, 0.15)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Animated colorful arc */}
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={value < 35 ? "#10b981" : value < 70 ? "#eab308" : "#ef4444"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="125"
            initial={{ strokeDashoffset: 125 }}
            animate={{ strokeDashoffset: 125 - (value / 100) * 125 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        {/* Center Text Indicator */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {value}%
          </span>
          <span className={`text-xs font-bold ${status.color}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* Status Description Box */}
      <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border ${status.border} ${status.bg}`}>
        <Icon className={`${status.color} shrink-0`} size={20} />
        <p className="text-xs text-slate-700 dark:text-slate-300 text-left leading-relaxed">
          {value < 35
            ? "Tuproq namligi va ekin holati me'yorda. Favqulodda sug'orish talab etilmaydi."
            : value < 70
            ? "O'rta xavf darajasi. Yaqin 48 soat ichida ayrim maydonlarni sug'orish zarur."
            : "Yuqori darajadagi xavf! Suvsizlik tufayli hosildorlik yo'qolishi mumkin. Shoshilinch sug'orish kutilmoqda."}
        </p>
      </div>
    </GlassCard>
  );
}
