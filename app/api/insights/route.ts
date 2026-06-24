import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { generateInsight } from "@/lib/gemini";
import { insightRequestSchema } from "@/lib/validations";
import { getScopeRange } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const supabase = await createServerSupabaseClient();
  const body = await request.json();
  const parsed = insightRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid scope", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { scope, forceRegenerate } = parsed.data;
  const { from, to, label } = getScopeRange(scope);

  if (!forceRegenerate) {
    const { data: cached } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("scope", scope)
      .eq("scope_value", label)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      return NextResponse.json({
        id: cached.id,
        response: cached.response,
        createdAt: cached.created_at,
        scope: cached.scope,
        scopeValue: cached.scope_value,
      });
    }
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(name)")
    .eq("user_id", user.id)
    .gte("date", from.toISOString().split("T")[0])
    .lte("date", to.toISOString().split("T")[0])
    .order("date");

  if (!transactions || transactions.length === 0) {
    return NextResponse.json(
      { error: "No transactions found for this period" },
      { status: 400 }
    );
  }

  const txData = transactions.map((t) => ({
    type: t.type,
    amount: Number(t.amount),
    description: t.description,
    date: t.date,
    category: t.category?.name || "Uncategorized",
  }));

  const response = await generateInsight(txData, scope, label);

  const { data: insight } = await supabase
    .from("ai_insights")
    .insert({
      user_id: user.id,
      prompt: `Analysis for ${scope} (${label})`,
      response,
      scope,
      scope_value: label,
    })
    .select()
    .single();

  return NextResponse.json({
    id: insight?.id,
    response: insight?.response || response,
    createdAt: insight?.created_at,
    scope: insight?.scope,
    scopeValue: insight?.scope_value,
  });
}
