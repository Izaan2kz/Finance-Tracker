"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import TransactionList from "@/components/transactions/TransactionList";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import IncomeVsExpense from "@/components/charts/IncomeVsExpense";
import { formatCurrency } from "@/lib/utils";
import { Plus, TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

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
      bg: "bg-emerald-400/10",
    },
    {
      label: "Expenses",
      value: data?.summary.totalExpenses ?? 0,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      label: "Net Balance",
      value: data?.summary.netBalance ?? 0,
      icon: Wallet,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
    {
      label: "Budget Left",
      value: data?.summary.budgetRemaining,
      icon: Target,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Your financial summary for this month
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-zinc-400">{card.label}</span>
                  <div className={`rounded-xl p-2 ${card.bg}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-zinc-100">
                  {card.value !== null && card.value !== undefined
                    ? formatCurrency(card.value)
                    : "Not set"}
                </p>
              </>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-300">
              Income vs Expenses
            </h3>
            <span className="text-xs text-zinc-500">Last 6 months</span>
          </div>
          <IncomeVsExpense
            data={data?.monthlyData || []}
            loading={loading}
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-300">
              Recent Transactions
            </h3>
            <Link
              href="/transactions"
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              View all
            </Link>
          </div>
          <TransactionList
            transactions={data?.recentTransactions || []}
            loading={loading}
            compact
          />
        </Card>
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
