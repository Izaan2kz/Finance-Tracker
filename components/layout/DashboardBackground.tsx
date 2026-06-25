"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function DashboardBackground() {
  const prefersReduced = useReducedMotion();

  const orbs = [
    { cls: "w-[500px] h-[500px] bg-blue-600/[0.06]", blur: "blur-[120px]", pos: { top: "5%", left: "60%" }, anim: { x: ["-8%", "8%", "-8%"], y: ["-4%", "4%", "-4%"] }, dur: 22 },
    { cls: "w-[350px] h-[350px] bg-indigo-600/[0.04]", blur: "blur-[100px]", pos: { top: "50%", left: "20%" }, anim: { x: ["6%", "-6%", "6%"], y: ["4%", "-8%", "4%"] }, dur: 28 },
    { cls: "w-[250px] h-[250px] bg-blue-500/[0.03]", blur: "blur-[80px]", pos: { top: "70%", right: "10%" }, anim: { x: ["-10%", "10%", "-10%"], y: ["6%", "-4%", "6%"] }, dur: 20 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060B18] via-transparent to-[#060B18]" />
      {orbs.map((o, i) => prefersReduced ? (
        <div key={i} className={`absolute rounded-full ${o.cls} ${o.blur}`} style={o.pos} />
      ) : (
        <motion.div key={i} className={`absolute rounded-full ${o.cls} ${o.blur}`} animate={o.anim} transition={{ duration: o.dur, repeat: Infinity, ease: "linear" }} style={o.pos} />
      ))}
    </div>
  );
}
