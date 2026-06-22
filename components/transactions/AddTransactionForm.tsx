"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { CreateTransactionInput } from "@/lib/validations";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface AddTransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description: string;
    categoryId: string | null;
    date: string;
    note: string | null;
  };
}

export default function AddTransactionForm({
  onSuccess,
  onCancel,
  initialData,
}: AddTransactionFormProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    initialData?.type || "EXPENSE"
  );
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState(initialData?.note || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrors({ amount: "Enter a valid positive amount" });
      return;
    }
    if (!description.trim()) {
      setErrors({ description: "Description is required" });
      return;
    }

    const body: CreateTransactionInput = {
      type,
      amount: parsedAmount,
      description: description.trim(),
      categoryId: categoryId || null,
      date,
      note: note.trim() || null,
    };

    setLoading(true);
    try {
      const url = initialData
        ? `/api/transactions/${initialData.id}`
        : "/api/transactions";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Something went wrong", "error");
        return;
      }

      toast(
        initialData ? "Transaction updated" : "Transaction added",
        "success"
      );
      onSuccess();
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: "", label: "No category" },
    ...categories.map((c) => ({
      value: c.id,
      label: `${c.icon || ""} ${c.name}`.trim(),
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("EXPENSE")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all cursor-pointer ${
            type === "EXPENSE"
              ? "bg-red-600/20 text-red-400 border border-red-600/50"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType("INCOME")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all cursor-pointer ${
            type === "INCOME"
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/50"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}
        >
          Income
        </button>
      </div>

      <Input
        id="amount"
        label="Amount (USD)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
      />

      <Input
        id="description"
        label="Description"
        placeholder="What was this for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
      />

      <Select
        id="category"
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        options={categoryOptions}
      />

      <Input
        id="date"
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="space-y-1.5">
        <label htmlFor="note" className="block text-sm font-medium text-zinc-300">
          Note (optional)
        </label>
        <textarea
          id="note"
          rows={2}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          placeholder="Additional notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading
            ? "Saving..."
            : initialData
              ? "Update"
              : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
