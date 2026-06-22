"use client";

import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

interface TransactionItemProps {
  transaction: {
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
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  compact,
}: TransactionItemProps) {
  const amount = typeof transaction.amount === "string"
    ? parseFloat(transaction.amount)
    : transaction.amount;

  return (
    <div className="flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-zinc-800/30 group">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-lg">
        {transaction.category?.icon || (transaction.type === "INCOME" ? "💵" : "💸")}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100 truncate">
          {transaction.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-500">
            {formatDate(transaction.date)}
          </span>
          {transaction.category && (
            <Badge color={transaction.category.color || undefined}>
              {transaction.category.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-semibold tabular-nums ${
            transaction.type === "INCOME" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {transaction.type === "INCOME" ? "+" : "-"}
          {formatCurrency(amount)}
        </span>

        {!compact && (onEdit || onDelete) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction.id)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-900/50 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
