"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/services/api/tasks";
import type { TaskQueryParams } from "@/types/task";

export function useTasks(params: TaskQueryParams) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => fetchTasks(params),
    placeholderData: (previousData) => previousData,
  });
}
