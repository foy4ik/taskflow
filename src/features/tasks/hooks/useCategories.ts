"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/services/api/categories";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
}
