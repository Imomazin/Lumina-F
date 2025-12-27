"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { YearlyMetrics } from "@/lib/finance";
import { CurrencyCode } from "@/lib/schema";

interface RevenueChartProps {
  data: YearlyMetrics[];
  currency: CurrencyCode;
}

export function RevenueChart({ data, currency }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    year: d.year,
    revenue: d.revenue,
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
            tickFormatter={(value) =>
              formatCurrency(value, currency, { compact: true })
            }
            className="text-foreground-muted"
            width={80}
          />
          <Tooltip
            formatter={(value) => {
              if (value === undefined) return ["", ""];
              return [formatCurrency(value as number, currency), "Revenue"];
            }}
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ fill: "var(--primary)", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "var(--primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
