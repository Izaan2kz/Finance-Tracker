"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Sparkles, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface InsightPanelProps {
  scope: string;
}

interface InsightData {
  id: string;
  response: string;
  createdAt: string;
}

export default function InsightPanel({ scope }: InsightPanelProps) {
  const { toast } = useToast();
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async (forceRegenerate = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, forceRegenerate }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Failed to generate insights", "error");
        return;
      }

      const data = await res.json();
      setInsight(data);
      setGenerated(true);
      toast("Insights generated", "success");
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            <span className="text-sm text-zinc-400">Analyzing your finances...</span>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </Card>
    );
  }

  if (!generated) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles className="h-12 w-12 text-indigo-400/50 mb-4" />
        <h3 className="text-lg font-medium text-zinc-200 mb-2">
          AI-Powered Insights
        </h3>
        <p className="text-sm text-zinc-500 mb-6 max-w-sm">
          Get personalized spending analysis, pattern detection, and savings
          suggestions powered by Google Gemini.
        </p>
        <Button onClick={() => generate(false)}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Insights
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <span className="text-sm text-zinc-400">
            Generated {insight ? formatDate(insight.createdAt) : ""}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => generate(true)}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Regenerate
        </Button>
      </div>
      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-200 prose-li:text-zinc-300">
        <ReactMarkdown>{insight?.response || ""}</ReactMarkdown>
      </div>
    </Card>
  );
}
