"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import { useAudio } from "@/hooks/use-audio";
import { Sun, Moon, Droplet, Menu } from "lucide-react";

interface NavbarProps {
  onMenuToggle?: () => void;
  showSidebarToggle?: boolean;
}

export function Navbar({ onMenuToggle, showSidebarToggle = false }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { playClick } = useAudio();
  const pathname = usePathname();

  const handleThemeToggle = () => {
    playClick();
    toggleTheme();
  };

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/20 dark:bg-slate-950/20 backdrop-blur-md border-b border-white/10 dark:border-white/5 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showSidebarToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200 lg:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
          )}
          
          <Link href="/" className="flex items-center gap-2" onClick={playClick}>
            <div className="relative">
              <span className="absolute inset-0 bg-cyan-500/30 rounded-full blur-sm" />
              <div className="relative bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white p-2 rounded-xl flex items-center justify-center">
                <Droplet size={18} className="fill-white/20" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              AquaMind<span className="text-cyan-500">AI</span>
            </span>
          </Link>
        </div>

        {/* Desktop Landing Links */}
        {!isDashboard && (
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#problem"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
              onClick={playClick}
            >
              Muammo
            </Link>
            <Link
              href="#solution"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
              onClick={playClick}
            >
              Yechim
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
              onClick={playClick}
            >
              Imkoniyatlar
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-xl bg-white/30 dark:bg-slate-900/50 border border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/50 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all duration-300 cursor-pointer shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {!isDashboard ? (
            <Link
              href="/dashboard"
              onClick={playClick}
              className="relative px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase text-white bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
            >
              Boshqaruv Paneli
            </Link>
          ) : (
            <Link
              href="/"
              onClick={playClick}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide liquid-glass text-slate-800 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-slate-800/40 border border-white/40 dark:border-white/10 shadow-sm"
            >
              Chiqish
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
