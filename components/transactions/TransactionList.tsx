"use client";

import TransactionItem from "./TransactionItem";
import Skeleton from "@/components/ui/Skeleton";

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
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
        <p className="text-xs text-zinc-600 mt-1">
          Add your first transaction to get started
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.04]">
      {transactions.map((t) => (
        <TransactionItem
          key={t.id}
          transaction={t}
          onEdit={onEdit}
          onDelete={onDelete}
          compact={compact}
        />
      ))}
    </div>
  );
}
