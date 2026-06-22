"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView, useSpring, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BarChart3,
  ArrowLeftRight,
  Sparkles,
  LayoutDashboard,
  TrendingUp,
  Shield,
  Zap,
  Lock,
  ChevronRight,
  MousePointerClick,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [val, setVal] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (prefersReduced) {
      setVal(target);
      return;
    }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => setVal(Math.round(obj.v)),
    });
  }, [isInView, target, prefersReduced]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

function MagneticButton({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const prefersReduced = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    if (prefersReduced) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
}

function FloatingOrbs() {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-emerald-600/[0.07] blur-[120px]" style={{ top: "10%", left: "30%" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-teal-600/[0.05] blur-[100px]" style={{ top: "40%", left: "60%" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-600/[0.04] blur-[80px]" style={{ top: "60%", left: "20%" }} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-emerald-600/[0.07] blur-[120px]"
        animate={{ x: ["-10%", "10%", "-10%"], y: ["-5%", "5%", "-5%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ top: "10%", left: "30%" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-teal-600/[0.05] blur-[100px]"
        animate={{ x: ["10%", "-10%", "10%"], y: ["5%", "-10%", "5%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ top: "40%", left: "60%" }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-emerald-600/[0.04] blur-[80px]"
        animate={{ x: ["-15%", "15%", "-15%"], y: ["10%", "-5%", "10%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ top: "60%", left: "20%" }}
      />
    </div>
  );
}

function GridBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
    </div>
  );
}

const features = [
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    desc: "Your complete financial picture. Income, expenses, trends, and recent activity — all live, all real-time.",
    gradient: "from-emerald-500/20 to-emerald-500/0",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    borderHover: "hover:border-emerald-500/30",
  },
  {
    icon: ArrowLeftRight,
    title: "Transaction Engine",
    desc: "Add in seconds, filter in milliseconds. Every dollar tracked with categories, notes, and instant search.",
    gradient: "from-teal-500/20 to-teal-500/0",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-400",
    borderHover: "hover:border-teal-500/30",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    desc: "Donut breakdowns, trend lines, and bar charts that make your spending patterns impossible to ignore.",
    gradient: "from-cyan-500/20 to-cyan-500/0",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    borderHover: "hover:border-cyan-500/30",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    desc: "Gemini analyzes your transactions and gives you real, actionable advice — not generic tips from a blog.",
    gradient: "from-violet-500/20 to-violet-500/0",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    borderHover: "hover:border-violet-500/30",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-300 ${feature.borderHover} hover:bg-white/[0.05]`}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative">
        <motion.div
          className={`rounded-2xl ${feature.iconBg} p-3.5 w-fit mb-6 border border-white/[0.06]`}
          whileHover={prefersReduced ? {} : { scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
        </motion.div>
        <h3 className="text-xl font-semibold text-slate-100 mb-3">{feature.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
      </div>
    </motion.div>
  );
}

function TickerTape() {
  const prefersReduced = useReducedMotion();
  const items = [
    "Smart Budgeting", "AI Analysis", "Real-time Sync", "Category Tracking",
    "Expense Reports", "Trend Detection", "Secure Auth", "Visual Charts",
    "Smart Budgeting", "AI Analysis", "Real-time Sync", "Category Tracking",
    "Expense Reports", "Trend Detection", "Secure Auth", "Visual Charts",
  ];

  return (
    <div className="overflow-hidden py-8 border-y border-white/[0.04]">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={prefersReduced ? {} : { x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-3 text-sm text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function DashboardMock() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const y = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [60, -60]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], prefersReduced ? [0, 0] : [8, 0]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springRotate = useSpring(rotateX, { stiffness: 100, damping: 30 });

  const bars = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 90, 68];

  return (
    <motion.div
      ref={ref}
      style={{ y: springY, rotateX: springRotate, perspective: 1000 }}
      className="mx-auto max-w-4xl"
    >
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
      >
        <div className="rounded-xl bg-slate-900/80 p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
            <div className="ml-4 h-6 flex-1 max-w-xs rounded-lg bg-slate-800/60 flex items-center justify-center">
              <span className="text-[10px] text-slate-500 font-mono">financer.app/dashboard</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "INCOME", value: "$8,450", change: "+12.5%", up: true, color: "emerald" },
              { label: "EXPENSES", value: "$3,280", change: "-8.2%", up: false, color: "red" },
              { label: "SAVED", value: "$5,170", change: "61%", up: true, color: "emerald" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">{stat.label}</p>
                <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className={`h-3 w-3 text-${stat.color}-500 ${!stat.up ? "rotate-180" : ""}`} />
                  <span className={`text-[10px] font-medium text-${stat.color}-500`}>{stat.change}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-400">Monthly Overview</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-600" /> Expenses
                </span>
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-28">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 flex flex-col gap-[2px] items-stretch justify-end h-full"
                  initial={prefersReduced ? { scaleY: 1 } : { scaleY: 0 }}
                  animate={isInView ? { scaleY: 1 } : {}}
                  transition={{ delay: 0.7 + i * 0.05, duration: 0.5, ease: "backOut" }}
                  style={{ originY: 1 }}
                >
                  <div className="rounded-sm bg-emerald-500/80" style={{ height: `${h}%` }} />
                  <div className="rounded-sm bg-slate-700/40" style={{ height: `${h * 0.4}%` }} />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-3">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                <span key={m} className="text-[8px] text-slate-600 flex-1 text-center">{m}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TextReveal({ children, className, gradient }: { children: string; className?: string; gradient?: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReduced = useReducedMotion();
  const words = children.split(" ");

  const gradientClass = gradient ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent" : "";

  if (prefersReduced) {
    return <span ref={ref} className={`${className} ${gradientClass}`}>{children}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <motion.span
            className={`inline-block ${gradientClass}`}
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function HomePage() {
  const heroRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], prefersReduced ? [1, 1] : [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], prefersReduced ? [1, 1] : [1, 0.95]);

  const handleSmoothScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 overflow-x-hidden selection:bg-emerald-500/30 selection:text-white">
      <GridBg />
      <FloatingOrbs />

      {/* Floating Nav */}
      <motion.nav
        initial={prefersReduced ? { opacity: 1 } : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-4 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative flex h-14 items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0F172A]/70 backdrop-blur-2xl px-6">
            <span className="text-lg font-bold tracking-tight">Financer</span>
            <div className="hidden sm:flex items-center gap-8 text-sm text-slate-400 absolute left-1/2 -translate-x-1/2">
              <button onClick={() => handleSmoothScroll("features")} className="hover:text-slate-100 transition-colors duration-200 cursor-pointer">Features</button>
              <button onClick={() => handleSmoothScroll("preview")} className="hover:text-slate-100 transition-colors duration-200 cursor-pointer">Preview</button>
              <button onClick={() => handleSmoothScroll("stack")} className="hover:text-slate-100 transition-colors duration-200 cursor-pointer">Stack</button>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-lg px-4 py-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">
                Log in
              </Link>
              <Link href="/login" className="rounded-xl bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-400 transition-colors duration-200 cursor-pointer">
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-36 pb-8 lg:pt-48 lg:pb-12">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs text-slate-400 mb-8 hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Now with AI-powered insights
              <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>

          <h1 className="text-5xl font-bold tracking-tight leading-[1.08] sm:text-7xl lg:text-8xl">
            <TextReveal className="block">Money, but</TextReveal>
            <TextReveal className="block" gradient>make it simple</TextReveal>
          </h1>

          <motion.p
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-7 text-lg text-slate-400 max-w-lg mx-auto leading-relaxed"
          >
            Stop guessing where your money goes. Track every dollar,
            spot patterns instantly, and let AI handle the rest.
          </motion.p>

          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <MagneticButton
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:bg-emerald-400 transition-all duration-200 cursor-pointer"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5" />
              No credit card required
            </span>
          </motion.div>

          {/* Scroll indicator */}
          {!prefersReduced && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-16 flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-10 w-6 rounded-full border border-white/[0.08] flex items-start justify-center p-1.5"
              >
                <motion.div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Dashboard Preview */}
      <section id="preview" className="relative px-6 pt-8 pb-16">
        <DashboardMock />
      </section>

      {/* Ticker */}
      <TickerTape />

      {/* Features */}
      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-lg mb-16">
            <motion.p
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-4"
            >
              Features
            </motion.p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl leading-tight">
              <TextReveal>Four tools. Zero friction.</TextReveal>
            </h2>
            <motion.p
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-slate-400 leading-relaxed"
            >
              Everything you need to understand your money. Nothing you don&apos;t.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-20 border-y border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: 9, suffix: "+", label: "Default Categories", icon: BarChart3 },
              { value: 100, suffix: "%", label: "Free Forever", icon: Zap },
              { value: 256, suffix: "-bit", label: "Encryption", icon: Shield },
              { value: 1, suffix: "s", label: "To Add a Transaction", icon: Lock },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <stat.icon className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-slate-50 tracking-tight">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="stack" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <motion.p
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-4"
            >
              Built with
            </motion.p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <TextReveal>Production-grade stack</TextReveal>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { name: "Next.js", desc: "React Framework", icon: "N" },
              { name: "Supabase", desc: "Auth & Database", icon: "S" },
              { name: "Prisma", desc: "Type-safe ORM", icon: "P" },
              { name: "Gemini", desc: "AI Insights", icon: "G" },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={prefersReduced ? {} : { y: -4 }}
                className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center hover:border-emerald-500/20 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F172A] border border-white/[0.08] text-lg font-bold text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-300 font-mono">
                  {tech.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-200">{tech.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl border border-white/[0.06] bg-gradient-to-br from-emerald-950/20 via-[#0F172A]/40 to-[#0F172A]/20 px-8 py-20 text-center overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-emerald-600/10 blur-[100px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl leading-tight">
                <TextReveal>Your money deserves</TextReveal>
                <br />
                <span className="text-slate-400">
                  <TextReveal>better than a spreadsheet.</TextReveal>
                </span>
              </h2>
              <motion.p
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-5 text-slate-400"
              >
                Free to use. Takes 30 seconds to set up.
              </motion.p>
              <motion.div
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <MagneticButton
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#0F172A] hover:bg-slate-200 transition-colors duration-200 cursor-pointer"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Financer</span>
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
