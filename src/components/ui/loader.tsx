"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisLoaderProps {
  isLoading: boolean;
  steps: string[];
  currentStepIndex: number;
}

export function AnalysisLoader({
  isLoading,
  steps,
  currentStepIndex
}: AnalysisLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl"
        >
          <div className="relative w-full max-w-xl p-8 rounded-3xl liquid-glass border border-cyan-500/20 text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] mx-4">
            
            {/* Liquid scanner simulation */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-t-3xl overflow-hidden pointer-events-none">
              <div className="scan-line" />
            </div>

            {/* Glowing spinning ring */}
            <div className="relative flex justify-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-24 h-24 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 border-b-emerald-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-cyan-400 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  ></path>
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              {"Sun'iy Intellekt Tahlili Faollashtirilmoqda"}
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              {"AquaMind AI fermerlik ma'lumotlarini hisoblab, sug'orish va risk modellarini optimallashtirmoqda..."}
            </p>

            {/* Timeline Progress */}
            <div className="flex flex-col gap-4 text-left max-w-md mx-auto relative z-10">
              {steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;

                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center">
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 text-xs font-bold"
                        >
                          ✓
                        </motion.div>
                      ) : isCurrent ? (
                        <div className="relative w-6 h-6">
                          <span className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping" />
                          <span className="relative block w-6 h-6 rounded-full bg-cyan-500 border border-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                            {idx + 1}
                          </span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold">
                          {idx + 1}
                        </div>
                      )}
                      {idx < steps.length - 1 && (
                        <div
                          className={`absolute top-6 bottom-[-20px] left-[11px] w-[2px] transition-colors duration-500 ${
                            isCompleted ? "bg-emerald-500/50" : "bg-slate-800"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-semibold transition-colors duration-300 ${
                          isCurrent
                            ? "text-cyan-400"
                            : isCompleted
                            ? "text-emerald-500/80"
                            : "text-slate-500"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live processing bar */}
            <div className="mt-8 bg-slate-800 h-1.5 w-full rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
