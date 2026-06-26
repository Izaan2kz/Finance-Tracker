"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "danger", loading }: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose, loading]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === overlayRef.current && !loading) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0A1028]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 p-6"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className={`rounded-xl p-2.5 shrink-0 ${variant === "danger" ? "bg-red-500/10" : "bg-blue-500/10"}`}>
                <AlertTriangle className={`h-5 w-5 ${variant === "danger" ? "text-red-400" : "text-blue-400"}`} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100 font-[family-name:var(--font-heading)]">{title}</h3>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant={variant} size="sm" onClick={onConfirm} disabled={loading}>
                {loading ? "Processing..." : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
