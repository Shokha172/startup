"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { useAudio } from "@/hooks/use-audio";
import { motion } from "framer-motion";
import {
  Droplets,
  Sprout,
  Cpu,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Play
} from "lucide-react";

export default function Home() {
  const { playClick } = useAudio();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-100 selection:bg-cyan-500/30">
      {/* Background radial glow lights */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-cyan-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
      <div className="absolute -left-40 top-40 w-96 h-96 bg-bubble-1 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-40 top-80 w-96 h-96 bg-bubble-2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-20 w-[450px] h-[450px] bg-bubble-3 rounded-full blur-3xl pointer-events-none" />

      {/* Floating abstract shape decorations */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-24 left-[10%] w-12 h-12 bg-gradient-to-tr from-cyan-400 to-cyan-500 rounded-2xl opacity-10 blur-[1px] hidden md:block"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 1.5, duration: 6 }}
        className="absolute top-48 right-[12%] w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full opacity-10 blur-[1px] hidden md:block"
      />

      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-32">
        {/* HERO SECTION */}
        <section className="text-center flex flex-col items-center gap-8 py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest border border-cyan-400/20 shadow-sm"
          >
            <Cpu size={14} className="animate-spin-slow" />
            Sun'iy Intellekt Qishloq Xo'jaligida
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent"
          >
            KELAJAK QISHLOQ XO‘JALIGI <br />
            <span className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
              SUN’IY INTELLEKT
            </span>{" "}
            BILAN BOSHLANADI
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl text-base sm:text-lg text-slate-500 dark:text-slate-450 leading-relaxed"
          >
            O‘zbekistondagi fermerlar uchun suv sarfini optimallashtiradigan, hosildorlik risklarini aniqlaydigan va sug‘orishni avtomatlashtiradigan premium agronomik yordamchi.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto"
          >
            <Link href="/dashboard" onClick={playClick} className="w-full sm:w-auto">
              <GlassButton variant="primary" className="w-full text-base font-bold shadow-lg" glow>
                Tahlilni Boshlash <ArrowRight size={18} className="ml-1" />
              </GlassButton>
            </Link>
            
            <GlassButton
              variant="glass"
              className="w-full sm:w-auto text-base font-semibold border-white/30 dark:border-white/5"
              onClick={() => {
                alert("Demo video tez kunda taqdim etiladi! Platformani tekshirish uchun 'Tahlilni Boshlash' tugmasini bosing.");
              }}
            >
              <Play size={16} className="fill-current mr-1" /> Demo Ko‘rish
            </GlassButton>
          </motion.div>

          {/* Hero Statistics summary cards with liquid glass glassmorphism */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full mt-16"
          >
            <motion.div variants={itemVariants}>
              <GlassCard hoverEffect={true} className="flex flex-col gap-2 items-center text-center p-6 border-white/50">
                <span className="text-3xl font-extrabold text-cyan-500">45%</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-450">Suv Tejalishi</span>
                <p className="text-[11px] text-slate-400 mt-1">AI sug'orish rejasi orqali isrof bo'lishning oldini olish</p>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlassCard hoverEffect={true} className="flex flex-col gap-2 items-center text-center p-6 border-white/50">
                <span className="text-3xl font-extrabold text-emerald-500">30%</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-450">Hosil O'sishi</span>
                <p className="text-[11px] text-slate-400 mt-1">Ekin kasalliklarini barvaqt aniqlab, davolash natijasi</p>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlassCard hoverEffect={true} className="flex flex-col gap-2 items-center text-center p-6 border-white/50">
                <span className="text-3xl font-extrabold text-cyan-400">92%</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-450">AI Anravligi</span>
                <p className="text-[11px] text-slate-400 mt-1">Gemini modelining daladagi ekin xavflarini hisoblash ishonchliligi</p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* PROBLEM SECTION */}
        <section id="problem" className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase w-fit">
                <AlertTriangle size={14} />
                Global Muammo
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                O‘zbekistonda Suv Inqirozi va Yo‘qotishlar
              </h2>
              <p className="text-slate-500 dark:text-slate-450 leading-relaxed text-sm sm:text-base">
                Qishloq xo‘jaligida eskirgan sug'orish usullari va iqlim isishi oqibatida har yili milliardlab kubometr chuchuk suv behuda sarflanmoqda. Fermerlar ekinlarning aniq ehtiyojini bilmasligi sababli, ekinlar yo suvsizlikdan quriydi, yoki ortiqcha sug'orish tufayli sho'rlanib nobud bo'ladi.
              </p>
              
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Daryolardagi suv hajmining keskin kamayishi.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Suv isrofgarchiligining qishloq xo'jaligidagi 50% gacha bo'lgan salbiy ulushi.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Erta diagnostika yo'qligi sababli hosilning nobud bo'lish xavfi.</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <GlassCard className="relative overflow-hidden border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-5xl font-extrabold text-red-500/10">!</span>
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4">
                  Faktlar va Raqamlar
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex flex-col">
                    <span className="text-2xl font-bold text-red-500">60%</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Eski texnologiyalar oqibatidagi isrof</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex flex-col">
                    <span className="text-2xl font-bold text-red-500">2.5 barobar</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">O'rtacha me'yordan ortiqcha sarf</span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-red-500/80 leading-relaxed">
                  Buxoro va Qashqadaryo viloyatlarida tuproq sho'rlanishi va sug'orish tizimidagi nosozliklar hosil unumdorligini 35% ga qisqartirdi.
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* SOLUTION SECTION */}
        <section id="solution" className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <GlassCard className="relative overflow-hidden border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4">
                  Aqlli Sug'orish Algoritmi
                </h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                    <div className="flex items-center gap-3">
                      <Droplets className="text-cyan-500" size={20} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Optimal Suv Balansi</span>
                    </div>
                    <span className="text-xs font-bold text-cyan-500">AI rejalashtiruvchi</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-3">
                      <Sprout className="text-emerald-500" size={20} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ekin Unumdorligi</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">Gemini Vision</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-blue-500" size={20} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Hosil Prognozi</span>
                    </div>
                    <span className="text-xs font-bold text-blue-500">Batafsil Tahlillar</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6 order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase w-fit">
                <ShieldCheck size={14} />
                Bizning Yechim
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                AquaMind AI — Aqlli Dehqonchilik
              </h2>
              <p className="text-slate-500 dark:text-slate-450 leading-relaxed text-sm sm:text-base">
                Platforma fermerlar kiritgan ma'lumotlarni (ekin turi, hudud, oxirgi sug'orish sanasi) sun'iy intellekt yordamida tahlil qilib, aniq sug'orish taqvimini tuzadi. Gemini Vision modeli orqali esa ekin bargi suratidan uning kasalliklarini va risk darajasini bir necha soniyada aniqlaydi.
              </p>
              
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Suv sarfini real vaqtda optimallashtirish.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Hosildorlik xavfini va qurg'oqchilikni prognozlash.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">AI Agronomist bilan doimiy muloqot va maslahatlar.</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-8">
          <div className="text-center flex flex-col items-center gap-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-500">Platforma funksiyalari</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Sizga Taqdim Etiladigan Imkoniyatlar
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-450 max-w-xl">
              Fermerligingizni yangi bosqichga ko‘tarish va suv resurslarini 100% nazorat qilish uchun mo'ljallangan modullar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard hoverEffect={true} className="flex flex-col gap-4 p-8">
              <div className="bg-cyan-500/10 text-cyan-500 p-3 rounded-2xl w-fit">
                <Droplets size={24} />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Aqlli Sug'orish</h3>
              <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
                Ekin turi, tuproq sharoiti, maydon hajmi va hududiy iqlim ma'lumotlarini hisobga olib, suv sarfini minimal darajaga tushiruvchi algoritm.
              </p>
            </GlassCard>

            <GlassCard hoverEffect={true} className="flex flex-col gap-4 p-8">
              <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-2xl w-fit">
                <Sprout size={24} />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Ekin Analizi</h3>
              <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
                Gemini Vision sun'iy intellekti ekin barglari fotosurati orqali kasallik va zararkunanda xavflarini 92% aniqlikda tahlil qilib beradi.
              </p>
            </GlassCard>

            <GlassCard hoverEffect={true} className="flex flex-col gap-4 p-8">
              <div className="bg-blue-500/10 text-blue-500 p-3 rounded-2xl w-fit">
                <Cpu size={24} />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">AI Agronom Chat</h3>
              <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
                Agrosanoat sohasida ixtisoslashgan chat yordamchisi. Istalgan vaqtda fermerlik muammolari bo‘yicha batafsil tavsiyalar olishingiz mumkin.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center bg-gradient-to-tr from-cyan-500/10 via-emerald-500/5 to-transparent border border-white/20 dark:border-white/5 shadow-2xl">
          <div className="absolute inset-0 bg-[#06b6d4]/5 dark:bg-[#06b6d4]/2 blur-xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Suvni Tejashni Bugundanoq Boshlang
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8">
            AquaMind AI platformasini faollashtiring, ekinlaringizni tahlil qiling va har bir tomchi suvning qadriga eting.
          </p>
          <Link href="/dashboard" onClick={playClick} className="inline-block">
            <GlassButton variant="primary" className="text-base font-bold" glow>
              Boshqaruv Paneliga O'tish <ArrowRight size={18} />
            </GlassButton>
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200/50 dark:border-white/5 py-8 mt-12 text-center text-xs text-slate-400 dark:text-slate-450 relative z-10">
        <p>&copy; 2026 AquaMind AI — Har Tomchi Muhim. Milliy AI Hackathon uchun maxsus tayyorlandi.</p>
      </footer>
    </div>
  );
}
