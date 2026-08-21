import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/requireUser";
import { withErrorHandling } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { computeStatistics } from "@/lib/statistics/computeStatistics";

const statisticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = requireUserId(request);
  const { days } = statisticsQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  const statistics = await computeStatistics(userId, days);
  return ok(statistics);
});
