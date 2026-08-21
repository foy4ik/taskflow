import type { SortOrder, Task, TaskSort } from "@/types/task";

export function matchesSearch(task: Task, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  return task.title.toLowerCase().includes(trimmed);
}

const PRIORITY_RANK: Record<Task["priority"], number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };

/**
 * Client-side re-sort, used after an optimistic update might have changed a
 * task's ordering-relevant field before the server round-trip completes.
 * Mirrors the server's ordering rules (lib/tasks/queryHelpers.ts): tasks
 * without a due date always sort last when sorting by due date.
 */
export function sortTasks(tasks: Task[], sort: TaskSort, order: SortOrder): Task[] {
  const sorted = [...tasks];
  sorted.sort((a, b) => {
    let comparison: number;
    if (sort === "priority") {
      comparison = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    } else if (sort === "createdAt") {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      comparison = aTime - bTime;
    }
    return order === "asc" ? comparison : -comparison;
  });
  return sorted;
}
