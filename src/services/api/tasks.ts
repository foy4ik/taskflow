import { apiClient } from "./client";
import type { ApiSuccess, ApiSuccessWithMeta } from "@/types/api";
import type {
  CreateTaskPayload,
  Task,
  TaskListMeta,
  TaskQueryParams,
  UpdateTaskPayload,
} from "@/types/task";

function buildQueryString(params: TaskQueryParams): string {
  const search = new URLSearchParams();
  if (params.filter) search.set("filter", params.filter);
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.search) search.set("search", params.search);
  if (params.categoryId) search.set("categoryId", params.categoryId);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchTasks(
  params: TaskQueryParams = {}
): Promise<ApiSuccessWithMeta<Task[], TaskListMeta>> {
  return apiClient.get<ApiSuccessWithMeta<Task[], TaskListMeta>>(
    `/api/tasks${buildQueryString(params)}`
  );
}

export async function fetchTask(id: string): Promise<Task> {
  const res = await apiClient.get<ApiSuccess<Task>>(`/api/tasks/${id}`);
  return res.data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await apiClient.post<ApiSuccess<Task>>("/api/tasks", payload);
  return res.data;
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const res = await apiClient.patch<ApiSuccess<Task>>(`/api/tasks/${id}`, payload);
  return res.data;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete<ApiSuccess<{ id: string }>>(`/api/tasks/${id}`);
}
