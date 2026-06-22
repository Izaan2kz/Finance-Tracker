"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import SpendingByCategory from "@/components/charts/SpendingByCategory";
import IncomeVsExpense from "@/components/charts/IncomeVsExpense";
import SpendingTrend from "@/components/charts/SpendingTrend";
import { formatCurrency } from "@/lib/utils";

interface CategorySummary {
  name: string;
  icon: string | null;
  color: string;
  total: number;
  count: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  });
  const [categoryData, setCategoryData] = useState<
    { name: string; value: number; color: string; icon: string | null }[]
  >([]);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; income: number; expense: number }[]
  >([]);
  const [dailyData, setDailyData] = useState<{ date: string; amount: number }[]>(
    []
  );
  const [summaryTable, setSummaryTable] = useState<CategorySummary[]>([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/transactions?from=${from}&to=${to}&pageSize=5000`
      );
      const data = await res.json();
      const txs: Array<{
        type: string;
        amount: number;
        date: string;
        category: { name: string; icon: string | null; color: string | null } | null;
      }> = data.data || [];

      const catMap: Record<
        string,
        { total: number; count: number; icon: string | null; color: string }
      > = {};
      const dailyMap: Record<string, number> = {};
      const monthMap: Record<string, { income: number; expense: number }> = {};

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        monthMap[key] = { income: 0, expense: 0 };
      }

      txs.forEach((tx) => {
        const d = new Date(tx.date);
        const monthKey = d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        if (monthMap[monthKey]) {
          if (tx.type === "INCOME") monthMap[monthKey].income += tx.amount;
          else monthMap[monthKey].expense += tx.amount;
        }

        if (tx.type === "EXPENSE") {
          const catName = tx.category?.name || "Uncategorized";
          if (!catMap[catName]) {
            catMap[catName] = {
              total: 0,
              count: 0,
              icon: tx.category?.icon || null,
              color: tx.category?.color || "#9CA3AF",
            };
          }
          catMap[catName].total += tx.amount;
          catMap[catName].count += 1;

          const dayKey = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          dailyMap[dayKey] = (dailyMap[dayKey] || 0) + tx.amount;
        }
      });

      const catArr = Object.entries(catMap)
        .map(([name, v]) => ({
          name,
          value: v.total,
          color: v.color,
          icon: v.icon,
          count: v.count,
        }))
        .sort((a, b) => b.value - a.value);

      setCategoryData(
        catArr.map(({ name, value, color, icon }) => ({ name, value, color, icon }))
      );
      setSummaryTable(
        catArr.map(({ name, value, icon, color, count }) => ({
          name,
          total: value,
          icon,
          color,
          count,
        }))
      );
      setMonthlyData(
        Object.entries(monthMap).map(([month, v]) => ({
          month,
          income: v.income,
          expense: v.expense,
        }))
      );
      setDailyData(
        Object.entries(dailyMap).map(([date, amount]) => ({ date, amount }))
      );
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totalSpending = summaryTable.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Visual breakdown of your finances
        </p>
      </div>

      <div className="flex gap-4 items-end">
        <Input
          id="from"
          label="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          id="to"
          label="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-medium text-zinc-300 mb-4">
            Spending by Category
          </h3>
          <SpendingByCategory data={categoryData} loading={loading} />
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-zinc-300 mb-4">
            Income vs Expenses
          </h3>
          <IncomeVsExpense data={monthlyData} loading={loading} />
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-medium text-zinc-300 mb-4">Spending Trend</h3>
        <SpendingTrend data={dailyData} loading={loading} />
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-zinc-300 mb-4">
          Category Breakdown
        </h3>
        {summaryTable.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">
            No expense data for this period
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left py-3 px-2 font-medium">Category</th>
                  <th className="text-right py-3 px-2 font-medium">Total</th>
                  <th className="text-right py-3 px-2 font-medium">% of Total</th>
                  <th className="text-right py-3 px-2 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {summaryTable.map((cat) => (
                  <tr
                    key={cat.name}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/20"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-zinc-200">
                          {cat.icon} {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-100 font-medium tabular-nums">
                      {formatCurrency(cat.total)}
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-400 tabular-nums">
                      {totalSpending > 0
                        ? ((cat.total / totalSpending) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-400 tabular-nums">
                      {cat.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
