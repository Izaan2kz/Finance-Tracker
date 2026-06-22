import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { generateInsight } from "@/lib/gemini";
import { insightRequestSchema } from "@/lib/validations";
import { getScopeRange } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

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
    const cached = await prisma.aiInsight.findFirst({
      where: { userId: user.id, scope, scopeValue: label },
      orderBy: { createdAt: "desc" },
    });
    if (cached) {
      return NextResponse.json({
        id: cached.id,
        response: cached.response,
        createdAt: cached.createdAt.toISOString(),
        scope: cached.scope,
        scopeValue: cached.scopeValue,
      });
    }
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: from, lte: to },
    },
    include: {
      category: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  if (transactions.length === 0) {
    return NextResponse.json(
      { error: "No transactions found for this period" },
      { status: 400 }
    );
  }

  const txData = transactions.map((t) => ({
    type: t.type,
    amount: t.amount.toNumber(),
    description: t.description,
    date: t.date.toISOString().split("T")[0],
    category: t.category?.name || "Uncategorized",
  }));

  const response = await generateInsight(txData, scope, label);

  const insight = await prisma.aiInsight.create({
    data: {
      userId: user.id,
      prompt: `Analysis for ${scope} (${label})`,
      response,
      scope,
      scopeValue: label,
    },
  });

  return NextResponse.json({
    id: insight.id,
    response: insight.response,
    createdAt: insight.createdAt.toISOString(),
    scope: insight.scope,
    scopeValue: insight.scopeValue,
  });
}
