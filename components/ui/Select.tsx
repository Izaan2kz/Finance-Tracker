"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SelectProps {
  id?: string;
  label?: string;
  error?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: { value: string; label: string }[];
  className?: string;
  disabled?: boolean;
}

export default function Select({ label, error, value, onChange, options, className, disabled, id }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="space-y-1.5" ref={ref}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between rounded-xl border bg-white/[0.04] px-4 py-2.5 text-sm text-left transition-all duration-200 cursor-pointer",
          open ? "ring-2 ring-blue-500/50 border-blue-500/30 bg-white/[0.06]" : error ? "border-red-500/50" : "border-white/[0.08]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span className={selected?.value ? "text-slate-100" : "text-slate-500"}>
          {selected?.label || "Select..."}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="relative z-50"
          >
            <div className="absolute top-1 left-0 right-0 max-h-56 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0A1028]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 p-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange({ target: { value: opt.value } });
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                    opt.value === value
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
