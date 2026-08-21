import { cn } from "@/lib/utils";
import type { Category } from "@/types/task";

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
        className
      )}
      style={
        category.color
          ? {
              color: category.color,
              backgroundColor: `color-mix(in oklch, ${category.color} 16%, transparent)`,
            }
          : undefined
      }
    >
      {category.name}
    </span>
  );
}
