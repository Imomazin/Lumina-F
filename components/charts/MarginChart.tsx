"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatPercent } from "@/lib/format";
import { YearlyMetrics } from "@/lib/finance";

interface MarginChartProps {
  data: YearlyMetrics[];
}

export function MarginChart({ data }: MarginChartProps) {
  const chartData = data.map((d) => ({
    year: d.year,
    grossMargin: d.revenue > 0 ? (d.grossProfit / d.revenue) * 100 : 0,
    ebitMargin: d.revenue > 0 ? (d.ebit / d.revenue) * 100 : 0,
    netMargin: d.revenue > 0 ? (d.netIncome / d.revenue) * 100 : 0,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            className="text-foreground-muted"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            className="text-foreground-muted"
            width={50}
          />
          <Tooltip
            formatter={(value, name) => {
              if (value === undefined || name === undefined) return ["", ""];
              const labels: Record<string, string> = {
                grossMargin: "Gross Margin",
                ebitMargin: "EBIT Margin",
                netMargin: "Net Margin",
              };
              return [formatPercent(value as number), labels[name] || name];
            }}
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Legend
            formatter={(value) => {
              const labels: Record<string, string> = {
                grossMargin: "Gross",
                ebitMargin: "EBIT",
                netMargin: "Net",
              };
              return labels[value] || value;
            }}
          />
          <Line
            type="monotone"
            dataKey="grossMargin"
            stroke="var(--success)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="ebitMargin"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="netMargin"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
