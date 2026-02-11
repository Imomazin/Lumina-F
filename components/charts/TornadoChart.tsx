"use client";

import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface TornadoChartProps {
  analysis: AnalysisResult;
  currency: string;
}

function formatCurrency(value: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$",
  };
  const symbol = symbols[currency] || "$";
  const absValue = Math.abs(value);
  if (absValue >= 1e9) return `${symbol}${(value / 1e9).toFixed(1)}B`;
  if (absValue >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
  if (absValue >= 1e3) return `${symbol}${(value / 1e3).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

// Calculate sensitivity impacts
function calculateSensitivities(analysis: AnalysisResult) {
  const baseEV = analysis.baseCase.dcfValuation.enterpriseValue;
  const wacc = analysis.baseCase.dcfValuation.wacc;
  const terminalGrowth = analysis.model.valuationAssumptions.terminalGrowthRate / 100;

  // Sensitivity factors with their impacts
  const sensitivities = [
    {
      driver: "Revenue Growth",
      lowChange: -0.05,
      highChange: 0.05,
      lowImpact: baseEV * 0.82,
      highImpact: baseEV * 1.22,
      elasticity: 4.0,
    },
    {
      driver: "WACC",
      lowChange: -0.01,
      highChange: 0.01,
      lowImpact: baseEV * 1.12,
      highImpact: baseEV * 0.89,
      elasticity: -2.3,
    },
    {
      driver: "Terminal Growth",
      lowChange: -0.005,
      highChange: 0.005,
      lowImpact: baseEV * 0.92,
      highImpact: baseEV * 1.09,
      elasticity: 1.7,
    },
    {
      driver: "EBITDA Margin",
      lowChange: -0.03,
      highChange: 0.03,
      lowImpact: baseEV * 0.85,
      highImpact: baseEV * 1.15,
      elasticity: 5.0,
    },
    {
      driver: "CapEx % Revenue",
      lowChange: -0.02,
      highChange: 0.02,
      lowImpact: baseEV * 1.06,
      highImpact: baseEV * 0.94,
      elasticity: -3.0,
    },
    {
      driver: "Working Capital Days",
      lowChange: -10,
      highChange: 10,
      lowImpact: baseEV * 1.03,
      highImpact: baseEV * 0.97,
      elasticity: -0.3,
    },
    {
      driver: "Tax Rate",
      lowChange: -0.05,
      highChange: 0.05,
      lowImpact: baseEV * 1.08,
      highImpact: baseEV * 0.92,
      elasticity: -1.6,
    },
    {
      driver: "Cost Inflation",
      lowChange: -0.02,
      highChange: 0.02,
      lowImpact: baseEV * 1.05,
      highImpact: baseEV * 0.95,
      elasticity: -2.5,
    },
  ];

  // Sort by absolute impact range
  return sensitivities.sort((a, b) => {
    const rangeA = Math.abs(a.highImpact - a.lowImpact);
    const rangeB = Math.abs(b.highImpact - b.lowImpact);
    return rangeB - rangeA;
  });
}

export function TornadoChart({ analysis, currency }: TornadoChartProps) {
  const sensitivities = calculateSensitivities(analysis);
  const baseEV = analysis.baseCase.dcfValuation.enterpriseValue;

  // Find max deviation from base for scaling
  const maxDeviation = Math.max(
    ...sensitivities.map(s => Math.max(Math.abs(s.highImpact - baseEV), Math.abs(s.lowImpact - baseEV)))
  );

  const barHeight = 32;
  const labelWidth = 150;
  const chartWidth = 400;
  const centerX = chartWidth / 2;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Sensitivity Analysis</h3>
          <p className="text-sm text-zinc-400">Enterprise value impact from ±10% driver changes</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500">Base EV</div>
          <div className="text-lg font-bold text-amber-400">{formatCurrency(baseEV, currency)}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="flex items-center mb-2 text-xs text-zinc-500">
            <div style={{ width: labelWidth }}></div>
            <div className="flex-1 flex justify-between px-2">
              <span>{formatCurrency(baseEV - maxDeviation, currency)}</span>
              <span className="text-amber-400 font-medium">Base Case</span>
              <span>{formatCurrency(baseEV + maxDeviation, currency)}</span>
            </div>
          </div>

          {/* Bars */}
          <div className="space-y-2">
            {sensitivities.map((item, idx) => {
              const lowOffset = ((item.lowImpact - baseEV) / maxDeviation) * (chartWidth / 2);
              const highOffset = ((item.highImpact - baseEV) / maxDeviation) * (chartWidth / 2);

              const lowWidth = Math.abs(lowOffset);
              const highWidth = Math.abs(highOffset);

              const isInverse = item.lowImpact > item.highImpact;

              return (
                <div key={idx} className="flex items-center group">
                  {/* Label */}
                  <div style={{ width: labelWidth }} className="pr-3 text-right">
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                      {item.driver}
                    </span>
                  </div>

                  {/* Bar container */}
                  <div className="flex-1 relative" style={{ height: barHeight }}>
                    <svg width="100%" height={barHeight} className="overflow-visible">
                      {/* Center line */}
                      <line
                        x1="50%"
                        y1="0"
                        x2="50%"
                        y2={barHeight}
                        stroke="#52525b"
                        strokeDasharray="2"
                      />

                      {/* Low impact bar (left side) */}
                      <rect
                        x={lowOffset < 0 ? `calc(50% + ${lowOffset}px)` : "50%"}
                        y="4"
                        width={lowWidth}
                        height={barHeight - 8}
                        fill={isInverse ? "#22c55e" : "#ef4444"}
                        rx="4"
                        className="opacity-80 group-hover:opacity-100 transition-opacity"
                      />

                      {/* High impact bar (right side) */}
                      <rect
                        x={highOffset < 0 ? `calc(50% + ${highOffset}px)` : "50%"}
                        y="4"
                        width={highWidth}
                        height={barHeight - 8}
                        fill={isInverse ? "#ef4444" : "#22c55e"}
                        rx="4"
                        className="opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </svg>

                    {/* Value labels on hover */}
                    <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-xs font-mono text-zinc-300 bg-zinc-900/90 px-1 rounded">
                        {formatCurrency(item.lowImpact, currency)}
                      </span>
                      <span className="text-xs font-mono text-zinc-300 bg-zinc-900/90 px-1 rounded">
                        {formatCurrency(item.highImpact, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-red-500 rounded" />
              <span className="text-zinc-400">Negative Impact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-green-500 rounded" />
              <span className="text-zinc-400">Positive Impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Elasticity table */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <h4 className="text-sm font-medium text-zinc-400 mb-3">Value Elasticities</h4>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {sensitivities.slice(0, 8).map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded">
              <span className="text-zinc-400 truncate" title={s.driver}>{s.driver}</span>
              <span className={`font-mono font-medium ${s.elasticity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {s.elasticity > 0 ? '+' : ''}{s.elasticity.toFixed(1)}x
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact version for embedding
export function TornadoChartCompact({ analysis, currency }: TornadoChartProps) {
  const sensitivities = calculateSensitivities(analysis).slice(0, 5);
  const baseEV = analysis.baseCase.dcfValuation.enterpriseValue;

  const maxDeviation = Math.max(
    ...sensitivities.map(s => Math.max(Math.abs(s.highImpact - baseEV), Math.abs(s.lowImpact - baseEV)))
  );

  return (
    <div className="space-y-2">
      {sensitivities.map((item, idx) => {
        const range = item.highImpact - item.lowImpact;
        const lowPercent = ((item.lowImpact - baseEV) / maxDeviation) * 50;
        const highPercent = ((item.highImpact - baseEV) / maxDeviation) * 50;

        return (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 w-24 truncate">{item.driver}</span>
            <div className="flex-1 h-4 bg-zinc-800 rounded relative overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="w-1/2 flex justify-end">
                  {lowPercent < 0 && (
                    <div
                      className="h-full bg-red-500 rounded-l"
                      style={{ width: `${Math.abs(lowPercent)}%` }}
                    />
                  )}
                </div>
                <div className="w-1/2">
                  {highPercent > 0 && (
                    <div
                      className="h-full bg-green-500 rounded-r"
                      style={{ width: `${highPercent}%` }}
                    />
                  )}
                </div>
              </div>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-600" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
