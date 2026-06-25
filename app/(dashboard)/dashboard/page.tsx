"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import TransactionList from "@/components/transactions/TransactionList";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import IncomeVsExpense from "@/components/charts/IncomeVsExpense";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { Plus, TrendingUp, TrendingDown, Wallet, Target, ArrowRight, Sparkles, AlertTriangle, FileText, Calendar } from "lucide-react";
import Link from "next/link";

interface CategorySpend {
  name: string;
  icon: string | null;
  color: string | null;
  total: number;
}

interface SpendingAlert {
  category: string;
  icon: string | null;
  current: number;
  previous: number;
  pctIncrease: number;
}

interface MonthlySummary {
  totalTransactions: number;
  avgDailySpend: number;
  biggestExpense: { description: string; amount: number } | null;
  daysLeft: number;
  dailyBudgetLeft: number | null;
}

interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    monthlyBudget: number | null;
    budgetRemaining: number | null;
    prevIncome: number;
    prevExpenses: number;
  };
  recentTransactions: Array<{
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
    date: string;
    category: { name: string; icon: string | null; color: string | null } | null;
  }>;
  monthlyData: Array<{ month: string; income: number; expense: number }>;
  topCategories: CategorySpend[];
  alerts: SpendingAlert[];
  monthlySummary: MonthlySummary;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || null);
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const [txRes, recentRes] = await Promise.all([
        fetch(
          `/api/transactions?from=${firstOfMonth}&to=${lastOfMonth}&pageSize=1000`
        ),
        fetch("/api/transactions?pageSize=5"),
      ]);

      const txData = await txRes.json();
      const recentData = await recentRes.json();

      const allTx: Array<{ type: string; amount: number; description: string; date: string; category: { name: string; icon: string | null; color: string | null } | null }> = txData.data || [];
      let totalIncome = 0;
      let totalExpenses = 0;
      let biggestExpense: { description: string; amount: number } | null = null;
      const catMap: Record<string, CategorySpend> = {};
      allTx.forEach((t) => {
        if (t.type === "INCOME") totalIncome += t.amount;
        else {
          totalExpenses += t.amount;
          if (!biggestExpense || t.amount > biggestExpense.amount) {
            biggestExpense = { description: t.description, amount: t.amount };
          }
          const name = t.category?.name || "Uncategorized";
          if (!catMap[name]) catMap[name] = { name, icon: t.category?.icon || null, color: t.category?.color || null, total: 0 };
          catMap[name].total += t.amount;
        }
      });
      const topCategories = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 5);

      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dayOfMonth = now.getDate();
      const daysLeft = daysInMonth - dayOfMonth;
      const avgDailySpend = dayOfMonth > 0 ? totalExpenses / dayOfMonth : 0;

      const monthlySummary: MonthlySummary = {
        totalTransactions: allTx.length,
        avgDailySpend,
        biggestExpense,
        daysLeft,
        dailyBudgetLeft: null,
      };

      const months: Record<string, { income: number; expense: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        months[key] = { income: 0, expense: 0 };
      }

      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
        .toISOString()
        .split("T")[0];
      const allRes = await fetch(
        `/api/transactions?from=${sixMonthsAgo}&to=${lastOfMonth}&pageSize=5000`
      );
      const allData = await allRes.json();
      const prevCatMap: Record<string, { total: number; icon: string | null }> = {};
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      (allData.data || []).forEach(
        (t: { type: string; amount: number; date: string; category: { name: string; icon: string | null } | null }) => {
          const d = new Date(t.date);
          const key = d.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
          if (months[key]) {
            if (t.type === "INCOME") months[key].income += t.amount;
            else months[key].expense += t.amount;
          }
          if (t.type === "EXPENSE" && d >= prevMonthStart && d <= prevMonthEnd) {
            const cn = t.category?.name || "Uncategorized";
            if (!prevCatMap[cn]) prevCatMap[cn] = { total: 0, icon: t.category?.icon || null };
            prevCatMap[cn].total += t.amount;
          }
        }
      );

      const alerts: SpendingAlert[] = [];
      for (const [name, curr] of Object.entries(catMap)) {
        const prev = prevCatMap[name];
        if (prev && prev.total > 0 && curr.total > prev.total) {
          const pctIncrease = ((curr.total - prev.total) / prev.total) * 100;
          if (pctIncrease >= 20) {
            alerts.push({ category: name, icon: curr.icon, current: curr.total, previous: prev.total, pctIncrease });
          }
        }
      }
      alerts.sort((a, b) => b.pctIncrease - a.pctIncrease);

      const monthEntries = Object.entries(months);
      const prevMonth = monthEntries.length >= 2 ? monthEntries[monthEntries.length - 2][1] : { income: 0, expense: 0 };

      setData({
        summary: {
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          monthlyBudget: null,
          budgetRemaining: null,
          prevIncome: prevMonth.income,
          prevExpenses: prevMonth.expense,
        },
        recentTransactions: recentData.data || [],
        monthlyData: monthEntries.map(([month, vals]) => ({
          month,
          ...vals,
        })),
        topCategories,
        alerts,
        monthlySummary,
      });
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function pctChange(current: number, previous: number): { text: string; positive: boolean } | null {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return { text: "+100%", positive: true };
    const pct = ((current - previous) / previous) * 100;
    return { text: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`, positive: pct >= 0 };
  }

  const incomeChange = data ? pctChange(data.summary.totalIncome, data.summary.prevIncome) : null;
  const expenseChange = data ? pctChange(data.summary.totalExpenses, data.summary.prevExpenses) : null;
  const prevNet = (data?.summary.prevIncome ?? 0) - (data?.summary.prevExpenses ?? 0);
  const netChange = data ? pctChange(data.summary.netBalance, prevNet) : null;

  const summaryCards = [
    {
      label: "Income",
      value: data?.summary.totalIncome ?? 0,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/30",
      gradient: "from-emerald-500/20 to-emerald-500/0",
      change: incomeChange,
      changeGood: true,
    },
    {
      label: "Expenses",
      value: data?.summary.totalExpenses ?? 0,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
      borderHover: "hover:border-red-500/30",
      gradient: "from-red-500/15 to-red-500/0",
      change: expenseChange,
      changeGood: false,
    },
    {
      label: "Net Balance",
      value: data?.summary.netBalance ?? 0,
      icon: Wallet,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      borderHover: "hover:border-blue-500/30",
      gradient: "from-blue-500/20 to-blue-500/0",
      change: netChange,
      changeGood: true,
    },
    {
      label: "Budget Left",
      value: data?.summary.budgetRemaining,
      icon: Target,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      borderHover: "hover:border-amber-500/30",
      gradient: "from-amber-500/15 to-amber-500/0",
      change: null,
      changeGood: true,
    },
  ];

  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-blue-950/40 via-[#0A1028]/30 to-[#0A1028]/20 p-6 lg:p-8 backdrop-blur-xl"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[80px]" />
          <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] rounded-full bg-indigo-600/5 blur-[60px]" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 font-[family-name:var(--font-heading)] tracking-tight">
              {getGreeting()}{userName ? `, ${userName}` : ""}
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Here&apos;s your financial overview for {currentMonth}
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
          >
            <div className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl transition-all duration-300 ${card.borderHover} hover:bg-white/[0.05] cursor-default`}>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-400">{card.label}</span>
                      <div className={`rounded-xl p-2 ${card.bg} border border-white/[0.06]`}>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100 font-[family-name:var(--font-heading)]">
                      {card.value !== null && card.value !== undefined
                        ? formatCurrency(card.value)
                        : "Not set"}
                    </p>
                    {card.change && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <TrendingUp className={`h-3 w-3 ${(card.change.positive === card.changeGood) ? "text-emerald-400" : "text-red-400 rotate-180"}`} />
                        <span className={`text-xs font-medium ${(card.change.positive === card.changeGood) ? "text-emerald-400" : "text-red-400"}`}>
                          {card.change.text}
                        </span>
                        <span className="text-xs text-slate-600">vs last month</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="group hover:border-blue-500/20 transition-all duration-300 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-300">
                Income vs Expenses
              </h3>
              <span className="text-xs text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">Last 6 months</span>
            </div>
            <IncomeVsExpense
              data={data?.monthlyData || []}
              loading={loading}
            />
          </Card>
        </motion.div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="group hover:border-blue-500/20 transition-all duration-300 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-300">
                Recent Transactions
              </h3>
              <Link
                href="/transactions"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 hover:bg-blue-500/15"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex-1">
              <TransactionList
                transactions={data?.recentTransactions || []}
                loading={loading}
                compact
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Savings Rate & Top Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
        {/* Savings Rate */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <Card className="hover:border-emerald-500/20 transition-all duration-300 h-full">
            <h3 className="text-sm font-medium text-slate-300 mb-5">Savings Rate</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Skeleton className="h-32 w-32 rounded-full" /></div>
            ) : (() => {
              const income = data?.summary.totalIncome ?? 0;
              const expenses = data?.summary.totalExpenses ?? 0;
              const saved = income - expenses;
              const rate = income > 0 ? Math.max(0, Math.min(100, (saved / income) * 100)) : 0;
              const circumference = 2 * Math.PI * 52;
              const offset = circumference - (rate / 100) * circumference;
              return (
                <div className="flex flex-col items-center gap-5">
                  <div className="relative">
                    <svg width="140" height="140" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                      <motion.circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke={rate >= 30 ? "#10b981" : rate >= 10 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-100 font-[family-name:var(--font-heading)]">{rate.toFixed(0)}%</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">saved</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-300">
                      You saved <span className="font-semibold text-emerald-400">{formatCurrency(Math.max(0, saved))}</span> of {formatCurrency(income)} earned
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {rate >= 30 ? "Excellent savings rate!" : rate >= 15 ? "Good progress, keep it up!" : income > 0 ? "Try to reduce expenses this month" : "Add income to track savings"}
                    </p>
                  </div>
                </div>
              );
            })()}
          </Card>
        </motion.div>

        {/* Top Spending Categories */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card className="hover:border-red-500/20 transition-all duration-300 h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-slate-300">Top Spending</h3>
              <Link href="/analytics" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 hover:bg-blue-500/15">
                Details <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !data?.topCategories.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-slate-500">No expenses this month</p>
                <p className="text-xs text-slate-600 mt-1">Add expenses to see your top categories</p>
              </div>
            ) : (() => {
              const maxTotal = data.topCategories[0]?.total ?? 1;
              return (
                <div className="space-y-3">
                  {data.topCategories.map((cat, i) => (
                    <motion.div
                      key={cat.name}
                      initial={prefersReduced ? {} : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + i * 0.06 }}
                      className="group/cat"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm">
                            {cat.icon || "📦"}
                          </div>
                          <span className="text-sm text-slate-300">{cat.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-100 tabular-nums">{formatCurrency(cat.total)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: cat.color || "#3b82f6" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.total / maxTotal) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 + i * 0.06 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </Card>
        </motion.div>
      </div>

      {/* Monthly Summary & Spending Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
        {/* Monthly Summary */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65 }}
        >
          <Card className="hover:border-blue-500/20 transition-all duration-300 h-full">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="rounded-xl bg-blue-500/10 p-2 border border-white/[0.06]">
                <FileText className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-300">Monthly Summary</h3>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (() => {
              const s = data!.monthlySummary;
              return (
                <div className="space-y-3">
                  {[
                    { label: "Total Transactions", value: String(s.totalTransactions), sub: "this month" },
                    { label: "Avg. Daily Spending", value: formatCurrency(s.avgDailySpend), sub: "per day" },
                    { label: "Biggest Expense", value: s.biggestExpense ? formatCurrency(s.biggestExpense.amount) : "—", sub: s.biggestExpense?.description || "none yet" },
                    { label: "Days Remaining", value: String(s.daysLeft), sub: `of ${new Date().toLocaleDateString("en-US", { month: "long" })}` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3">
                      <div>
                        <p className="text-xs text-slate-500">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-100 mt-0.5">{item.value}</p>
                      </div>
                      <span className="text-xs text-slate-600">{item.sub}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        </motion.div>

        {/* Spending Alerts */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="hover:border-amber-500/20 transition-all duration-300 h-full">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="rounded-xl bg-amber-500/10 p-2 border border-white/[0.06]">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-300">Spending Alerts</h3>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : !data?.alerts.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-emerald-500/10 p-3 mb-3">
                  <TrendingDown className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm text-slate-400">No spending spikes</p>
                <p className="text-xs text-slate-600 mt-1">All categories are within normal range vs last month</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.alerts.slice(0, 4).map((alert, i) => (
                  <motion.div
                    key={alert.category}
                    initial={prefersReduced ? {} : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.75 + i * 0.06 }}
                    className="flex items-center gap-3 rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-sm shrink-0">
                      {alert.icon || "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{alert.category}</p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(alert.previous)} → {formatCurrency(alert.current)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg shrink-0">
                      +{alert.pctIncrease.toFixed(0)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.75 }}
        >
          <Link
            href="/insights"
            className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-gradient-to-r from-violet-950/20 via-[#0A1028]/20 to-blue-950/20 p-5 backdrop-blur-xl hover:border-violet-500/20 transition-all duration-300 hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-violet-500/10 p-2.5 border border-white/[0.06] group-hover:border-violet-500/20 transition-colors">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">AI Insights</p>
                <p className="text-xs text-slate-500">Get personalized advice</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <Link
            href="/calendar"
            className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-gradient-to-r from-sky-950/20 via-[#0A1028]/20 to-blue-950/20 p-5 backdrop-blur-xl hover:border-sky-500/20 transition-all duration-300 hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-sky-500/10 p-2.5 border border-white/[0.06] group-hover:border-sky-500/20 transition-colors">
                <Calendar className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Calendar View</p>
                <p className="text-xs text-slate-500">See transactions by date</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </div>

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transaction"
      >
        <AddTransactionForm
          onSuccess={() => {
            setShowAddModal(false);
            setLoading(true);
            fetchData();
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
