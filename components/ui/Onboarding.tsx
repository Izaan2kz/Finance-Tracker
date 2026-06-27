"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LayoutDashboard, ArrowLeftRight, BarChart3, Sparkles, Check } from "lucide-react";
import Button from "./Button";
import { createClient } from "@/lib/supabase";

const steps = [
  {
    icon: LayoutDashboard,
    title: "Welcome to Financer",
    description: "Your personal finance tracker powered by AI. Let's take a quick tour of what you can do.",
    color: "blue",
  },
  {
    icon: ArrowLeftRight,
    title: "Track Transactions",
    description: "Log your income and expenses in seconds. Categorize them, add notes, and search through your history.",
    color: "sky",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description: "See where your money goes with interactive charts — spending by category, trends over time, and monthly comparisons.",
    color: "red",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Get personalized financial advice powered by Google Gemini. It analyzes your patterns and suggests ways to save.",
    color: "violet",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", glow: "bg-blue-600/10" },
  sky: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20", glow: "bg-sky-600/10" },
  red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", glow: "bg-red-600/10" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20", glow: "bg-violet-600/10" },
};

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("users")
        .select("onboarded")
        .eq("supabase_id", user.id)
        .single()
        .then(({ data }) => {
          if (data && !data.onboarded) setShow(true);
        });
    });
  }, []);

  const finish = async () => {
    setShow(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("users").update({ onboarded: true }).eq("supabase_id", user.id);
    }
  };

  const current = steps[step];
  const c = colorMap[current.color];
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0A1028]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={`absolute -top-20 -right-20 w-[250px] h-[250px] rounded-full ${c.glow} blur-[80px]`} />
            </div>

            <div className="relative p-8 text-center">
              <motion.div
                key={`icon-${step}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={`mx-auto rounded-2xl ${c.bg} border ${c.border} p-5 w-fit mb-6`}
              >
                <current.icon className={`h-10 w-10 ${c.text}`} />
              </motion.div>

              <motion.h2
                key={`title-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="text-xl font-bold text-slate-100 font-[family-name:var(--font-heading)] mb-3"
              >
                {current.title}
              </motion.h2>

              <motion.p
                key={`desc-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto"
              >
                {current.description}
              </motion.p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-8 mb-6">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? `w-6 ${c.bg.replace("/10", "/40")} ${c.text.replace("text-", "bg-")}` : i < step ? "w-1.5 bg-slate-600" : "w-1.5 bg-white/[0.06]"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={finish} className="flex-1">
                  Skip
                </Button>
                <Button
                  size="sm"
                  onClick={() => isLast ? finish() : setStep(step + 1)}
                  className="flex-1"
                >
                  {isLast ? (
                    <>Get Started <Check className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>Next <ArrowRight className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
