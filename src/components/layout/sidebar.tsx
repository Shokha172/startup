"use client";

import React from "react";
import { useAudio } from "@/hooks/use-audio";
import {
  LayoutDashboard,
  Droplets,
  Sprout,
  MessageSquare,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export type DashboardTab = "overview" | "watering" | "crop-analysis" | "agronomist" | "analytics";

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const { playClick } = useAudio();

  const menuItems = [
    { id: "overview", label: "Asosiy Oynasi", icon: LayoutDashboard },
    { id: "watering", label: "Aqlli Sug'orish", icon: Droplets },
    { id: "crop-analysis", label: "Ekin Analizi", icon: Sprout },
    { id: "agronomist", label: "AI Agronom", icon: MessageSquare },
    { id: "analytics", label: "Tahlil & Statistika", icon: BarChart3 }
  ];

  const handleTabChange = (tabId: string) => {
    playClick();
    setActiveTab(tabId as DashboardTab);
  };

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-35 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border-r border-white/10 dark:border-white/5 transition-all duration-300 flex flex-col justify-between ${
        isOpen ? "w-64" : "w-20"
      } max-lg:fixed max-lg:top-16 max-lg:h-[calc(100vh-4rem)] max-lg:z-50 ${
        isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
      }`}
    >
      <div className="flex flex-col gap-6 p-4">
        {/* Navigation list */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer relative select-none ${
                  isActive
                    ? "text-cyan-500 bg-cyan-500/10 border-l-2 border-cyan-500"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-900/40"
                }`}
              >
                <Icon size={20} className={isActive ? "text-cyan-500" : "text-slate-500"} />
                <span className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                  {item.label}
                </span>
                
                {/* Active hover effect */}
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent rounded-xl pointer-events-none" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Collapse Button */}
        <button
          onClick={() => {
            playClick();
            setIsOpen(!isOpen);
          }}
          className="hidden lg:flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-900/40 text-sm font-semibold cursor-pointer"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          <span className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
            Kichraytirish
          </span>
        </button>

        {/* Exit Button */}
        <Link
          href="/"
          onClick={playClick}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 text-sm font-semibold cursor-pointer"
        >
          <LogOut size={20} />
          <span className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
            Tizimdan Chiqish
          </span>
        </Link>
      </div>
    </aside>
  );
}
