"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: string;
  category: { name: string; icon: string | null; color: string | null } | null;
}

interface DayData {
  date: number;
  income: number;
  expense: number;
  transactions: Transaction[];
}

export default function CalendarPage() {
  const prefersReduced = useReducedMotion();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<(DayData | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const fetchMonth = useCallback(async () => {
    setLoading(true);
    setSelectedDay(null);
    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];
    try {
      const res = await fetch(`/api/transactions?from=${from}&to=${to}&pageSize=5000`);
      const data = await res.json();
      const txs: Transaction[] = data.data || [];

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDow = new Date(year, month, 1).getDay();

      const dayMap: Record<number, DayData> = {};
      for (let d = 1; d <= daysInMonth; d++) {
        dayMap[d] = { date: d, income: 0, expense: 0, transactions: [] };
      }
      txs.forEach((t) => {
        const d = new Date(t.date).getDate();
        if (dayMap[d]) {
          dayMap[d].transactions.push(t);
          if (t.type === "INCOME") dayMap[d].income += t.amount;
          else dayMap[d].expense += t.amount;
        }
      });

      const grid: (DayData | null)[] = [];
      for (let i = 0; i < firstDow; i++) grid.push(null);
      for (let d = 1; d <= daysInMonth; d++) grid.push(dayMap[d]);

      setDays(grid);
    } catch {
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

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
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-sky-500/10 p-3 border border-white/[0.06]">
              <Calendar className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 font-[family-name:var(--font-heading)] tracking-tight">Calendar</h1>
              <p className="text-sm text-slate-400 mt-0.5">Visualize your transactions by date</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 transition-colors cursor-pointer">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-slate-200 min-w-[160px] text-center font-[family-name:var(--font-heading)]">{monthName}</span>
            <button onClick={nextMonth} className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 transition-colors cursor-pointer">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => (
                <motion.button
                  key={i}
                  initial={prefersReduced ? {} : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.008 }}
                  onClick={() => day && day.transactions.length > 0 && setSelectedDay(day)}
                  disabled={!day || day.transactions.length === 0}
                  className={`relative rounded-xl p-2 min-h-[80px] text-left transition-all duration-200 cursor-pointer border ${
                    day === null
                      ? "border-transparent"
                      : selectedDay?.date === day.date
                      ? "border-blue-500/30 bg-blue-500/10"
                      : isToday(day.date)
                      ? "border-blue-500/20 bg-white/[0.04]"
                      : day.transactions.length > 0
                      ? "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08]"
                      : "border-transparent bg-white/[0.01]"
                  } ${!day || day.transactions.length === 0 ? "cursor-default" : ""}`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-medium ${isToday(day.date) ? "text-blue-400" : "text-slate-400"}`}>
                        {day.date}
                      </span>
                      {day.transactions.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {day.income > 0 && (
                            <div className="text-[10px] text-emerald-400 font-medium truncate">+{formatCurrency(day.income)}</div>
                          )}
                          {day.expense > 0 && (
                            <div className="text-[10px] text-red-400 font-medium truncate">-{formatCurrency(day.expense)}</div>
                          )}
                          <div className="flex gap-0.5 mt-1">
                            {day.transactions.slice(0, 3).map((_, j) => (
                              <div key={j} className="h-1 w-1 rounded-full bg-blue-400/50" />
                            ))}
                            {day.transactions.length > 3 && <div className="h-1 w-1 rounded-full bg-slate-600" />}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Selected Day Detail */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-300">
                  {new Date(year, month, selectedDay.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <button onClick={() => setSelectedDay(null)} className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Close</button>
              </div>
              <div className="flex gap-4 mb-4">
                {selectedDay.income > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">Income:</span>
                    <span className="font-medium text-emerald-400">{formatCurrency(selectedDay.income)}</span>
                  </div>
                )}
                {selectedDay.expense > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-slate-400">Expense:</span>
                    <span className="font-medium text-red-400">{formatCurrency(selectedDay.expense)}</span>
                  </div>
                )}
              </div>
              <div className="divide-y divide-white/[0.04]">
                {selectedDay.transactions.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm">
                      {t.category?.icon || (t.type === "INCOME" ? "💵" : "💸")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{t.description}</p>
                      <p className="text-xs text-slate-500">{t.category?.name || "Uncategorized"}</p>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums ${t.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                      {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
