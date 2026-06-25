"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

const sections = [
  { title: "1. Information We Collect", body: "We collect information you provide directly: your email address and password when creating an account, and the financial transaction data you enter into the application (amounts, categories, descriptions, dates)." },
  { title: "2. How We Use Your Information", list: ["To provide and maintain the Financer service", "To authenticate your identity and secure your account", "To generate personalized financial analytics and charts", "To produce AI-powered financial insights using Google Gemini", "To improve the service and fix issues"] },
  { title: "3. Data Storage & Security", body: "Your data is stored securely using Supabase's infrastructure with PostgreSQL databases. All data is encrypted in transit (TLS/SSL) and at rest (AES-256). Authentication is handled by Supabase Auth with industry-standard security practices." },
  { title: "4. Third-Party Services", body: "We use the following third-party services:", list: ["Supabase — Authentication and database hosting", "Google Gemini — AI-powered financial insights (transaction summaries are sent to generate insights; no raw financial data is stored by Google)"] },
  { title: "5. Data Sharing", body: "We do not sell, rent, or share your personal financial data with any third parties for marketing or advertising purposes. Data is only shared with the third-party services listed above as necessary to provide the service." },
  { title: "6. Your Rights", body: "You have the right to access, update, or delete your personal data at any time. You can delete your account and all associated data by contacting us. Upon account deletion, all your financial data will be permanently removed from our systems." },
  { title: "7. Cookies", body: "Financer uses essential cookies only for authentication and session management. We do not use tracking cookies, analytics cookies, or advertising cookies." },
  { title: "8. Changes to This Policy", body: "We may update this privacy policy from time to time. We will notify users of any material changes by posting the updated policy on this page with a revised date." },
  { title: "9. Contact", body: "If you have questions about this privacy policy or your data, contact us at privacy@financer.app." },
];

export default function PrivacyPage() {
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
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-red-500/10 p-3 border border-white/[0.06]">
              <ShieldCheck className="h-6 w-6 text-red-400" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight font-[family-name:var(--font-heading)]">Privacy Policy</h1>
          </div>
          <p className="text-sm text-slate-500 mt-2">Last updated: June 23, 2026</p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.06 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur-sm hover:bg-white/[0.04] transition-colors duration-300"
            >
              <h2 className="text-lg font-semibold text-slate-100 font-[family-name:var(--font-heading)] mb-3">{s.title}</h2>
              {s.body && <p className="text-slate-400 leading-relaxed text-[15px]">{s.body}</p>}
              {s.list && (
                <ul className="mt-2 space-y-2 ml-1">
                  {s.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-slate-400 text-[15px]">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-white/[0.04] flex items-center justify-between"
        >
          <p className="text-sm text-slate-500">Questions? <span className="text-blue-400">privacy@financer.app</span></p>
          <span className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Financer</span>
        </motion.div>
      </div>
    </div>
  );
}
