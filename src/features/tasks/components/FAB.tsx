"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface FABProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

export function FAB({ onClick, className, label = "Create task" }: FABProps) {
  const { impact } = useHapticFeedback();

  return (
    <button
      type="button"
      onClick={() => {
        impact("light");
        onClick();
      }}
      aria-label={label}
      className={cn(
        "fixed right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform",
        "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <Plus className="size-6" aria-hidden="true" />
    </button>
  );
}
