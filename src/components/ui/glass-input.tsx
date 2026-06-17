"use client";

import React from "react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function GlassInput({
  label,
  icon,
  error,
  className = "",
  ...props
}: GlassInputProps) {
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
        <input
          className={`w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-slate-950/45 border border-white/40 dark:border-white/5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 shadow-inner ${
            icon ? "pl-11" : ""
          } ${
            error ? "border-red-500/50 focus:ring-red-500/10" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500/80 dark:text-red-400/80 pl-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
