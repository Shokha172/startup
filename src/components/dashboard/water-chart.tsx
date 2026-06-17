"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";

interface WaterChartProps {
  title: string;
  data: { label: string; consumption: number; savings: number }[];
}

export function WaterChart({ title, data }: WaterChartProps) {
  const [chartType, setChartType] = useState<"consumption" | "savings">("consumption");

  const maxConsumption = Math.max(...data.map((d) => d.consumption));
  const maxSavings = Math.max(...data.map((d) => d.savings));

  return (
    <GlassCard className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <span className="text-xs text-slate-400 dark:text-slate-400">
            {"Haftalik AI tavsiyalari bo'yicha hisobot"}
          </span>
        </div>
        
        {/* Toggle buttons */}
        <div className="flex bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-white/5 w-fit">
          <button
            onClick={() => setChartType("consumption")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 ${
              chartType === "consumption"
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
          >
            Suv Sarfi (m³)
          </button>
          <button
            onClick={() => setChartType("savings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 ${
              chartType === "savings"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
          >
            Tejovchanlik (%)
          </button>
        </div>
      </div>

      {/* Render custom charts using SVG path mapping */}
      <div className="relative h-[250px] w-full flex items-end pt-4">
        {chartType === "consumption" ? (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Grid background */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-full border-b border-slate-100 dark:border-white/5 h-0"
                />
              ))}
            </div>

            {/* Bars */}
            <div className="relative z-10 w-full h-[200px] flex items-end justify-between px-2 sm:px-6">
              {data.map((d, index) => {
                const percentage = (d.consumption / maxConsumption) * 85; // cap height
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    {/* Tooltip */}
                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-[105%] bg-slate-950/90 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg border border-white/10 pointer-events-none transition-all duration-350 z-20">
                      {d.consumption} m³
                    </div>

                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className="w-8 sm:w-12 rounded-t-xl bg-gradient-to-t from-cyan-600/80 to-cyan-400 dark:from-cyan-600/50 dark:to-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden"
                    >
                      {/* Interactive shimmer sweep on hover */}
                      <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000" />
                    </motion.div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 mt-2">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Grid background */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-full border-b border-slate-100 dark:border-white/5 h-0"
                />
              ))}
            </div>

            {/* Line Chart */}
            <div className="relative z-10 w-full h-[200px] flex items-end justify-between px-2 sm:px-6">
              {data.map((d, index) => {
                const percentage = (d.savings / maxSavings) * 85;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-[105%] bg-slate-950/90 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg border border-white/10 pointer-events-none transition-all duration-350 z-20">
                      {d.savings}% tejaldilar
                    </div>

                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className="w-8 sm:w-12 rounded-t-xl bg-gradient-to-t from-emerald-600/80 to-emerald-400 dark:from-emerald-600/50 dark:to-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000" />
                    </motion.div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 mt-2">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
