import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/requireUser";
import { withErrorHandling } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";

/** Shared defaults (userId: null) plus this user's own categories, if any. */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = requireUserId(request);

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { name: "asc" },
  });

  return ok(categories);
});
