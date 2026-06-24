import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const supabase = await createServerSupabaseClient();

  const { data: insights, error } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    (insights || []).map((i) => ({
      id: i.id,
      response: i.response,
      scope: i.scope,
      scopeValue: i.scope_value,
      createdAt: i.created_at,
    }))
  );
}
