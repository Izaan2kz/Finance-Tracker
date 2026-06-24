import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { updateTransactionSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateTransactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.type !== undefined) updates.type = parsed.data.type;
  if (parsed.data.amount !== undefined) updates.amount = parsed.data.amount;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.categoryId !== undefined) updates.category_id = parsed.data.categoryId;
  if (parsed.data.date !== undefined) updates.date = parsed.data.date;
  if (parsed.data.note !== undefined) updates.note = parsed.data.note;

  const { data: transaction, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select("*, category:categories(id, name, icon, color)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(transaction);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
