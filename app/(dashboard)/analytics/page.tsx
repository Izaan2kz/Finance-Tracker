"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import SpendingByCategory from "@/components/charts/SpendingByCategory";
import IncomeVsExpense from "@/components/charts/IncomeVsExpense";
import SpendingTrend from "@/components/charts/SpendingTrend";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface CategorySummary {
  name: string;
  icon: string | null;
  color: string;
  total: number;
  count: number;
}

interface MonthComparison {
  label: string;
  current: number;
  previous: number;
  change: number;
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
  const [monthComparison, setMonthComparison] = useState<MonthComparison[]>([]);

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
      const monthEntries = Object.entries(monthMap);
      setMonthlyData(
        monthEntries.map(([month, v]) => ({
          month,
          income: v.income,
          expense: v.expense,
        }))
      );

      if (monthEntries.length >= 2) {
        const curr = monthEntries[monthEntries.length - 1][1];
        const prev = monthEntries[monthEntries.length - 2][1];
        const pct = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100;
        setMonthComparison([
          { label: "Income", current: curr.income, previous: prev.income, change: pct(curr.income, prev.income) },
          { label: "Expenses", current: curr.expense, previous: prev.expense, change: pct(curr.expense, prev.expense) },
          { label: "Net", current: curr.income - curr.expense, previous: prev.income - prev.expense, change: pct(curr.income - curr.expense, prev.income - prev.expense) },
        ]);
      }
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

  const prefersReduced = useReducedMotion();

  return (
    <div className="space-y-6">
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-red-950/30 via-[#0A1028]/30 to-[#0A1028]/20 p-6 lg:p-8 backdrop-blur-xl"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[250px] h-[250px] rounded-full bg-red-600/8 blur-[80px]" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-red-500/10 p-3 border border-white/[0.06]">
              <BarChart3 className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 font-[family-name:var(--font-heading)] tracking-tight">Analytics</h1>
              <p className="text-sm text-slate-400 mt-0.5">Visual breakdown of your finances</p>
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <Input id="from" label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input id="to" label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </motion.div>

      {/* Month-over-Month Comparison */}
      {monthComparison.length > 0 && (
        <motion.div initial={prefersReduced ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {monthComparison.map((item, i) => {
              const isGood = item.label === "Expenses" ? item.change <= 0 : item.change >= 0;
              return (
                <motion.div
                  key={item.label}
                  initial={prefersReduced ? {} : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
                >
                  <Card className="hover:border-white/10 transition-all duration-300">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{item.label}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-100 font-[family-name:var(--font-heading)]">{formatCurrency(item.current)}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-slate-500">{formatCurrency(item.previous)}</span>
                          <ArrowRight className="h-3 w-3 text-slate-600" />
                          <span className="text-xs text-slate-400">{formatCurrency(item.current)}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${isGood ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {isGood ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {item.change >= 0 ? "+" : ""}{item.change.toFixed(1)}%
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
        <motion.div initial={prefersReduced ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="hover:border-red-500/20 transition-all duration-300 h-full">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Spending by Category</h3>
            <SpendingByCategory data={categoryData} loading={loading} />
          </Card>
        </motion.div>

        <motion.div initial={prefersReduced ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="hover:border-blue-500/20 transition-all duration-300 h-full">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Income vs Expenses</h3>
            <IncomeVsExpense data={monthlyData} loading={loading} />
          </Card>
        </motion.div>
      </div>

      <motion.div initial={prefersReduced ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
        <Card className="hover:border-indigo-500/20 transition-all duration-300">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Spending Trend</h3>
          <SpendingTrend data={dailyData} loading={loading} />
        </Card>
      </motion.div>

      <motion.div initial={prefersReduced ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
        <Card className="hover:border-white/10 transition-all duration-300">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Category Breakdown</h3>
          {summaryTable.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No expense data for this period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-slate-400">
                    <th className="text-left py-3 px-2 font-medium">Category</th>
                    <th className="text-right py-3 px-2 font-medium">Total</th>
                    <th className="text-right py-3 px-2 font-medium">% of Total</th>
                    <th className="text-right py-3 px-2 font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryTable.map((cat) => (
                    <tr key={cat.name} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-slate-200">{cat.icon} {cat.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-100 font-medium tabular-nums">{formatCurrency(cat.total)}</td>
                      <td className="py-3 px-2 text-right text-slate-400 tabular-nums">
                        {totalSpending > 0 ? ((cat.total / totalSpending) * 100).toFixed(1) : 0}%
                      </td>
                      <td className="py-3 px-2 text-right text-slate-400 tabular-nums">{cat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
