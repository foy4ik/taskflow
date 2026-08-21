import { ArrowDown, Equal, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/I18nProvider";
import { Priority } from "@/generated/prisma/enums";

// Priority is never signaled by color alone: each level pairs a distinct
// icon + text label + color, so it still reads correctly for colorblind
// users or in a screen reader.
const CONFIG: Record<Priority, { icon: LucideIcon; className: string }> = {
  [Priority.LOW]: {
    icon: ArrowDown,
    className: "border-priority-low/30 bg-priority-low/10 text-priority-low",
  },
  [Priority.MEDIUM]: {
    icon: Equal,
    className: "border-priority-medium/30 bg-priority-medium/10 text-priority-medium",
  },
  [Priority.HIGH]: {
    icon: ArrowUp,
    className: "border-priority-high/30 bg-priority-high/10 text-priority-high",
  },
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const { t } = useI18n();
  const { icon: Icon, className: colorClassName } = CONFIG[priority];
  const label = { LOW: t.priority.low, MEDIUM: t.priority.medium, HIGH: t.priority.high }[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        colorClassName,
        className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}
