"use client";

import { AnimatePresence } from "framer-motion";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  onSelect: (task: Task) => void;
}

export function TaskList({ tasks, onSelect }: TaskListProps) {
  return (
    <div className="flex flex-col gap-3 px-4 py-2">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onSelect={onSelect} />
        ))}
      </AnimatePresence>
    </div>
  );
}
