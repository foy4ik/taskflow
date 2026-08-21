import { apiClient } from "./client";
import type { ApiSuccess } from "@/types/api";
import type { StatisticsResponse } from "@/types/statistics";

export async function fetchStatistics(days = 7): Promise<StatisticsResponse> {
  const res = await apiClient.get<ApiSuccess<StatisticsResponse>>(`/api/statistics?days=${days}`);
  return res.data;
}
