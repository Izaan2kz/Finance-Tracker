"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function DashboardBackground() {
  const prefersReduced = useReducedMotion();

  const orbs = [
    { cls: "w-[500px] h-[500px] bg-blue-600/[0.06]", blur: "blur-[120px]", pos: { top: "5%", left: "60%" }, anim: { x: ["-8%", "8%", "-8%"], y: ["-4%", "4%", "-4%"] }, dur: 22 },
    { cls: "w-[350px] h-[350px] bg-indigo-600/[0.04]", blur: "blur-[100px]", pos: { top: "50%", left: "20%" }, anim: { x: ["6%", "-6%", "6%"], y: ["4%", "-8%", "4%"] }, dur: 28 },
    { cls: "w-[250px] h-[250px] bg-blue-500/[0.03]", blur: "blur-[80px]", pos: { top: "70%", right: "10%" }, anim: { x: ["-10%", "10%", "-10%"], y: ["6%", "-4%", "6%"] }, dur: 20 },
  ];

  const symbols = [
    { char: "$", x: "3%", y: "12%", size: "text-[100px]", dur: 24, delay: 0 },
    { char: "€", x: "88%", y: "8%", size: "text-[75px]", dur: 28, delay: 1.5 },
    { char: "£", x: "82%", y: "45%", size: "text-[85px]", dur: 22, delay: 0.5 },
    { char: "$", x: "8%", y: "60%", size: "text-[70px]", dur: 26, delay: 2 },
    { char: "¥", x: "92%", y: "72%", size: "text-[65px]", dur: 20, delay: 1 },
    { char: "₿", x: "5%", y: "35%", size: "text-[55px]", dur: 30, delay: 3 },
    { char: "$", x: "50%", y: "88%", size: "text-[110px]", dur: 32, delay: 0 },
    { char: "€", x: "35%", y: "18%", size: "text-[50px]", dur: 23, delay: 2.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060B18] via-transparent to-[#060B18]" />

      {/* Orbs */}
      {orbs.map((o, i) => prefersReduced ? (
        <div key={`orb-${i}`} className={`absolute rounded-full ${o.cls} ${o.blur}`} style={o.pos} />
      ) : (
        <motion.div key={`orb-${i}`} className={`absolute rounded-full ${o.cls} ${o.blur}`} animate={o.anim} transition={{ duration: o.dur, repeat: Infinity, ease: "linear" }} style={o.pos} />
      ))}

      {/* Money Symbols */}
      {symbols.map((s, i) => prefersReduced ? (
        <span key={`sym-${i}`} className={`absolute ${s.size} font-bold text-blue-400/15 select-none font-[family-name:var(--font-heading)]`} style={{ left: s.x, top: s.y }}>{s.char}</span>
      ) : (
        <motion.span
          key={`sym-${i}`}
          className={`absolute ${s.size} font-bold text-blue-400/15 select-none font-[family-name:var(--font-heading)]`}
          style={{ left: s.x, top: s.y }}
          animate={{ y: [0, -20, 0], rotate: [0, 3, -3, 0], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        >{s.char}</motion.span>
      ))}
    </div>
  );
}
