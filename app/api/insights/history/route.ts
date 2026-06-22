import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const insights = await prisma.aiInsight.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(
    insights.map((i) => ({
      id: i.id,
      response: i.response,
      scope: i.scope,
      scopeValue: i.scopeValue,
      createdAt: i.createdAt.toISOString(),
    }))
  );
}
