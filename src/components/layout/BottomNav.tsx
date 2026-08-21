"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/I18nProvider";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

const NAV_ITEMS = [
  { href: "/", icon: Home, labelKey: "home" as const },
  { href: "/tasks", icon: ListChecks, labelKey: "tasks" as const },
  { href: "/statistics", icon: BarChart3, labelKey: "statistics" as const },
  { href: "/settings", icon: Settings, labelKey: "settings" as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { selection } = useHapticFeedback();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-safe backdrop-blur supports-backdrop-filter:bg-background/80"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5">
        {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => selection()}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-16 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
              <span>{t.nav[labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
