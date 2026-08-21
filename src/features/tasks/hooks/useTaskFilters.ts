"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortOrder, TaskFilter, TaskSort } from "@/types/task";

export interface TaskFiltersState {
  filter: TaskFilter;
  sort: TaskSort;
  order: SortOrder;
  search: string;
}

const DEFAULTS: TaskFiltersState = { filter: "all", sort: "dueDate", order: "asc", search: "" };

/** Keeps task list filters/sort/search in the URL, so the view survives a reload or back-navigation. */
export function useTaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: TaskFiltersState = useMemo(
    () => ({
      filter: (searchParams.get("filter") as TaskFilter | null) ?? DEFAULTS.filter,
      sort: (searchParams.get("sort") as TaskSort | null) ?? DEFAULTS.sort,
      order: (searchParams.get("order") as SortOrder | null) ?? DEFAULTS.order,
      search: searchParams.get("q") ?? DEFAULTS.search,
    }),
    [searchParams]
  );

  const setFilters = useCallback(
    (patch: Partial<TaskFiltersState>) => {
      const merged = { ...state, ...patch };
      const next = new URLSearchParams();

      if (merged.filter !== DEFAULTS.filter) next.set("filter", merged.filter);
      if (merged.sort !== DEFAULTS.sort) next.set("sort", merged.sort);
      if (merged.order !== DEFAULTS.order) next.set("order", merged.order);
      if (merged.search) next.set("q", merged.search);

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, state]
  );

  return { ...state, setFilters };
}
