"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/I18nProvider";
import type { SortOrder, TaskSort } from "@/types/task";

interface SortMenuProps {
  sort: TaskSort;
  order: SortOrder;
  onChange: (next: { sort: TaskSort; order: SortOrder }) => void;
}

export function SortMenu({ sort, order, onChange }: SortMenuProps) {
  const { t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        {order === "asc" ? (
          <ArrowUp className="size-3.5" aria-hidden="true" />
        ) : (
          <ArrowDown className="size-3.5" aria-hidden="true" />
        )}
        {t.tasks.sort[sort]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t.tasks.sortLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={sort}
          onValueChange={(value) => onChange({ sort: value as TaskSort, order })}
        >
          <DropdownMenuRadioItem value="dueDate">{t.tasks.sort.dueDate}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="priority">{t.tasks.sort.priority}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="createdAt">{t.tasks.sort.createdAt}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={order}
          onValueChange={(value) => onChange({ sort, order: value as SortOrder })}
        >
          <DropdownMenuRadioItem value="asc">{t.tasks.sortOrder.asc}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="desc">{t.tasks.sortOrder.desc}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
