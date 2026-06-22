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

export async function seedDefaultCategories(userId: string) {
  const { prisma } = await import("@/lib/prisma");

  const existing = await prisma.category.findFirst({ where: { userId } });
  if (existing) return;

  await prisma.category.createMany({
    data: defaultCategories.map((cat) => ({
      userId,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isDefault: true,
    })),
  });
}
