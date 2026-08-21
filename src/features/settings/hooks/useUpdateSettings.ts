"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMe } from "@/services/api/me";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useI18n } from "@/providers/I18nProvider";
import type { UpdateSettingsInput } from "@/types/user";

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { notify } = useHapticFeedback();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (payload: UpdateSettingsInput) => updateMe(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
      notify("success");
      toast.success(t.settings.saved);
    },
    onError: () => {
      notify("error");
      toast.error(t.states.errorBody);
    },
  });
}
