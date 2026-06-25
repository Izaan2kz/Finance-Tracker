"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Target, Layers, Server, Heart } from "lucide-react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

const sections = [
  { icon: Target, title: "Our Mission", color: "blue", body: "Financer exists to make personal finance management simple, visual, and intelligent. We believe everyone deserves to understand where their money goes — without spreadsheets, manual calculations, or complicated software." },
  { icon: Layers, title: "What We Do", color: "sky", body: "Financer lets you track income and expenses, visualize spending patterns with interactive charts, and get AI-powered insights that help you make better financial decisions. Every feature is designed to be fast, intuitive, and useful from day one." },
  { icon: Server, title: "Our Stack", color: "red", body: "Built with Next.js, Supabase, and Google Gemini — Financer is a production-grade application that prioritizes security, performance, and reliability. Your data is encrypted and stored securely with Supabase's enterprise-grade infrastructure." },
  { icon: Heart, title: "Free Forever", color: "violet", body: "Financer is completely free to use. No hidden fees, no premium tiers, no credit card required. We believe financial awareness should be accessible to everyone." },
];

const colorMap: Record<string, { iconBg: string; iconText: string; border: string }> = {
  blue: { iconBg: "bg-blue-500/10", iconText: "text-blue-400", border: "border-blue-500/20" },
  sky: { iconBg: "bg-sky-500/10", iconText: "text-sky-400", border: "border-sky-500/20" },
  red: { iconBg: "bg-red-500/10", iconText: "text-red-400", border: "border-red-500/20" },
  violet: { iconBg: "bg-violet-500/10", iconText: "text-violet-400", border: "border-violet-500/20" },
};

export default function AboutPage() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#060B18] text-slate-50 overflow-x-hidden">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20">
        <motion.div initial={prefersReduced ? {} : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-16 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </motion.div>

        <motion.div initial={prefersReduced ? {} : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
          <h1 className="text-5xl font-bold tracking-tight font-[family-name:var(--font-heading)] mb-4">
            About <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">Financer</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">A modern personal finance tracker built for people who want clarity, not complexity.</p>
        </motion.div>

        <div className="grid gap-6">
          {sections.map((s, i) => {
            const c = colorMap[s.color];
            return (
              <motion.div
                key={s.title}
                initial={prefersReduced ? {} : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className={`group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm hover:${c.border} transition-all duration-300 hover:bg-white/[0.04]`}
              >
                <div className="flex items-start gap-5">
                  <div className={`rounded-xl ${c.iconBg} p-3 border border-white/[0.06] shrink-0`}>
                    <s.icon className={`h-5 w-5 ${c.iconText}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100 font-[family-name:var(--font-heading)] mb-3">{s.title}</h2>
                    <p className="text-slate-400 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-white/[0.04] flex items-center justify-between"
        >
          <p className="text-sm text-slate-500">Have questions? <span className="text-blue-400">hello@financer.app</span></p>
          <span className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Financer</span>
        </motion.div>
      </div>
    </div>
  );
}
