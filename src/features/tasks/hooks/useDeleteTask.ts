"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteTask } from "@/services/api/tasks";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useI18n } from "@/providers/I18nProvider";
import type { ApiSuccessWithMeta } from "@/types/api";
import type { Task, TaskListMeta } from "@/types/task";

type TaskListData = ApiSuccessWithMeta<Task[], TaskListMeta>;

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { notify } = useHapticFeedback();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousLists = queryClient.getQueriesData<TaskListData>({ queryKey: ["tasks"] });

      queryClient.setQueriesData<TaskListData>({ queryKey: ["tasks"] }, (old) => {
        if (!old) return old;
        return {
          data: old.data.filter((task) => task.id !== id),
          meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
        };
      });

      return { previousLists };
    },

    onError: (_error, _id, context) => {
      context?.previousLists.forEach(([key, data]: [QueryKey, unknown]) =>
        queryClient.setQueryData(key, data)
      );
      notify("error");
      toast.error(t.taskForm.errorGeneric);
    },

    onSuccess: () => {
      notify("success");
      toast.success(t.taskDetail.deleted);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}
