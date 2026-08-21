import { apiClient } from "./client";
import type { ApiSuccess } from "@/types/api";
import type { PublicUser, UpdateSettingsInput } from "@/types/user";

export async function fetchMe(): Promise<PublicUser> {
  const res = await apiClient.get<ApiSuccess<PublicUser>>("/api/me");
  return res.data;
}

export async function updateMe(payload: UpdateSettingsInput): Promise<PublicUser> {
  const res = await apiClient.patch<ApiSuccess<PublicUser>>("/api/me", payload);
  return res.data;
}

export async function authenticateWithTelegram(initData: string): Promise<PublicUser> {
  const res = await apiClient.post<ApiSuccess<{ user: PublicUser }>>("/api/auth/telegram", {
    initData,
  });
  return res.data.user;
}

export async function authenticateWithMock(): Promise<PublicUser> {
  const res = await apiClient.post<ApiSuccess<{ user: PublicUser }>>("/api/auth/telegram", {
    mock: true,
  });
  return res.data.user;
}
