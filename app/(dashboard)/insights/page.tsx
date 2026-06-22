"use client";

import { useState, useEffect } from "react";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">AI Insights</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Get AI-powered analysis of your spending patterns
        </p>
      </div>

      <div className="max-w-xs">
        <Select
          id="scope"
          label="Analysis Period"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          options={scopeOptions}
        />
      </div>

      <InsightPanel key={scope} scope={scope} />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Past Insights</h3>
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
            <p className="text-sm text-zinc-500">
              No past insights yet. Generate your first one above!
            </p>
          </Card>
        ) : (
          pastInsights.map((insight) => (
            <Card key={insight.id}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-xs text-zinc-400">
                  {insight.scopeValue} &middot; {formatDate(insight.createdAt)}
                </span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 line-clamp-6">
                <ReactMarkdown>{insight.response}</ReactMarkdown>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
