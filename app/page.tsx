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
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [val, setVal] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (prefersReduced) { setVal(target); return; }
    const obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 2, ease: "power2.out", onUpdate: () => setVal(Math.round(obj.v)) });
  }, [isInView, target, prefersReduced]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function MagneticButton({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const prefersReduced = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    gsap.to(el, { x: (e.clientX - rect.left - rect.width / 2) * 0.3, y: (e.clientY - rect.top - rect.height / 2) * 0.3, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    if (prefersReduced) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  return <Link ref={ref} href={href} className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{children}</Link>;
}

function FloatingOrbs() {
  const prefersReduced = useReducedMotion();
  const orbs = [
    { cls: "w-[600px] h-[600px] bg-blue-600/[0.08]", blur: "blur-[120px]", pos: { top: "10%", left: "30%" }, anim: { x: ["-10%", "10%", "-10%"], y: ["-5%", "5%", "-5%"] }, dur: 20 },
    { cls: "w-[400px] h-[400px] bg-red-600/[0.05]", blur: "blur-[100px]", pos: { top: "40%", left: "60%" }, anim: { x: ["10%", "-10%", "10%"], y: ["5%", "-10%", "5%"] }, dur: 25 },
    { cls: "w-[300px] h-[300px] bg-blue-500/[0.04]", blur: "blur-[80px]", pos: { top: "60%", left: "20%" }, anim: { x: ["-15%", "15%", "-15%"], y: ["10%", "-5%", "10%"] }, dur: 18 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((o, i) => prefersReduced ? (
        <div key={i} className={`absolute rounded-full ${o.cls} ${o.blur}`} style={o.pos} />
      ) : (
        <motion.div key={i} className={`absolute rounded-full ${o.cls} ${o.blur}`} animate={o.anim} transition={{ duration: o.dur, repeat: Infinity, ease: "linear" }} style={o.pos} />
      ))}
    </div>
  );
}

function MoneySymbols() {
  const prefersReduced = useReducedMotion();
  const symbols = [
    { char: "$", x: "5%", y: "10%", size: "text-[120px]", dur: 22, delay: 0 },
    { char: "€", x: "85%", y: "15%", size: "text-[90px]", dur: 26, delay: 2 },
    { char: "£", x: "78%", y: "50%", size: "text-[100px]", dur: 20, delay: 1 },
    { char: "$", x: "12%", y: "65%", size: "text-[80px]", dur: 24, delay: 3 },
    { char: "¥", x: "90%", y: "75%", size: "text-[85px]", dur: 18, delay: 0.5 },
    { char: "₿", x: "3%", y: "38%", size: "text-[70px]", dur: 28, delay: 1.5 },
    { char: "$", x: "48%", y: "85%", size: "text-[150px]", dur: 30, delay: 0 },
    { char: "€", x: "32%", y: "25%", size: "text-[60px]", dur: 21, delay: 2.5 },
    { char: "£", x: "62%", y: "5%", size: "text-[75px]", dur: 23, delay: 1 },
    { char: "$", x: "22%", y: "90%", size: "text-[95px]", dur: 19, delay: 0 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {symbols.map((s, i) => prefersReduced ? (
        <span key={i} className={`absolute ${s.size} font-bold text-blue-400/25 select-none font-[family-name:var(--font-heading)]`} style={{ left: s.x, top: s.y }}>{s.char}</span>
      ) : (
        <motion.span
          key={i}
          className={`absolute ${s.size} font-bold text-blue-400/25 select-none font-[family-name:var(--font-heading)]`}
          style={{ left: s.x, top: s.y }}
          animate={{ y: [0, -30, 0], rotate: [0, 5, -5, 0], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        >{s.char}</motion.span>
      ))}
    </div>
  );
}

function FinanceBg() {
  const { scrollYProgress } = useScroll();
  const prefersReduced = useReducedMotion();
  const draw = useTransform(scrollYProgress, [0, 0.6], prefersReduced ? [1, 1] : [0, 1]);
  const bgY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [0, -200]);
  const fade = useTransform(scrollYProgress, [0, 0.15, 0.5, 0.85, 1], [0.25, 0.5, 0.45, 0.3, 0.15]);

  const mainLine = "M0,340 C80,310 160,280 240,250 C320,220 360,300 440,260 C520,220 560,170 640,190 C720,210 800,140 880,120 C960,100 1040,150 1120,110 C1200,70 1280,90 1360,50 C1440,30 1520,60 1600,20";
  const mainArea = mainLine + " L1600,500 L0,500 Z";
  const line2 = "M0,380 C100,360 200,390 300,350 C400,310 500,340 600,300 C700,280 800,320 900,270 C1000,240 1100,260 1200,220 C1300,190 1400,210 1500,170 L1600,150";
  const line3 = "M0,420 C120,400 240,430 360,390 C480,350 600,380 720,340 C840,310 960,350 1080,300 C1200,260 1320,280 1440,240 L1600,210";

  const candles = [
    { x: 120, o: 280, c: 240, h: 220, l: 310 }, { x: 240, o: 250, c: 290, h: 230, l: 320 },
    { x: 360, o: 300, c: 250, h: 230, l: 330 }, { x: 480, o: 260, c: 220, h: 200, l: 290 },
    { x: 600, o: 230, c: 270, h: 210, l: 300 }, { x: 720, o: 190, c: 230, h: 170, l: 260 },
    { x: 840, o: 200, c: 160, h: 140, l: 230 }, { x: 960, o: 150, c: 180, h: 130, l: 210 },
    { x: 1080, o: 170, c: 130, h: 110, l: 200 }, { x: 1200, o: 120, c: 150, h: 100, l: 180 },
    { x: 1320, o: 140, c: 100, h: 80, l: 170 }, { x: 1440, o: 90, c: 60, h: 40, l: 130 },
  ];

  const gridLines = [100, 180, 260, 340, 420];
  const priceLabels = ["$48,200", "$42,800", "$37,400", "$32,000", "$26,600"];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div className="absolute inset-0 top-[25%]" style={{ y: bgY, opacity: fade }}>
        <svg viewBox="0 0 1600 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="20%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="80%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
            </linearGradient>
            <filter id="softGlow"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {gridLines.map((y, i) => (
            <g key={`grid-${i}`}>
              <line x1="60" y1={y} x2="1560" y2={y} stroke="#94a3b8" strokeWidth="0.5" opacity="0.08" strokeDasharray="8 8" />
              <text x="30" y={y + 4} fill="#64748b" fontSize="11" textAnchor="end" opacity="0.3" fontFamily="monospace">{priceLabels[i]}</text>
            </g>
          ))}
          {[120, 360, 600, 840, 1080, 1320].map((x, i) => (
            <line key={`vgrid-${i}`} x1={x} y1="60" x2={x} y2="460" stroke="#94a3b8" strokeWidth="0.5" opacity="0.05" strokeDasharray="4 8" />
          ))}
          <motion.path d={mainArea} fill="url(#areaFill)" style={{ pathLength: draw }} />
          {candles.map((c, i) => {
            const bull = c.c < c.o;
            const color = bull ? "#3b82f6" : "#ef4444";
            return (
              <motion.g key={`candle-${i}`} style={{ opacity: draw }}>
                <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={color} strokeWidth="1.5" opacity="0.15" />
                <rect x={c.x - 12} y={Math.min(c.o, c.c)} width={24} height={Math.abs(c.o - c.c)} fill={color} opacity="0.1" rx="3" />
              </motion.g>
            );
          })}
          <motion.path d={mainLine} fill="none" stroke="url(#lineGlow)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#softGlow)" pathLength={1} style={{ pathLength: draw }} />
          <motion.path d={mainLine} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={{ pathLength: draw }} />
          <motion.path d={line2} fill="none" stroke="#60a5fa" strokeWidth="1" strokeLinecap="round" opacity="0.15" pathLength={1} style={{ pathLength: draw }} strokeDasharray="6 4" />
          <motion.path d={line3} fill="none" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" opacity="0.08" pathLength={1} style={{ pathLength: draw }} strokeDasharray="4 6" />
          {[[0, 340], [240, 250], [440, 260], [640, 190], [880, 120], [1120, 110], [1360, 50], [1600, 20]].map(([cx, cy], i) => (
            <motion.g key={`dot-${i}`} style={{ opacity: draw }}>
              <circle cx={cx} cy={cy} r="8" fill="#3b82f6" opacity="0.1" filter="url(#softGlow)" />
              <circle cx={cx} cy={cy} r="4" fill="#060B18" stroke="#3b82f6" strokeWidth="2" opacity="0.7" />
            </motion.g>
          ))}
          <motion.g style={{ opacity: draw }}>
            <rect x="1360" y="18" width="90" height="28" rx="6" fill="#3b82f6" opacity="0.15" />
            <text x="1405" y="37" fill="#60a5fa" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold" opacity="0.6">$48,240</text>
          </motion.g>
          <motion.line x1="60" y1="50" x2="1360" y2="50" stroke="#3b82f6" strokeWidth="0.5" opacity="0.15" strokeDasharray="4 4" style={{ pathLength: draw }} />
        </svg>
      </motion.div>
    </div>
  );
}

function GridBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060B18] via-transparent to-[#060B18]" />
    </div>
  );
}

const features = [
  { icon: LayoutDashboard, title: "Smart Dashboard", desc: "Your complete financial picture. Income, expenses, trends, and recent activity — all live, all real-time.", gradient: "from-blue-500/20 to-blue-500/0", iconBg: "bg-blue-500/10", iconColor: "text-blue-400", borderHover: "hover:border-blue-500/30" },
  { icon: ArrowLeftRight, title: "Transaction Engine", desc: "Add in seconds, filter in milliseconds. Every dollar tracked with categories, notes, and instant search.", gradient: "from-sky-500/20 to-sky-500/0", iconBg: "bg-sky-500/10", iconColor: "text-sky-400", borderHover: "hover:border-sky-500/30" },
  { icon: BarChart3, title: "Visual Analytics", desc: "Donut breakdowns, trend lines, and bar charts that make your spending patterns impossible to ignore.", gradient: "from-red-500/15 to-red-500/0", iconBg: "bg-red-500/10", iconColor: "text-red-400", borderHover: "hover:border-red-500/30" },
  { icon: Sparkles, title: "AI Insights", desc: "Gemini analyzes your transactions and gives you real, actionable advice — not generic tips from a blog.", gradient: "from-violet-500/20 to-violet-500/0", iconBg: "bg-violet-500/10", iconColor: "text-violet-400", borderHover: "hover:border-violet-500/30" },
];

function ScrollItem({ children, index, direction = "up" }: { children: React.ReactNode; index: number; direction?: "up" | "left" | "right" }) {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.8"] });

  const baseDelay = index * 0.08;
  const progress = useTransform(scrollYProgress, [0, 1], [0 - baseDelay, 1 - baseDelay]);
  const clamped = useTransform(progress, (v) => Math.max(0, Math.min(1, v)));

  const yVal = direction === "up" ? 100 : 0;
  const xVal = direction === "left" ? -120 : direction === "right" ? 120 : 0;

  const y = useTransform(clamped, [0, 1], prefersReduced ? [0, 0] : [yVal, 0]);
  const x = useTransform(clamped, [0, 1], prefersReduced ? [0, 0] : [xVal, 0]);
  const opacity = useTransform(clamped, [0, 0.3, 1], prefersReduced ? [1, 1, 1] : [0, 0.5, 1]);
  const scale = useTransform(clamped, [0, 1], prefersReduced ? [1, 1] : [0.85, 1]);

  return <motion.div ref={ref} style={{ x, y, opacity, scale }}>{children}</motion.div>;
}

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  const fromLeft = index % 2 === 0;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.8"] });

  const x = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [fromLeft ? -150 : 150, 0]);
  const y = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [80, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], prefersReduced ? [1, 1, 1] : [0, 0.5, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], prefersReduced ? [1, 1] : [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [fromLeft ? -5 : 5, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y, opacity, scale, rotate }}
      className={`group relative cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl transition-colors duration-300 ${feature.borderHover} hover:bg-white/[0.05]`}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative">
        <div className={`rounded-2xl ${feature.iconBg} p-3.5 w-fit mb-6 border border-white/[0.06]`}>
          <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
        </div>
        <h3 className="text-xl font-semibold text-slate-100 mb-3 font-[family-name:var(--font-heading)]">{feature.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
      </div>
    </motion.div>
  );
}

function TickerTape() {
  const prefersReduced = useReducedMotion();
  const items = ["Smart Budgeting", "AI Analysis", "Real-time Sync", "Category Tracking", "Expense Reports", "Trend Detection", "Secure Auth", "Visual Charts", "Smart Budgeting", "AI Analysis", "Real-time Sync", "Category Tracking", "Expense Reports", "Trend Detection", "Secure Auth", "Visual Charts"];

  return (
    <div className="overflow-hidden py-8 border-y border-white/[0.04]">
      <motion.div className="flex gap-8 whitespace-nowrap" animate={prefersReduced ? {} : { x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-3 text-sm text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400/60" />{item}
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
    <motion.div ref={ref} style={{ y: springY, rotateX: springRotate, perspective: 1000 }} className="mx-auto max-w-4xl">
      <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="rounded-xl bg-[#0A1028]/80 p-5 lg:p-6">
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
              { label: "INCOME", value: "$8,450", change: "+12.5%", up: true, color: "blue" },
              { label: "EXPENSES", value: "$3,280", change: "-8.2%", up: false, color: "red" },
              { label: "SAVED", value: "$5,170", change: "61%", up: true, color: "blue" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">{stat.label}</p>
                <p className={`text-xl font-bold font-[family-name:var(--font-heading)] text-${stat.color}-400`}>{stat.value}</p>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className={`h-3 w-3 text-${stat.color}-500 ${!stat.up ? "rotate-180" : ""}`} />
                  <span className={`text-[10px] font-medium text-${stat.color}-500`}>{stat.change}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6, duration: 0.5 }} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-400">Monthly Overview</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="h-2 w-2 rounded-full bg-blue-500" /> Income</span>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className="h-2 w-2 rounded-full bg-red-500/50" /> Expenses</span>
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-28">
              {bars.map((h, i) => (
                <motion.div key={i} className="flex-1 flex flex-col gap-[2px] items-stretch justify-end h-full" initial={prefersReduced ? { scaleY: 1 } : { scaleY: 0 }} animate={isInView ? { scaleY: 1 } : {}} transition={{ delay: 0.7 + i * 0.05, duration: 0.5, ease: "backOut" }} style={{ originY: 1 }}>
                  <div className="rounded-sm bg-blue-500/80" style={{ height: `${h}%` }} />
                  <div className="rounded-sm bg-red-500/30" style={{ height: `${h * 0.4}%` }} />
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
  const gradientClass = gradient ? "bg-gradient-to-r from-blue-400 via-blue-300 to-sky-400 bg-clip-text text-transparent" : "";

  if (prefersReduced) return <span ref={ref} className={`${className} ${gradientClass}`}>{children}</span>;

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <motion.span className={`inline-block ${gradientClass}`} initial={{ y: "100%" }} animate={isInView ? { y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}>{word}</motion.span>
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
    <div className="min-h-screen bg-[#060B18] text-slate-50 overflow-x-hidden selection:bg-blue-500/30 selection:text-white">
      <GridBg />
      <FloatingOrbs />
      <FinanceBg />
      <MoneySymbols />

      {/* Nav */}
      <motion.nav initial={prefersReduced ? { opacity: 1 } : { y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="fixed top-4 left-0 right-0 z-50">
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative flex h-14 items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0A1028]/70 backdrop-blur-2xl px-6">
            <span className="text-lg font-bold tracking-tight font-[family-name:var(--font-heading)]">Financer</span>
            <div className="hidden sm:flex items-center gap-8 text-sm text-slate-400 absolute left-1/2 -translate-x-1/2">
              <button onClick={() => handleSmoothScroll("features")} className="hover:text-slate-100 transition-colors duration-200 cursor-pointer">Features</button>
              <button onClick={() => handleSmoothScroll("preview")} className="hover:text-slate-100 transition-colors duration-200 cursor-pointer">Preview</button>
              <button onClick={() => handleSmoothScroll("stack")} className="hover:text-slate-100 transition-colors duration-200 cursor-pointer">Stack</button>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-lg px-4 py-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">Log in</Link>
              <Link href="/login?signup=true" className="rounded-xl bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors duration-200 cursor-pointer">Sign up free</Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale }} className="relative flex items-center justify-center min-h-screen">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight leading-[1.08] sm:text-7xl lg:text-8xl font-[family-name:var(--font-heading)]">
            <TextReveal className="block">Money, but</TextReveal>
            <TextReveal className="block" gradient>make it simple</TextReveal>
          </h1>

          <motion.p initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mt-8 text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            Stop guessing where your money goes. Track every dollar, spot patterns instantly, and let AI handle the rest.
          </motion.p>

          <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="mt-10 flex justify-center">
            <MagneticButton href="/login?signup=true" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:bg-blue-500 transition-all duration-200 cursor-pointer">
              Start for free <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </motion.div>

        </div>
      </motion.section>

      <section id="preview" className="relative px-6 pt-8 pb-16"><DashboardMock /></section>
      <TickerTape />

      {/* Features */}
      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-lg mb-16">
            <motion.p initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-4">Features</motion.p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl leading-tight font-[family-name:var(--font-heading)]"><TextReveal>Four tools. Zero friction.</TextReveal></h2>
            <motion.p initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-4 text-slate-400 leading-relaxed">Everything you need to understand your money. Nothing you don&apos;t.</motion.p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}</div>
        </div>
      </section>

      {/* Numbers */}
      <section className="relative py-20 border-y border-white/[0.04]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: 9, suffix: "+", label: "Default Categories", icon: BarChart3 },
              { value: 100, suffix: "%", label: "Free Forever", icon: Zap },
              { value: 256, suffix: "-bit", label: "Encryption", icon: Shield },
              { value: 1, suffix: "s", label: "To Add a Transaction", icon: Lock },
            ].map((stat, i) => (
              <ScrollItem key={stat.label} index={i} direction="up">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <stat.icon className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-50 tracking-tight font-[family-name:var(--font-heading)]"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></p>
                  <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              </ScrollItem>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="stack" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <motion.p initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-4">Built with</motion.p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-[family-name:var(--font-heading)]"><TextReveal>Production-grade stack</TextReveal></h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { name: "Next.js", desc: "React Framework", icon: "N" },
              { name: "Supabase", desc: "Auth & Database", icon: "S" },
              { name: "Tailwind", desc: "Utility-first CSS", icon: "T" },
              { name: "Gemini", desc: "AI Insights", icon: "G" },
            ].map((tech, i) => (
              <ScrollItem key={tech.name} index={i} direction="up">
                <div className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center hover:border-blue-500/20 transition-all duration-300 backdrop-blur-sm hover:-translate-y-2">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A1028] border border-white/[0.08] text-lg font-bold text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300 font-mono">{tech.icon}</div>
                  <h3 className="text-sm font-semibold text-slate-200">{tech.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{tech.desc}</p>
                </div>
              </ScrollItem>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollItem index={0} direction="up">
          <div
            className="relative rounded-3xl border border-white/[0.06] bg-gradient-to-br from-blue-950/30 via-[#0A1028]/40 to-[#0A1028]/20 px-8 py-20 text-center overflow-hidden backdrop-blur-xl">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-blue-600/10 blur-[100px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl leading-tight font-[family-name:var(--font-heading)]">
                <TextReveal>Your money deserves</TextReveal><br />
                <span className="text-slate-400"><TextReveal>better than a spreadsheet.</TextReveal></span>
              </h2>
              <motion.p initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-5 text-slate-400">Free to use. Takes 30 seconds to set up.</motion.p>
              <motion.div initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="mt-8">
                <MagneticButton href="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#0A1028] hover:bg-slate-200 transition-colors duration-200 cursor-pointer">
                  Get started <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </motion.div>
            </div>
          </div>
          </ScrollItem>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#030712]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4">Financer</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Smart money management powered by AI. Track, analyze, and optimize your finances.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => handleSmoothScroll("features")} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Features</button></li>
                <li><button onClick={() => handleSmoothScroll("preview")} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Preview</button></li>
                <li><button onClick={() => handleSmoothScroll("stack")} className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Tech Stack</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Account</h4>
              <ul className="space-y-2.5">
                <li><Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Sign In</Link></li>
                <li><Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><Link href="/about" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">About Us</Link></li>
                <li><Link href="/terms" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-sm text-slate-600">&copy; {new Date().getFullYear()} Financer. All rights reserved.</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-slate-600">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
