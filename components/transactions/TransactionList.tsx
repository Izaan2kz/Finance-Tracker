"use client";

import { motion, AnimatePresence } from "framer-motion";
import TransactionItem from "./TransactionItem";
import Skeleton from "@/components/ui/Skeleton";
import { ArrowLeftRight } from "lucide-react";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number | string;
  description: string;
  date: string;
  category: {
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  emptyMessage?: string;
}

export default function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete,
  compact,
  emptyMessage = "No transactions yet",
}: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
          <ArrowLeftRight className="h-8 w-8 text-slate-600" />
        </div>
        <p className="text-sm font-medium text-slate-400">{emptyMessage}</p>
        <p className="text-xs text-slate-600 mt-1">
          Add your first transaction to get started
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.04]">
      <AnimatePresence initial={false}>
        {transactions.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
          >
            <TransactionItem
              transaction={t}
              onEdit={onEdit}
              onDelete={onDelete}
              compact={compact}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
