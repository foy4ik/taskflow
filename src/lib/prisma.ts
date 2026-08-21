import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma Client singleton, using the `pg` driver adapter (required by the
 * Prisma 7 `prisma-client` generator). In development we cache the instance
 * on `globalThis` so Next.js's hot-reloading doesn't spawn a new connection
 * pool on every module reload.
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
