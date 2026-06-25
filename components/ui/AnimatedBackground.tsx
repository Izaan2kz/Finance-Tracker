"use client";

import { motion, useReducedMotion } from "framer-motion";

function FloatingOrbs() {
  const prefersReduced = useReducedMotion();
  const orbs = [
    { cls: "w-[600px] h-[600px] bg-blue-600/[0.08]", blur: "blur-[120px]", pos: { top: "10%", left: "30%" }, anim: { x: ["-10%", "10%", "-10%"], y: ["-5%", "5%", "-5%"] }, dur: 20 },
    { cls: "w-[400px] h-[400px] bg-red-600/[0.05]", blur: "blur-[100px]", pos: { top: "40%", left: "60%" }, anim: { x: ["10%", "-10%", "10%"], y: ["5%", "-10%", "5%"] }, dur: 25 },
    { cls: "w-[300px] h-[300px] bg-blue-500/[0.04]", blur: "blur-[80px]", pos: { top: "60%", left: "20%" }, anim: { x: ["-15%", "15%", "-15%"], y: ["10%", "-5%", "10%"] }, dur: 18 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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

function GridBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060B18] via-transparent to-[#060B18]" />
    </div>
  );
}

export default function AnimatedBackground() {
  return (
    <>
      <GridBg />
      <FloatingOrbs />
      <MoneySymbols />
    </>
  );
}
