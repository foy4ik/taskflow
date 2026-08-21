"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { useI18n } from "@/providers/I18nProvider";
import type { StatisticsResponse } from "@/types/statistics";

interface StatisticsChartProps {
  data: StatisticsResponse["byDay"];
}

export function StatisticsChart({ data }: StatisticsChartProps) {
  const { t } = useI18n();
  const chartData = data.map((day) => ({ ...day, label: format(new Date(day.date), "EEE") }));

  return (
    <div className="mx-4 flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{t.statistics.byDay}</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={24}
              stroke="var(--muted-foreground)"
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
            />
            <Bar dataKey="created" name="Created" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="Completed" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
