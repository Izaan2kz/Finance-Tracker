"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import InsightPanel from "@/components/insights/InsightPanel";
import { formatDate } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import Skeleton from "@/components/ui/Skeleton";
import { Sparkles } from "lucide-react";

interface PastInsight {
  id: string;
  response: string;
  scope: string | null;
  scopeValue: string | null;
  createdAt: string;
}

const scopeOptions = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-year", label: "This Year" },
];

export default function InsightsPage() {
  const [scope, setScope] = useState("this-month");
  const [pastInsights, setPastInsights] = useState<PastInsight[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);

  useEffect(() => {
    setLoadingPast(true);
    fetch("/api/insights/history")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPastInsights)
      .catch(() => setPastInsights([]))
      .finally(() => setLoadingPast(false));
  }, []);

  const prefersReduced = useReducedMotion();

  return (
    <div className="space-y-6">
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-950/40 via-[#0A1028]/30 to-[#0A1028]/20 p-6 lg:p-8 backdrop-blur-xl"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[250px] h-[250px] rounded-full bg-violet-600/10 blur-[80px]" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-violet-500/10 p-3 border border-white/[0.06]">
              <Sparkles className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 font-[family-name:var(--font-heading)] tracking-tight">AI Insights</h1>
              <p className="text-sm text-slate-400 mt-0.5">AI-powered analysis of your spending patterns</p>
            </div>
          </div>
          <div className="max-w-[200px]">
            <Select
              id="scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              options={scopeOptions}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <InsightPanel key={scope} scope={scope} />
      </motion.div>

      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-medium text-slate-300">Past Insights</h3>
        {loadingPast ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-4 w-40 mb-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </Card>
            ))}
          </div>
        ) : pastInsights.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-slate-500">No past insights yet. Generate your first one above!</p>
          </Card>
        ) : (
          pastInsights.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={prefersReduced ? {} : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
            >
              <Card className="hover:border-violet-500/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  <span className="text-xs text-slate-400">
                    {insight.scopeValue} &middot; {formatDate(insight.createdAt)}
                  </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 line-clamp-6">
                  <ReactMarkdown>{insight.response}</ReactMarkdown>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
