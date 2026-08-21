"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateTask } from "@/services/api/tasks";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useI18n } from "@/providers/I18nProvider";
import type { ApiSuccessWithMeta } from "@/types/api";
import type { Task, TaskListMeta, UpdateTaskPayload } from "@/types/task";

type TaskListData = ApiSuccessWithMeta<Task[], TaskListMeta>;

interface UpdateTaskVars {
  id: string;
  payload: UpdateTaskPayload;
  /** Suppress the toast for quiet background edits (the complete checkbox still haptics). */
  silent?: boolean;
}

function applyPatch(task: Task, payload: UpdateTaskPayload): Task {
  return {
    ...task,
    ...payload,
    description: payload.description !== undefined ? (payload.description ?? null) : task.description,
    dueDate: payload.dueDate !== undefined ? (payload.dueDate ?? null) : task.dueDate,
    completedAt: payload.status
      ? payload.status === "COMPLETED"
        ? new Date().toISOString()
        : null
      : task.completedAt,
  };
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { notify } = useHapticFeedback();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateTaskVars) => updateTask(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["task", id] });

      const previousLists = queryClient.getQueriesData<TaskListData>({ queryKey: ["tasks"] });
      const previousDetail = queryClient.getQueryData<Task>(["task", id]);

      queryClient.setQueriesData<TaskListData>({ queryKey: ["tasks"] }, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map((task) => (task.id === id ? applyPatch(task, payload) : task)) };
      });
      if (previousDetail) {
        queryClient.setQueryData<Task>(["task", id], applyPatch(previousDetail, payload));
      }

      // Fires immediately, not after the network round-trip — that's the point.
      notify("success");

      return { previousLists, previousDetail, id };
    },

    onError: (_error, _vars, context) => {
      context?.previousLists.forEach(([key, data]: [QueryKey, unknown]) =>
        queryClient.setQueryData(key, data)
      );
      if (context?.previousDetail) {
        queryClient.setQueryData(["task", context.id], context.previousDetail);
      }
      notify("error");
      toast.error(t.taskForm.errorGeneric);
    },

    onSuccess: (_data, variables) => {
      if (!variables.silent) toast.success(t.taskForm.successEdit);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}
