"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { YearlyMetrics } from "@/lib/finance";
import { CurrencyCode } from "@/lib/schema";

interface ProfitChartProps {
  data: YearlyMetrics[];
  currency: CurrencyCode;
}

export function ProfitChart({ data, currency }: ProfitChartProps) {
  const chartData = data.map((d) => ({
    year: d.year,
    ebit: d.ebit,
    netIncome: d.netIncome,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            formatter={(value, name) => {
              if (value === undefined) return ["", ""];
              return [
                formatCurrency(value as number, currency),
                name === "ebit" ? "EBIT" : "Net Income",
              ];
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
            formatter={(value) => (value === "ebit" ? "EBIT" : "Net Income")}
          />
          <Bar dataKey="ebit" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="netIncome" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
