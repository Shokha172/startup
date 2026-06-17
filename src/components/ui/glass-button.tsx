"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/hooks/use-audio";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "danger";
  glow?: boolean;
  children: React.ReactNode;
}

export function GlassButton({
  variant = "glass",
  glow = false,
  className = "",
  onClick,
  children,
  ...props
}: GlassButtonProps) {
  const { playClick } = useAudio();

  const baseStyles = "relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-500/50";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-400 hover:to-emerald-400 shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.5)] border border-cyan-400/20",
    secondary: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30",
    glass: "liquid-glass text-slate-800 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/40 border border-white/40 dark:border-white/10 shadow-sm",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30"
  };

  const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClick();
    if (onClick) {
      onClick(e);
    }
  };

  const MotionButton = motion.button as any;

  return (
    <MotionButton
      whileHover={{ scale: props.disabled ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      onClick={handlePress}
      className={`${baseStyles} ${variants[variant]} ${glow && !props.disabled ? "glass-button-glow" : ""} ${className}`}
      {...props}
    >
      {/* Liquid glass light reflection sweep */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </MotionButton>
  );
}
