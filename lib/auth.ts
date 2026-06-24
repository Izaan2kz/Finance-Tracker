import { createServerSupabaseClient } from "@/lib/supabase-server";
import { seedDefaultCategories } from "@/lib/categories";
import { NextResponse } from "next/server";
import type { User } from "@/types";

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("supabase_id", supabaseUser.id)
    .single();

  if (user) return user;

  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      supabase_id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.full_name || null,
    })
    .select()
    .single();

  if (error || !newUser) return null;

  await seedDefaultCategories(supabase, newUser.id);
  return newUser;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
