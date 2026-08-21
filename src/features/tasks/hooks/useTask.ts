"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTask } from "@/services/api/tasks";
import type { Task } from "@/types/task";

/**
 * `initialData` matters beyond avoiding a loading flash: it's what lets a
 * caller hand this hook an already-known task (e.g. the card that was
 * tapped) while still subscribing to the same `["task", id]` cache entry
 * that mutations (optimistic or settled) write to — so the view stays live
 * instead of freezing on the snapshot it was opened with.
 */
export function useTask(id: string | undefined, initialData?: Task) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTask(id as string),
    enabled: Boolean(id),
    initialData,
  });
}
