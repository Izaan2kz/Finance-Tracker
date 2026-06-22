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
import { formatCurrency } from "@/lib/utils";
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
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              return (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-lg">
                  <p className="text-xs text-zinc-400 mb-1">{label}</p>
                  {payload.map((p) => (
                    <p key={p.dataKey as string} className="text-sm">
                      <span
                        className="inline-block h-2 w-2 rounded-full mr-2"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-zinc-300">
                        {p.dataKey === "income" ? "Income" : "Expenses"}:
                      </span>{" "}
                      <span className="font-semibold text-zinc-100">
                        {formatCurrency(p.value as number)}
                      </span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} name="Income" />
          <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
