"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { CurrencyCode } from "@/lib/schema";
import { TornadoItem } from "@/lib/finance";

interface TornadoChartProps {
  data: TornadoItem[];
  currency: CurrencyCode;
  height?: number;
}

export function TornadoChart({ data, currency, height = 300 }: TornadoChartProps) {
  // Transform data for horizontal bar chart
  const chartData = data.map((item) => ({
    variable: item.variable,
    low: item.lowEV - item.baseEV,
    high: item.highEV - item.baseEV,
    lowLabel: `${item.variable} @ ${item.lowValue.toFixed(1)}`,
    highLabel: `${item.variable} @ ${item.highValue.toFixed(1)}`,
    baseEV: item.baseEV,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-surface p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{data.variable}</p>
          <div className="space-y-1 text-xs">
            <p className="text-danger">
              Low: {formatCurrency(data.baseEV + data.low, currency)}
              <span className="text-foreground-muted ml-1">
                ({data.low >= 0 ? "+" : ""}{formatCurrency(data.low, currency, { compact: true })})
              </span>
            </p>
            <p className="text-success">
              High: {formatCurrency(data.baseEV + data.high, currency)}
              <span className="text-foreground-muted ml-1">
                ({data.high >= 0 ? "+" : ""}{formatCurrency(data.high, currency, { compact: true })})
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find the max absolute value for symmetric axis
  const maxValue = Math.max(
    ...chartData.flatMap((d) => [Math.abs(d.low), Math.abs(d.high)])
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" opacity={0.5} />
        <XAxis
          type="number"
          domain={[-maxValue * 1.1, maxValue * 1.1]}
          tick={{ fill: "rgb(var(--color-foreground-muted))", fontSize: 12 }}
          axisLine={{ stroke: "rgb(var(--color-border))" }}
          tickLine={false}
          tickFormatter={(value) => formatCurrency(value, currency, { compact: true })}
        />
        <YAxis
          type="category"
          dataKey="variable"
          tick={{ fill: "rgb(var(--color-foreground-muted))", fontSize: 12 }}
          axisLine={{ stroke: "rgb(var(--color-border))" }}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={0} stroke="rgb(var(--color-foreground))" strokeWidth={2} />

        {/* Low (negative) bars */}
        <Bar dataKey="low" name="Downside" radius={[4, 0, 0, 4]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill="rgb(var(--color-danger))" />
          ))}
        </Bar>

        {/* High (positive) bars */}
        <Bar dataKey="high" name="Upside" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill="rgb(var(--color-success))" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Compact version for dashboard
interface TornadoCompactProps {
  data: TornadoItem[];
  currency: CurrencyCode;
}

export function TornadoCompact({ data, currency }: TornadoCompactProps) {
  const maxSensitivity = Math.max(...data.map((d) => d.sensitivity));

  return (
    <div className="space-y-3">
      {data.slice(0, 4).map((item, idx) => {
        const widthPct = (item.sensitivity / maxSensitivity) * 100;
        const lowDelta = item.lowEV - item.baseEV;
        const highDelta = item.highEV - item.baseEV;

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{item.variable}</span>
              <span className="text-foreground-muted">
                ±{formatCurrency(item.sensitivity / 2, currency, { compact: true })}
              </span>
            </div>
            <div className="relative h-6 bg-surface-2 rounded overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-px bg-foreground-muted/30" />
              {/* Low bar (left of center) */}
              <div
                className="absolute inset-y-0 right-1/2 bg-danger/20"
                style={{ width: `${(Math.abs(lowDelta) / maxSensitivity) * 50}%` }}
              />
              {/* High bar (right of center) */}
              <div
                className="absolute inset-y-0 left-1/2 bg-success/20"
                style={{ width: `${(Math.abs(highDelta) / maxSensitivity) * 50}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
