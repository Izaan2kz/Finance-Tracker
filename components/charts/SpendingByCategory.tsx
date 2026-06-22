"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";
import Skeleton from "@/components/ui/Skeleton";

interface CategoryData {
  name: string;
  value: number;
  color: string;
  icon: string | null;
}

interface SpendingByCategoryProps {
  data: CategoryData[];
  loading?: boolean;
}

export default function SpendingByCategory({ data, loading }: SpendingByCategoryProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-8">
        <Skeleton className="h-48 w-48 rounded-full" />
        <div className="space-y-3 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
        No expense data to display
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const item = payload[0].payload as CategoryData;
                return (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-lg">
                    <p className="text-xs text-zinc-400">{item.icon} {item.name}</p>
                    <p className="text-sm font-semibold text-zinc-100">
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-2 w-full">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-zinc-300 flex-1 truncate">
              {item.icon} {item.name}
            </span>
            <span className="text-sm font-medium text-zinc-100 tabular-nums">
              {formatCurrency(item.value)}
            </span>
            <span className="text-xs text-zinc-500 w-10 text-right tabular-nums">
              {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
