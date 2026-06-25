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
import { Plus, TrendingUp, TrendingDown, Wallet, Target, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    monthlyBudget: number | null;
    budgetRemaining: number | null;
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

      const allTx = txData.data || [];
      let totalIncome = 0;
      let totalExpenses = 0;
      allTx.forEach(
        (t: { type: string; amount: number }) => {
          if (t.type === "INCOME") totalIncome += t.amount;
          else totalExpenses += t.amount;
        }
      );

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
      (allData.data || []).forEach(
        (t: { type: string; amount: number; date: string }) => {
          const d = new Date(t.date);
          const key = d.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
          if (months[key]) {
            if (t.type === "INCOME") months[key].income += t.amount;
            else months[key].expense += t.amount;
          }
        }
      );

      setData({
        summary: {
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          monthlyBudget: null,
          budgetRemaining: null,
        },
        recentTransactions: recentData.data || [],
        monthlyData: Object.entries(months).map(([month, vals]) => ({
          month,
          ...vals,
        })),
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

  const summaryCards = [
    {
      label: "Income",
      value: data?.summary.totalIncome ?? 0,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/30",
      gradient: "from-emerald-500/20 to-emerald-500/0",
    },
    {
      label: "Expenses",
      value: data?.summary.totalExpenses ?? 0,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
      borderHover: "hover:border-red-500/30",
      gradient: "from-red-500/15 to-red-500/0",
    },
    {
      label: "Net Balance",
      value: data?.summary.netBalance ?? 0,
      icon: Wallet,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      borderHover: "hover:border-blue-500/30",
      gradient: "from-blue-500/20 to-blue-500/0",
    },
    {
      label: "Budget Left",
      value: data?.summary.budgetRemaining,
      icon: Target,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      borderHover: "hover:border-amber-500/30",
      gradient: "from-amber-500/15 to-amber-500/0",
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
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="group hover:border-blue-500/20 transition-all duration-300">
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
          <Card className="group hover:border-blue-500/20 transition-all duration-300">
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
            <TransactionList
              transactions={data?.recentTransactions || []}
              loading={loading}
              compact
            />
          </Card>
        </motion.div>
      </div>

      {/* Quick Action */}
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
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
              <p className="text-xs text-slate-500">Get personalized financial advice powered by Gemini</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </motion.div>

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
