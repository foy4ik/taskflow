"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTask } from "@/services/api/tasks";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useI18n } from "@/providers/I18nProvider";
import type { ApiSuccessWithMeta } from "@/types/api";
import type { Category, CreateTaskPayload, Task, TaskListMeta } from "@/types/task";

type TaskListData = ApiSuccessWithMeta<Task[], TaskListMeta>;

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { notify } = useHapticFeedback();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousLists = queryClient.getQueriesData<TaskListData>({ queryKey: ["tasks"] });

      const categories = queryClient.getQueryData<Category[]>(["categories"]) ?? [];
      const category = categories.find((c) => c.id === payload.categoryId) ?? {
        id: payload.categoryId,
        name: "…",
        icon: null,
        color: null,
        userId: null,
      };

      const optimisticTask: Task = {
        id: `optimistic-${Date.now()}`,
        userId: "",
        title: payload.title,
        description: payload.description ?? null,
        status: "PENDING",
        priority: payload.priority,
        categoryId: payload.categoryId,
        category,
        dueDate: payload.dueDate ?? null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueriesData<TaskListData>({ queryKey: ["tasks"] }, (old) => {
        if (!old) return old;
        return {
          data: [optimisticTask, ...old.data],
          meta: { ...old.meta, total: old.meta.total + 1 },
        };
      });

      return { previousLists };
    },

    onError: (_error, _payload, context) => {
      context?.previousLists.forEach(([key, data]: [QueryKey, unknown]) =>
        queryClient.setQueryData(key, data)
      );
      notify("error");
      toast.error(t.taskForm.errorGeneric);
    },

    onSuccess: () => {
      notify("success");
      toast.success(t.taskForm.successCreate);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}
