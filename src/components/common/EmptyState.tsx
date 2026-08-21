import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      {icon}
      <p className="text-base font-medium text-foreground">{title}</p>
      {body ? <p className="max-w-xs text-sm text-muted-foreground">{body}</p> : null}
      {action}
    </div>
  );
}
