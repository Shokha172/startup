import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaMind AI — Har Tomchi Muhim",
  description: "Sun'iy intellekt yordamida qishloq xo'jaligida suv sarfini optimallashtirish va hosildorlikni oshirish platformasi.",
  keywords: ["AquaMind", "AI Agriculture", "Suv tejash", "Smart Irrigation", "Uzbekistan Farmers", "Gemini AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-550 dark:bg-[#070a13] text-slate-800 dark:text-slate-100 transition-colors duration-500">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
