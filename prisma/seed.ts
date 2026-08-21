import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Shared system-default categories (userId: null). Every user sees these;
// users may also create their own private categories later via the API.
const DEFAULT_CATEGORIES = [
  { name: "Work", icon: "Briefcase", color: "#6366f1" },
  { name: "Personal", icon: "User", color: "#8b5cf6" },
  { name: "Shopping", icon: "ShoppingCart", color: "#ec4899" },
  { name: "Health", icon: "HeartPulse", color: "#22c55e" },
  { name: "Study", icon: "BookOpen", color: "#f59e0b" },
  { name: "Other", icon: "Tag", color: "#64748b" },
];

async function main() {
  console.log("Seeding default categories…");

  // Note: `@@unique([userId, name])` does not help us find-or-create here —
  // Postgres treats each NULL in a unique index as distinct, so an `upsert`
  // keyed on `{ userId: null, name }` would silently create duplicates on a
  // second seed run instead of matching the existing row. Do it manually.
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: category.name },
    });

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { icon: category.icon, color: category.color },
      });
    } else {
      await prisma.category.create({ data: { ...category, userId: null } });
    }
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
