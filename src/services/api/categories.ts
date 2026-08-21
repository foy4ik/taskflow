import { apiClient } from "./client";
import type { ApiSuccess } from "@/types/api";
import type { Category } from "@/types/task";

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiSuccess<Category[]>>("/api/categories");
  return res.data;
}
