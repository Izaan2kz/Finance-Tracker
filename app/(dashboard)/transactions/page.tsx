"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import TransactionList from "@/components/transactions/TransactionList";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import { useToast } from "@/components/ui/Toast";
import { Plus, ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: string;
  categoryId: string | null;
  note: string | null;
  category: { id: string; name: string; icon: string | null; color: string | null } | null;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export default function TransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: "20" });
      if (filterType) params.set("type", filterType);
      if (filterCategory) params.set("categoryId", filterCategory);
      if (filterFrom) params.set("from", filterFrom);
      if (filterTo) params.set("to", filterTo);

      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterCategory, filterFrom, filterTo, toast]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Transaction deleted", "success");
        fetchTransactions();
      } else {
        toast("Failed to delete", "error");
      }
    } catch {
      toast("Network error", "error");
    }
  };

  const handleEdit = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx) setEditingTx(tx);
  };

  const typeOptions = [
    { value: "", label: "All types" },
    { value: "INCOME", label: "Income" },
    { value: "EXPENSE", label: "Expense" },
  ];

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({
      value: c.id,
      label: `${c.icon || ""} ${c.name}`.trim(),
    })),
  ];

  const prefersReduced = useReducedMotion();

  return (
    <div className="space-y-6">
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-sky-950/40 via-[#0A1028]/30 to-[#0A1028]/20 p-6 lg:p-8 backdrop-blur-xl"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[250px] h-[250px] rounded-full bg-sky-600/10 blur-[80px]" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-sky-500/10 p-3 border border-white/[0.06]">
              <ArrowLeftRight className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 font-[family-name:var(--font-heading)] tracking-tight">Transactions</h1>
              <p className="text-sm text-slate-400 mt-0.5">Manage your income and expenses</p>
            </div>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="shadow-lg shadow-blue-600/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="hover:border-sky-500/20 transition-all duration-300">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Select
              id="filterType"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              options={typeOptions}
            />
            <Select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              options={categoryOptions}
            />
            <Input
              id="filterFrom"
              type="date"
              placeholder="From"
              value={filterFrom}
              onChange={(e) => {
                setFilterFrom(e.target.value);
                setPage(1);
              }}
            />
            <Input
              id="filterTo"
              type="date"
              placeholder="To"
              value={filterTo}
              onChange={(e) => {
                setFilterTo(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <TransactionList
            transactions={transactions}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/[0.04]">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-400 bg-white/[0.04] px-3 py-1 rounded-lg border border-white/[0.06]">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transaction"
      >
        <AddTransactionForm
          onSuccess={() => {
            setShowAddModal(false);
            fetchTransactions();
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        open={!!editingTx}
        onClose={() => setEditingTx(null)}
        title="Edit Transaction"
      >
        {editingTx && (
          <AddTransactionForm
            initialData={{
              id: editingTx.id,
              type: editingTx.type,
              amount: editingTx.amount,
              description: editingTx.description,
              categoryId: editingTx.categoryId,
              date: editingTx.date,
              note: editingTx.note,
            }}
            onSuccess={() => {
              setEditingTx(null);
              fetchTransactions();
            }}
            onCancel={() => setEditingTx(null)}
          />
        )}
      </Modal>
    </div>
  );
}
