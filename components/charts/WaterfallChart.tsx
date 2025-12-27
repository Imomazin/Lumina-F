"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { CurrencyCode } from "@/lib/schema";

interface WaterfallItem {
  name: string;
  value: number;
  isTotal?: boolean;
  isSubtract?: boolean;
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  currency: CurrencyCode;
  height?: number;
}

export function WaterfallChart({ data, currency, height = 300 }: WaterfallChartProps) {
  // Calculate running totals and positions for waterfall
  let runningTotal = 0;
  const chartData = data.map((item, index) => {
    if (item.isTotal) {
      const total = runningTotal;
      return {
        name: item.name,
        start: 0,
        end: total,
        value: total,
        isTotal: true,
        isPositive: total >= 0,
      };
    }

    const previousTotal = runningTotal;
    const adjustedValue = item.isSubtract ? -Math.abs(item.value) : item.value;
    runningTotal += adjustedValue;

    return {
      name: item.name,
      start: Math.min(previousTotal, runningTotal),
      end: Math.max(previousTotal, runningTotal),
      value: adjustedValue,
      isTotal: false,
      isPositive: adjustedValue >= 0,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-surface p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.name}</p>
          <p className={`text-sm font-semibold ${data.isPositive ? "text-success" : "text-danger"}`}>
            {data.isPositive && !data.isTotal ? "+" : ""}
            {formatCurrency(data.value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" opacity={0.5} />
        <XAxis
          dataKey="name"
          tick={{ fill: "rgb(var(--color-foreground-muted))", fontSize: 12 }}
          axisLine={{ stroke: "rgb(var(--color-border))" }}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: "rgb(var(--color-foreground-muted))", fontSize: 12 }}
          axisLine={{ stroke: "rgb(var(--color-border))" }}
          tickLine={false}
          tickFormatter={(value) => formatCurrency(value, currency, { compact: true })}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="rgb(var(--color-border))" />

        {/* Invisible bar to create the stacking effect */}
        <Bar dataKey="start" stackId="stack" fill="transparent" />

        {/* The actual waterfall bar */}
        <Bar dataKey={(d) => Math.abs(d.end - d.start)} stackId="stack" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.isTotal
                  ? "rgb(var(--color-primary))"
                  : entry.isPositive
                  ? "rgb(var(--color-success))"
                  : "rgb(var(--color-danger))"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Helper to create P&L waterfall data
export function createPnLWaterfall(
  revenue: number,
  cogs: number,
  opex: number,
  interest: number,
  tax: number
): WaterfallItem[] {
  return [
    { name: "Revenue", value: revenue },
    { name: "COGS", value: cogs, isSubtract: true },
    { name: "Gross Profit", value: revenue - cogs, isTotal: true },
    { name: "Operating Exp", value: opex, isSubtract: true },
    { name: "EBIT", value: revenue - cogs - opex, isTotal: true },
    { name: "Interest", value: interest, isSubtract: true },
    { name: "Tax", value: tax, isSubtract: true },
    { name: "Net Income", value: revenue - cogs - opex - interest - tax, isTotal: true },
  ];
}
