import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { createTransactionSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;
  const categoryId = searchParams.get("categoryId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { userId: user.id };
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  const serialized = transactions.map((t) => ({
    ...t,
    amount: t.amount.toNumber(),
    date: t.date.toISOString().split("T")[0],
  }));

  return NextResponse.json({
    data: serialized,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const parsed = createTransactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, amount, description, categoryId, date, note } = parsed.data;

  if (categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: categoryId, userId: user.id },
    });
    if (!cat) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      type,
      amount,
      description,
      categoryId: categoryId || null,
      date: new Date(date),
      note: note || null,
    },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  return NextResponse.json(
    {
      ...transaction,
      amount: transaction.amount.toNumber(),
      date: transaction.date.toISOString().split("T")[0],
    },
    { status: 201 }
  );
}
