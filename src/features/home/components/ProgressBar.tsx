import { Progress } from "@/components/ui/progress";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return <Progress value={value} className={className} />;
}
