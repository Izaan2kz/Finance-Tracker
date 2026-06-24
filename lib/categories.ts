import type { SupabaseClient } from "@supabase/supabase-js";

export const defaultCategories = [
  { name: "Food & Dining", icon: "🍔", color: "#F97316" },
  { name: "Transport", icon: "🚗", color: "#3B82F6" },
  { name: "Housing", icon: "🏠", color: "#8B5CF6" },
  { name: "Entertainment", icon: "🎬", color: "#EC4899" },
  { name: "Health", icon: "💊", color: "#10B981" },
  { name: "Shopping", icon: "🛍️", color: "#F59E0B" },
  { name: "Utilities", icon: "⚡", color: "#6366F1" },
  { name: "Income", icon: "💵", color: "#22C55E" },
  { name: "Other", icon: "📦", color: "#9CA3AF" },
];

export async function seedDefaultCategories(supabase: SupabaseClient, userId: string) {
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (existing && existing.length > 0) return;

  await supabase.from("categories").insert(
    defaultCategories.map((cat) => ({
      user_id: userId,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      is_default: true,
    }))
  );
}
