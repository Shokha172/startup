"use client";

import React from "react";

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  options: { value: string; label: string }[];
}

export function GlassSelect({
  label,
  icon,
  error,
  options,
  className = "",
  ...props
}: GlassSelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className={`w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-slate-950/45 border border-white/40 dark:border-white/5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 shadow-inner appearance-none cursor-pointer ${
            icon ? "pl-11" : ""
          } ${
            error ? "border-red-500/50 focus:ring-red-500/10" : ""
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron Indicator */}
        <div className="absolute right-4 pointer-events-none text-slate-400 dark:text-slate-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs text-red-500/80 dark:text-red-400/80 pl-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
