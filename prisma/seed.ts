import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
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

async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const existingCount = await prisma.category.count({
      where: { userId: user.id },
    });
    if (existingCount > 0) continue;

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        userId: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      })),
    });
    console.log(`Seeded categories for user ${user.email}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
