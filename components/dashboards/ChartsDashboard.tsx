"use client";

import { useState } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface ChartsDashboardProps {
  analysis: AnalysisResult;
  currency: string;
}

// Bar Chart Component
function BarChart({
  data,
  labels,
  colors = ["#f59e0b", "#22c55e", "#3b82f6", "#a855f7"],
  height = 200,
  showValues = true,
  formatValue = (v: number) => v.toFixed(0),
  title,
}: {
  data: number[][];
  labels: string[];
  colors?: string[];
  height?: number;
  showValues?: boolean;
  formatValue?: (v: number) => string;
  title?: string;
}) {
  const [hoveredBar, setHoveredBar] = useState<{ series: number; index: number } | null>(null);

  const maxValue = Math.max(...data.flat());
  const barWidth = 100 / (labels.length * (data.length + 0.5));
  const groupWidth = barWidth * data.length;

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-zinc-400 mb-3">{title}</h4>}
      <div className="relative" style={{ height }}>
        <svg width="100%" height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <g key={i}>
              <line
                x1="0"
                y1={height - tick * (height - 20)}
                x2="100%"
                y2={height - tick * (height - 20)}
                stroke="#27272a"
                strokeDasharray="4 4"
              />
              <text
                x="-5"
                y={height - tick * (height - 20)}
                fill="#71717a"
                fontSize="10"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatValue(maxValue * tick)}
              </text>
            </g>
          ))}

          {/* Bars */}
          {labels.map((label, labelIdx) => (
            <g key={labelIdx}>
              {data.map((series, seriesIdx) => {
                const value = series[labelIdx];
                const barHeight = (value / maxValue) * (height - 30);
                const x = `${labelIdx * (groupWidth + barWidth * 0.5) + seriesIdx * barWidth + 5}%`;
                const isHovered = hoveredBar?.series === seriesIdx && hoveredBar?.index === labelIdx;

                return (
                  <g key={seriesIdx}>
                    <rect
                      x={x}
                      y={height - 20 - barHeight}
                      width={`${barWidth - 1}%`}
                      height={barHeight}
                      fill={colors[seriesIdx % colors.length]}
                      rx="4"
                      opacity={isHovered ? 1 : 0.8}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredBar({ series: seriesIdx, index: labelIdx })}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{ filter: isHovered ? `drop-shadow(0 4px 8px ${colors[seriesIdx]}40)` : 'none' }}
                    />
                    {showValues && isHovered && (
                      <text
                        x={`${labelIdx * (groupWidth + barWidth * 0.5) + seriesIdx * barWidth + barWidth / 2 + 5}%`}
                        y={height - 25 - barHeight}
                        fill="white"
                        fontSize="11"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {formatValue(value)}
                      </text>
                    )}
                  </g>
                );
              })}
              <text
                x={`${labelIdx * (groupWidth + barWidth * 0.5) + groupWidth / 2 + 5}%`}
                y={height - 5}
                fill="#a1a1aa"
                fontSize="11"
                textAnchor="middle"
              >
                {label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// Area Chart Component
function AreaChart({
  data,
  labels,
  colors = ["#f59e0b"],
  height = 200,
  title,
  formatValue = (v: number) => v.toFixed(0),
  showDots = true,
}: {
  data: number[][];
  labels: string[];
  colors?: string[];
  height?: number;
  title?: string;
  formatValue?: (v: number) => string;
  showDots?: boolean;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{ series: number; index: number } | null>(null);

  const allValues = data.flat();
  const minValue = Math.min(...allValues) * 0.9;
  const maxValue = Math.max(...allValues) * 1.1;
  const range = maxValue - minValue;

  const getPath = (series: number[]) => {
    const points = series.map((value, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = height - 25 - ((value - minValue) / range) * (height - 45);
      return { x, y };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${100} ${height - 25} L 0 ${height - 25} Z`;

    return { linePath, areaPath, points };
  };

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-zinc-400 mb-3">{title}</h4>}
      <div className="relative" style={{ height }}>
        <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="overflow-visible">
          <defs>
            {colors.map((color, i) => (
              <linearGradient key={i} id={`area-gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <line
              key={i}
              x1="0"
              y1={height - 25 - tick * (height - 45)}
              x2="100"
              y2={height - 25 - tick * (height - 45)}
              stroke="#27272a"
              strokeWidth="0.5"
            />
          ))}

          {/* Areas and Lines */}
          {data.map((series, seriesIdx) => {
            const { linePath, areaPath, points } = getPath(series);
            return (
              <g key={seriesIdx}>
                <path
                  d={areaPath}
                  fill={`url(#area-gradient-${seriesIdx})`}
                  className="transition-all duration-300"
                />
                <path
                  d={linePath}
                  fill="none"
                  stroke={colors[seriesIdx]}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  className="transition-all duration-300"
                />
                {showDots && points.map((point, pointIdx) => (
                  <circle
                    key={pointIdx}
                    cx={point.x}
                    cy={point.y}
                    r={hoveredPoint?.series === seriesIdx && hoveredPoint?.index === pointIdx ? 5 : 3}
                    fill={colors[seriesIdx]}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredPoint({ series: seriesIdx, index: pointIdx })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ filter: hoveredPoint?.series === seriesIdx && hoveredPoint?.index === pointIdx ? `drop-shadow(0 0 6px ${colors[seriesIdx]})` : 'none' }}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-0">
          {labels.map((label, i) => (
            <span key={i} className="text-xs text-zinc-500">{label}</span>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl pointer-events-none z-10"
            style={{
              left: `${(hoveredPoint.index / (data[0].length - 1)) * 100}%`,
              top: `${height - 25 - ((data[hoveredPoint.series][hoveredPoint.index] - minValue) / range) * (height - 45) - 50}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-zinc-400 text-xs">{labels[hoveredPoint.index]}</p>
            <p className="font-bold" style={{ color: colors[hoveredPoint.series] }}>
              {formatValue(data[hoveredPoint.series][hoveredPoint.index])}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Donut Chart Component
function DonutChart({
  data,
  labels,
  colors = ["#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ef4444"],
  size = 200,
  title,
}: {
  data: number[];
  labels: string[];
  colors?: string[];
  size?: number;
  title?: string;
}) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const total = data.reduce((a, b) => a + b, 0);
  const radius = size / 2 - 20;
  const innerRadius = radius * 0.6;

  let currentAngle = -90;

  const segments = data.map((value, index) => {
    const percentage = value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = size / 2 + radius * Math.cos(startRad);
    const y1 = size / 2 + radius * Math.sin(startRad);
    const x2 = size / 2 + radius * Math.cos(endRad);
    const y2 = size / 2 + radius * Math.sin(endRad);

    const ix1 = size / 2 + innerRadius * Math.cos(startRad);
    const iy1 = size / 2 + innerRadius * Math.sin(startRad);
    const ix2 = size / 2 + innerRadius * Math.cos(endRad);
    const iy2 = size / 2 + innerRadius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${ix2} ${iy2}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}
      Z
    `;

    return { path, percentage, color: colors[index % colors.length], label: labels[index] };
  });

  return (
    <div className="flex flex-col items-center">
      {title && <h4 className="text-sm font-medium text-zinc-400 mb-3">{title}</h4>}
      <div className="relative">
        <svg width={size} height={size}>
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              opacity={hoveredSegment === null || hoveredSegment === index ? 1 : 0.5}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
              style={{
                transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: 'center',
                filter: hoveredSegment === index ? `drop-shadow(0 4px 8px ${segment.color}60)` : 'none',
              }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {hoveredSegment !== null ? (
              <>
                <p className="text-2xl font-bold text-white">
                  {(segments[hoveredSegment].percentage * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-zinc-400">{segments[hoveredSegment].label}</p>
              </>
            ) : (
              <p className="text-lg font-medium text-zinc-400">Hover to see</p>
            )}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }}></div>
            <span className="text-xs text-zinc-400">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Waterfall Chart Component
function WaterfallChart({
  data,
  labels,
  height = 220,
  formatValue = (v: number) => v.toFixed(0),
  title,
}: {
  data: { value: number; isTotal?: boolean }[];
  labels: string[];
  height?: number;
  formatValue?: (v: number) => string;
  title?: string;
}) {
  let cumulative = 0;
  const processedData = data.map((item, index) => {
    if (item.isTotal) {
      const total = cumulative;
      cumulative = item.value;
      return { ...item, start: 0, end: item.value, cumulative: total };
    }
    const start = cumulative;
    cumulative += item.value;
    return { ...item, start, end: cumulative, cumulative };
  });

  const allValues = processedData.flatMap(d => [d.start, d.end]);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;

  const barWidth = 80 / labels.length;

  const getY = (value: number) => height - 30 - ((value - minValue) / range) * (height - 50);

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-zinc-400 mb-3">{title}</h4>}
      <svg width="100%" height={height} className="overflow-visible">
        {/* Zero line */}
        <line
          x1="5%"
          y1={getY(0)}
          x2="95%"
          y2={getY(0)}
          stroke="#52525b"
          strokeWidth="1"
        />

        {processedData.map((item, index) => {
          const x = 10 + index * (barWidth + 2);
          const y1 = getY(item.start);
          const y2 = getY(item.end);
          const barHeight = Math.abs(y1 - y2);
          const isPositive = item.value >= 0 || item.isTotal;

          return (
            <g key={index}>
              {/* Connector line */}
              {index > 0 && !item.isTotal && (
                <line
                  x1={`${x - 2}%`}
                  y1={getY(processedData[index - 1].end)}
                  x2={`${x}%`}
                  y2={getY(processedData[index - 1].end)}
                  stroke="#52525b"
                  strokeDasharray="3 3"
                />
              )}
              {/* Bar */}
              <rect
                x={`${x}%`}
                y={Math.min(y1, y2)}
                width={`${barWidth}%`}
                height={barHeight || 2}
                fill={item.isTotal ? "#3b82f6" : isPositive ? "#22c55e" : "#ef4444"}
                rx="3"
                className="transition-all duration-200"
              />
              {/* Value */}
              <text
                x={`${x + barWidth / 2}%`}
                y={Math.min(y1, y2) - 5}
                fill="#a1a1aa"
                fontSize="10"
                textAnchor="middle"
              >
                {item.isTotal ? formatValue(item.value) : (item.value >= 0 ? '+' : '') + formatValue(item.value)}
              </text>
              {/* Label */}
              <text
                x={`${x + barWidth / 2}%`}
                y={height - 10}
                fill="#71717a"
                fontSize="9"
                textAnchor="middle"
              >
                {labels[index]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ChartsDashboard({ analysis, currency }: ChartsDashboardProps) {
  const { baseCase, scenarios } = analysis;
  const { yearlyFinancials, dcfValuation } = baseCase;

  const formatCurrency = (value: number) => {
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };
    const symbol = symbols[currency] || "$";
    if (Math.abs(value) >= 1e9) return `${symbol}${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${symbol}${(value / 1e3).toFixed(0)}K`;
    return `${symbol}${value.toFixed(0)}`;
  };

  const years = yearlyFinancials.map(yf => `${yf.year}`);

  // Financial data for charts
  const revenueData = yearlyFinancials.map(yf => yf.revenue);
  const cogsData = yearlyFinancials.map(yf => yf.costOfGoodsSold);
  const grossProfitData = yearlyFinancials.map(yf => yf.grossProfit);
  const ebitdaData = yearlyFinancials.map(yf => yf.ebitda);
  const netIncomeData = yearlyFinancials.map(yf => yf.netIncome);
  const fcfData = yearlyFinancials.map(yf => yf.freeCashFlow);

  // Waterfall data for income statement
  const latestYear = yearlyFinancials[yearlyFinancials.length - 1];
  const waterfallData = [
    { value: latestYear.revenue, isTotal: true },
    { value: -latestYear.costOfGoodsSold },
    { value: latestYear.grossProfit, isTotal: true },
    { value: -latestYear.operatingExpenses },
    { value: latestYear.ebitda, isTotal: true },
    { value: -(latestYear.depreciation + latestYear.amortization) },
    { value: latestYear.ebit, isTotal: true },
    { value: -latestYear.taxes },
    { value: latestYear.netIncome, isTotal: true },
  ];
  const waterfallLabels = ["Revenue", "COGS", "Gross", "OpEx", "EBITDA", "D&A", "EBIT", "Tax", "Net Inc"];

  // Donut chart data - Revenue breakdown (simulated)
  const revenueBreakdown = [
    latestYear.revenue * 0.45,
    latestYear.revenue * 0.30,
    latestYear.revenue * 0.15,
    latestYear.revenue * 0.10,
  ];
  const revenueLabels = ["Product A", "Product B", "Services", "Other"];

  // DCF Component breakdown
  const dcfBreakdown = [
    dcfValuation.sumPVFCF,
    dcfValuation.terminalValuePV,
  ];
  const dcfLabels = ["PV of FCF", "Terminal Value"];

  return (
    <div className="space-y-6">
      {/* Revenue & Profitability */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <AreaChart
            data={[revenueData, grossProfitData, ebitdaData]}
            labels={years}
            colors={["#22c55e", "#3b82f6", "#f59e0b"]}
            height={220}
            title="Revenue, Gross Profit & EBITDA Trend"
            formatValue={formatCurrency}
          />
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-zinc-400">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-zinc-400">Gross Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-zinc-400">EBITDA</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <BarChart
            data={[fcfData, netIncomeData]}
            labels={years}
            colors={["#a855f7", "#06b6d4"]}
            height={220}
            title="Free Cash Flow vs Net Income"
            formatValue={formatCurrency}
          />
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs text-zinc-400">Free Cash Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-xs text-zinc-400">Net Income</span>
            </div>
          </div>
        </div>
      </div>

      {/* Waterfall & Donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <WaterfallChart
            data={waterfallData}
            labels={waterfallLabels}
            height={250}
            formatValue={formatCurrency}
            title={`Income Statement Waterfall (${latestYear.year})`}
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <DonutChart
            data={dcfBreakdown}
            labels={dcfLabels}
            colors={["#3b82f6", "#f59e0b"]}
            size={180}
            title="Enterprise Value Composition"
          />
        </div>
      </div>

      {/* Margin Analysis */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-4">Margin Analysis Over Time</h4>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Gross Margin", data: yearlyFinancials.map(yf => yf.grossMargin * 100), color: "#22c55e" },
            { label: "EBITDA Margin", data: yearlyFinancials.map(yf => yf.ebitdaMargin * 100), color: "#3b82f6" },
            { label: "EBIT Margin", data: yearlyFinancials.map(yf => yf.ebitMargin * 100), color: "#f59e0b" },
            { label: "Net Margin", data: yearlyFinancials.map(yf => yf.netMargin * 100), color: "#a855f7" },
          ].map((margin, idx) => (
            <div key={idx} className="text-center">
              <p className="text-xs text-zinc-500 mb-2">{margin.label}</p>
              <div className="flex items-end justify-center gap-1 h-16">
                {margin.data.map((value, i) => (
                  <div
                    key={i}
                    className="w-4 rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${Math.max(value * 2, 4)}px`,
                      backgroundColor: margin.color,
                    }}
                  ></div>
                ))}
              </div>
              <p className="mt-2 text-lg font-bold" style={{ color: margin.color }}>
                {margin.data[margin.data.length - 1].toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Comparison Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-4">Scenario Comparison</h4>
        <div className="grid gap-4 md:grid-cols-3">
          {scenarios.slice(0, 3).map((scenario, idx) => {
            const colors = ["#22c55e", "#f59e0b", "#ef4444"];
            const revenueProjection = scenario.yearlyFinancials.map(yf => yf.revenue);

            return (
              <div key={scenario.scenarioId} className="p-4 rounded-lg bg-zinc-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx] }}></div>
                  <span className="text-sm font-medium text-white">{scenario.scenarioName}</span>
                </div>
                <AreaChart
                  data={[revenueProjection]}
                  labels={scenario.yearlyFinancials.map(yf => `${yf.year}`)}
                  colors={[colors[idx]]}
                  height={100}
                  formatValue={formatCurrency}
                  showDots={false}
                />
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-zinc-500">EV</p>
                    <p className="font-medium" style={{ color: colors[idx] }}>
                      {formatCurrency(scenario.dcfValuation.enterpriseValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">IRR</p>
                    <p className="font-medium" style={{ color: colors[idx] }}>
                      {(scenario.irr * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
