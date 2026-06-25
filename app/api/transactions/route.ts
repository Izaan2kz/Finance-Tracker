import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { createTransactionSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const supabase = await createServerSupabaseClient();
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");

  let query = supabase
    .from("transactions")
    .select("*, category:categories(id, name, icon, color)", { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (type) query = query.eq("type", type);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  if (search) query = query.ilike("description", `%${search}%`);

  const { data: transactions, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count || 0;

  return NextResponse.json({
    data: transactions || [],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const supabase = await createServerSupabaseClient();
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
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("user_id", user.id)
      .single();

    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type,
      amount,
      description,
      category_id: categoryId || null,
      date,
      note: note || null,
    })
    .select("*, category:categories(id, name, icon, color)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(transaction, { status: 201 });
}
