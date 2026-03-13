"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Line, ComposedChart, Area,
} from "recharts";
import { GlassPanel } from "@/components/ui/design-system";

// =============================================================================
// SPARKLINE COMPONENT
// =============================================================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}

export function Sparkline({ data, width = 80, height = 24, color = "#FBBF24", showArea = true }: SparklineProps) {
  const points = useMemo(() => {
    if (!data.length) return "";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(" ");
  }, [data, width, height]);

  const areaPoints = useMemo(() => {
    if (!data.length) return "";
    return `0,${height} ${points} ${width},${height}`;
  }, [points, width, height, data.length]);

  const trend = data.length > 1 ? data[data.length - 1] - data[0] : 0;
  const trendColor = trend >= 0 ? "#22c55e" : "#ef4444";

  return (
    <svg width={width} height={height} className="overflow-visible">
      {showArea && (
        <polygon
          points={areaPoints}
          fill={`${color}20`}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length > 0 && (
        <circle
          cx={width}
          cy={height - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * height}
          r={2}
          fill={trendColor}
        />
      )}
    </svg>
  );
}

// =============================================================================
// WATERFALL CHART
// =============================================================================

interface WaterfallItem {
  name: string;
  value: number;
  type: "start" | "positive" | "negative" | "total";
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  currency?: string;
  height?: number;
}

export function WaterfallChart({ data, currency = "USD", height = 300 }: WaterfallChartProps) {
  const processedData = useMemo(() => {
    let runningTotal = 0;
    return data.map((item) => {
      if (item.type === "start" || item.type === "total") {
        runningTotal = item.value;
        return {
          ...item,
          start: 0,
          end: item.value,
          displayValue: item.value,
        };
      } else {
        const start = runningTotal;
        runningTotal += item.value;
        return {
          ...item,
          start: Math.min(start, runningTotal),
          end: Math.max(start, runningTotal),
          displayValue: item.value,
        };
      }
    });
  }, [data]);

  const formatValue = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#666"
          tick={{ fill: "#999", fontSize: 11 }}
          axisLine={{ stroke: "#444" }}
        />
        <YAxis
          stroke="#666"
          tick={{ fill: "#999", fontSize: 11 }}
          tickFormatter={formatValue}
          axisLine={{ stroke: "#444" }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload;
            return (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
                <p className="text-white font-medium">{item.name}</p>
                <p className={`text-sm ${item.type === "negative" ? "text-red-400" : "text-green-400"}`}>
                  {item.displayValue >= 0 ? "+" : ""}{formatValue(item.displayValue)}
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="end" stackId="a" fill="transparent" />
        <Bar dataKey="start" stackId="a" fill="transparent" />
        {processedData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={
              entry.type === "start" || entry.type === "total"
                ? "#6366f1"
                : entry.type === "positive"
                ? "#22c55e"
                : "#ef4444"
            }
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// =============================================================================
// SENSITIVITY HEATMAP
// =============================================================================

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  xLabel: string;
  yLabel: string;
}

interface SensitivityHeatmapProps {
  baseValue: number;
  xParam: { name: string; values: number[]; unit: string };
  yParam: { name: string; values: number[]; unit: string };
  calculateValue: (x: number, y: number) => number;
  currency?: string;
}

export function SensitivityHeatmap({
  baseValue,
  xParam,
  yParam,
  calculateValue,
  currency = "USD",
}: SensitivityHeatmapProps) {
  const cells = useMemo(() => {
    const result: HeatmapCell[] = [];
    yParam.values.forEach((y, yi) => {
      xParam.values.forEach((x, xi) => {
        result.push({
          x: xi,
          y: yi,
          value: calculateValue(x, y),
          xLabel: `${x}${xParam.unit}`,
          yLabel: `${y}${yParam.unit}`,
        });
      });
    });
    return result;
  }, [xParam, yParam, calculateValue]);

  const minValue = Math.min(...cells.map((c) => c.value));
  const maxValue = Math.max(...cells.map((c) => c.value));

  const getColor = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1);
    if (ratio < 0.25) return "bg-red-600";
    if (ratio < 0.4) return "bg-red-500";
    if (ratio < 0.5) return "bg-amber-500";
    if (ratio < 0.6) return "bg-amber-400";
    if (ratio < 0.75) return "bg-green-500";
    return "bg-green-400";
  };

  const formatValue = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  return (
    <div>
      {/* Y-axis label */}
      <div className="flex">
        <div className="w-20 flex items-center justify-center">
          <span className="text-xs text-zinc-500 -rotate-90 whitespace-nowrap">{yParam.name}</span>
        </div>
        <div className="flex-1">
          {/* Grid */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${xParam.values.length}, 1fr)` }}>
            {cells.map((cell, idx) => {
              const isBase = Math.abs(cell.value - baseValue) < baseValue * 0.01;
              return (
                <div
                  key={idx}
                  className={`aspect-square ${getColor(cell.value)} ${isBase ? "ring-2 ring-white" : ""}
                    flex items-center justify-center text-[10px] font-mono text-white/90
                    hover:ring-2 hover:ring-amber-400 cursor-pointer transition-all`}
                  title={`${yParam.name}: ${cell.yLabel}, ${xParam.name}: ${cell.xLabel}\nValue: ${formatValue(cell.value)}`}
                >
                  {formatValue(cell.value)}
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div className="grid mt-1" style={{ gridTemplateColumns: `repeat(${xParam.values.length}, 1fr)` }}>
            {xParam.values.map((x, i) => (
              <div key={i} className="text-center text-[10px] text-zinc-500">
                {x}{xParam.unit}
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-zinc-500 mt-1">{xParam.name}</div>
        </div>
        {/* Y-axis labels */}
        <div className="w-12 flex flex-col justify-around ml-2">
          {yParam.values.map((y, i) => (
            <div key={i} className="text-[10px] text-zinc-500 text-right">
              {y}{yParam.unit}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-600 rounded" />
          <span className="text-[10px] text-zinc-500">Lower</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500 rounded" />
          <span className="text-[10px] text-zinc-500">Base</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-400 rounded" />
          <span className="text-[10px] text-zinc-500">Higher</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// BREAK-EVEN CHART
// =============================================================================

interface BreakEvenChartProps {
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  maxUnits?: number;
  currency?: string;
}

export function BreakEvenChart({
  fixedCosts,
  variableCostPerUnit,
  pricePerUnit,
  maxUnits = 1000,
  currency = "USD",
}: BreakEvenChartProps) {
  const breakEvenUnits = fixedCosts / (pricePerUnit - variableCostPerUnit);
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;

  const data = useMemo(() => {
    const points = [];
    const step = maxUnits / 20;
    for (let units = 0; units <= maxUnits; units += step) {
      const revenue = units * pricePerUnit;
      const totalCosts = fixedCosts + units * variableCostPerUnit;
      const profit = revenue - totalCosts;
      points.push({
        units: Math.round(units),
        revenue,
        totalCosts,
        fixedCosts,
        profit,
      });
    }
    return points;
  }, [fixedCosts, variableCostPerUnit, pricePerUnit, maxUnits]);

  const formatValue = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="units"
            stroke="#666"
            tick={{ fill: "#999", fontSize: 11 }}
            label={{ value: "Units", position: "bottom", fill: "#666", fontSize: 11 }}
          />
          <YAxis
            stroke="#666"
            tick={{ fill: "#999", fontSize: 11 }}
            tickFormatter={formatValue}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
                  <p className="text-zinc-400 text-xs">{d.units.toLocaleString()} units</p>
                  <p className="text-blue-400 text-sm">Revenue: {formatValue(d.revenue)}</p>
                  <p className="text-red-400 text-sm">Total Costs: {formatValue(d.totalCosts)}</p>
                  <p className={`text-sm font-bold ${d.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    Profit: {formatValue(d.profit)}
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine x={breakEvenUnits} stroke="#FBBF24" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Revenue" />
          <Line type="monotone" dataKey="totalCosts" stroke="#ef4444" strokeWidth={2} dot={false} name="Total Costs" />
          <Area type="monotone" dataKey="fixedCosts" fill="#ef4444" fillOpacity={0.1} stroke="none" />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Break-even metrics */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-xs text-zinc-500">Break-even Units</p>
          <p className="text-lg font-bold text-amber-400">{Math.round(breakEvenUnits).toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-xs text-zinc-500">Break-even Revenue</p>
          <p className="text-lg font-bold text-blue-400">{formatValue(breakEvenRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-xs text-zinc-500">Contribution Margin</p>
          <p className="text-lg font-bold text-green-400">
            {formatValue(pricePerUnit - variableCostPerUnit)}/unit
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TREEMAP CHART (Cost Structure)
// =============================================================================

interface TreemapItem {
  name: string;
  value: number;
  category?: string;
}

interface TreemapChartProps {
  data: TreemapItem[];
  currency?: string;
}

export function TreemapChart({ data, currency = "USD" }: TreemapChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const colors = [
    "bg-amber-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
    "bg-pink-500", "bg-cyan-500", "bg-orange-500", "bg-indigo-500",
  ];

  const formatValue = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {sortedData.map((item, idx) => {
          const percentage = (item.value / total) * 100;
          const width = Math.max(percentage, 8); // Minimum 8% width for visibility

          return (
            <div
              key={item.name}
              className={`${colors[idx % colors.length]} rounded-lg p-3 text-white cursor-pointer
                hover:opacity-80 transition-opacity relative overflow-hidden group`}
              style={{ width: `${width}%`, minWidth: "80px" }}
            >
              <p className="text-xs font-medium truncate">{item.name}</p>
              <p className="text-sm font-bold">{formatValue(item.value)}</p>
              <p className="text-[10px] opacity-75">{percentage.toFixed(1)}%</p>

              {/* Hover tooltip */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100
                transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs">{item.name}</p>
                  <p className="text-lg font-bold">{formatValue(item.value)}</p>
                  <p className="text-xs opacity-75">{percentage.toFixed(1)}% of total</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-right text-sm text-zinc-500">
        Total: {formatValue(total)}
      </div>
    </div>
  );
}

// =============================================================================
// TORNADO CHART (Sensitivity)
// =============================================================================

interface TornadoItem {
  name: string;
  lowValue: number;
  highValue: number;
  baseValue: number;
}

interface TornadoChartProps {
  data: TornadoItem[];
  currency?: string;
}

export function TornadoChart({ data, currency = "USD" }: TornadoChartProps) {
  const sortedData = [...data].sort((a, b) =>
    Math.abs(b.highValue - b.lowValue) - Math.abs(a.highValue - a.lowValue)
  );

  const allValues = sortedData.flatMap(d => [d.lowValue, d.highValue]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  const getPosition = (value: number) => ((value - minValue) / range) * 100;

  return (
    <div className="space-y-3">
      {sortedData.map((item) => {
        const basePos = getPosition(item.baseValue);
        const lowPos = getPosition(item.lowValue);
        const highPos = getPosition(item.highValue);

        return (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-32 text-right text-xs text-zinc-400 truncate">{item.name}</div>
            <div className="flex-1 relative h-6">
              {/* Background */}
              <div className="absolute inset-0 bg-zinc-800 rounded" />

              {/* Base line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                style={{ left: `${basePos}%` }}
              />

              {/* Low bar (red) */}
              <div
                className="absolute top-1 bottom-1 bg-red-500/80 rounded-l"
                style={{
                  left: `${lowPos}%`,
                  width: `${basePos - lowPos}%`,
                }}
              />

              {/* High bar (green) */}
              <div
                className="absolute top-1 bottom-1 bg-green-500/80 rounded-r"
                style={{
                  left: `${basePos}%`,
                  width: `${highPos - basePos}%`,
                }}
              />
            </div>
            <div className="w-24 flex justify-between text-[10px] font-mono">
              <span className="text-red-400">{formatValue(item.lowValue)}</span>
              <span className="text-green-400">{formatValue(item.highValue)}</span>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-zinc-500">Downside</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-0.5 h-3 bg-white/50" />
          <span className="text-zinc-500">Base</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-zinc-500">Upside</span>
        </div>
      </div>
    </div>
  );
}
