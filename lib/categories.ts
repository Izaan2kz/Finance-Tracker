import type { SupabaseClient } from "@supabase/supabase-js";

export const defaultCategories = [
  { name: "Food & Dining", icon: "🍔", color: "#F97316" },
  { name: "Groceries", icon: "🛒", color: "#FB923C" },
  { name: "Transport", icon: "🚗", color: "#3B82F6" },
  { name: "Housing & Rent", icon: "🏠", color: "#8B5CF6" },
  { name: "Entertainment", icon: "🎬", color: "#EC4899" },
  { name: "Health & Medical", icon: "💊", color: "#10B981" },
  { name: "Shopping", icon: "🛍️", color: "#F59E0B" },
  { name: "Utilities & Bills", icon: "⚡", color: "#6366F1" },
  { name: "Education", icon: "📚", color: "#0EA5E9" },
  { name: "Subscriptions", icon: "🔄", color: "#A855F7" },
  { name: "Travel", icon: "✈️", color: "#14B8A6" },
  { name: "Personal Care", icon: "💇", color: "#F472B6" },
  { name: "Insurance", icon: "🛡️", color: "#64748B" },
  { name: "Gifts & Donations", icon: "🎁", color: "#E11D48" },
  { name: "Savings & Investments", icon: "📈", color: "#059669" },
  { name: "Income", icon: "💵", color: "#22C55E" },
  { name: "Freelance", icon: "💻", color: "#06B6D4" },
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
