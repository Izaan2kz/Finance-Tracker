"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCurrency } from "@/lib/currency";
import Skeleton from "@/components/ui/Skeleton";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface IncomeVsExpenseProps {
  data: MonthlyData[];
  loading?: boolean;
}

export default function IncomeVsExpense({ data, loading }: IncomeVsExpenseProps) {
  const { formatAmount: formatCurrency } = useCurrency();
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              return (
                <div className="rounded-xl border border-white/[0.08] bg-[#0A1028]/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/50">
                  <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
                  {payload.map((p) => (
                    <p key={p.dataKey as string} className="text-sm flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-slate-400">
                        {p.dataKey === "income" ? "Income" : "Expenses"}:
                      </span>
                      <span className="font-semibold text-slate-100">
                        {formatCurrency(p.value as number)}
                      </span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="income" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Income" />
          <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expenses" opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
