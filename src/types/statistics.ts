export interface StatisticsResponse {
  today: { total: number; completed: number; remaining: number };
  overall: { totalTasks: number; completedTasks: number; completionRate: number };
  byCategory: { categoryId: string; name: string; color: string | null; count: number }[];
  byDay: { date: string; completed: number; created: number }[];
}
