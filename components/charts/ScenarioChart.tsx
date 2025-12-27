"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { CurrencyCode } from "@/lib/schema";
import { ScenarioResult } from "@/lib/finance";

interface ScenarioChartProps {
  scenarios: ScenarioResult[];
  currency: CurrencyCode;
  metric?: "revenue" | "netIncome" | "cashProxy";
  height?: number;
}

export function ScenarioChart({
  scenarios,
  currency,
  metric = "revenue",
  height = 300,
}: ScenarioChartProps) {
  // Get all years and create combined dataset
  const years = new Set<number>();
  scenarios.forEach((s) => s.forecast.yearly.forEach((y) => years.add(y.year)));
  const sortedYears = Array.from(years).sort();

  const chartData = sortedYears.map((year) => {
    const point: any = { year };
    scenarios.forEach((scenario) => {
      const yearData = scenario.forecast.yearly.find((y) => y.year === year);
      if (yearData) {
        point[scenario.type] = yearData[metric];
      }
    });
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-surface p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">Year {label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, idx: number) => (
              <p key={idx} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {formatCurrency(entry.value, currency)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(var(--color-success))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="rgb(var(--color-success))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(var(--color-primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(var(--color-warning))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="rgb(var(--color-warning))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" opacity={0.5} />
        <XAxis
          dataKey="year"
          tick={{ fill: "rgb(var(--color-foreground-muted))", fontSize: 12 }}
          axisLine={{ stroke: "rgb(var(--color-border))" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "rgb(var(--color-foreground-muted))", fontSize: 12 }}
          axisLine={{ stroke: "rgb(var(--color-border))" }}
          tickLine={false}
          tickFormatter={(value) => formatCurrency(value, currency, { compact: true })}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value) => <span className="text-foreground-muted text-sm capitalize">{value}</span>}
        />

        <Area
          type="monotone"
          dataKey="bull"
          name="Optimistic"
          stroke="rgb(var(--color-success))"
          fill="url(#bullGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="base"
          name="Base Case"
          stroke="rgb(var(--color-primary))"
          fill="url(#baseGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="bear"
          name="Conservative"
          stroke="rgb(var(--color-warning))"
          fill="url(#bearGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Scenario comparison cards
interface ScenarioCardsProps {
  scenarios: ScenarioResult[];
  currency: CurrencyCode;
}

export function ScenarioCards({ scenarios, currency }: ScenarioCardsProps) {
  const scenarioOrder = ["bull", "base", "bear"];
  const sortedScenarios = [...scenarios].sort(
    (a, b) => scenarioOrder.indexOf(a.type) - scenarioOrder.indexOf(b.type)
  );

  const variantClasses = {
    bull: "border-success/30 bg-success/5",
    base: "border-primary/30 bg-primary/5",
    bear: "border-warning/30 bg-warning/5",
  };

  const iconClasses = {
    bull: "text-success",
    base: "text-primary",
    bear: "text-warning",
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {sortedScenarios.map((scenario) => (
        <div
          key={scenario.type}
          className={`rounded-xl border p-5 ${variantClasses[scenario.type]}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                {scenario.label}
              </span>
              <span className={`ml-2 text-xs ${iconClasses[scenario.type]}`}>
                ({(scenario.probability * 100).toFixed(0)}%)
              </span>
            </div>
            {scenario.type === "bull" && (
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            )}
            {scenario.type === "base" && (
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {scenario.type === "bear" && (
              <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-foreground-muted">Enterprise Value</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(scenario.valuation.enterpriseValue, currency, { compact: true })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-foreground-muted">Revenue Growth</p>
                <p className="text-sm font-semibold text-foreground">
                  {scenario.assumptions.revenueGrowth.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">WACC</p>
                <p className="text-sm font-semibold text-foreground">
                  {scenario.assumptions.wacc.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
