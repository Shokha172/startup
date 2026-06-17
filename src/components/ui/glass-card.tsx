"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/hooks/use-audio";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = "",
  hoverEffect = true,
  glow = false,
  onClick
}: GlassCardProps) {
  const { playClick } = useAudio();

  const handlePress = () => {
    if (onClick) {
      playClick();
      onClick();
    }
  };

  const CardWrapper = onClick ? motion.div : "div";

  const customProps = onClick
    ? {
        whileHover: { y: hoverEffect ? -4 : 0, scale: hoverEffect ? 1.01 : 1 },
        whileTap: { scale: 0.99 },
        onClick: handlePress,
        className: `liquid-glass relative rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden glow-card ${
          glow ? "border-cyan-500/20 dark:border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.08)]" : ""
        } ${className}`,
      }
    : {
        className: `liquid-glass relative rounded-2xl p-6 overflow-hidden transition-all duration-300 ${
          hoverEffect ? "hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50 glow-card" : ""
        } ${
          glow ? "border-cyan-500/20 dark:border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.08)]" : ""
        } ${className}`,
      };

  return (
    <CardWrapper {...(customProps as any)}>
      {/* Background soft lighting reflections */}
      <span className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-400/5 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <span className="absolute -left-20 -bottom-20 w-40 h-40 bg-emerald-400/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Glass border reflection gloss */}
      <span className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="relative z-10">{children}</div>
    </CardWrapper>
  );
}
