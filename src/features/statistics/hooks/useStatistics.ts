"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStatistics } from "@/services/api/statistics";

export function useStatistics(days = 7) {
  return useQuery({
    queryKey: ["statistics", days],
    queryFn: () => fetchStatistics(days),
  });
}
