"use client";

import { useState } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface RiskDashboardProps {
  analysis: AnalysisResult;
  currency: string;
}

// Risk Heatmap Cell
function HeatmapCell({
  value,
  min,
  max,
  label,
  formatValue = (v: number) => v.toFixed(1),
  inverse = false,
}: {
  value: number;
  min: number;
  max: number;
  label?: string;
  formatValue?: (v: number) => string;
  inverse?: boolean;
}) {
  const normalized = (value - min) / (max - min);
  const intensity = inverse ? 1 - normalized : normalized;

  // Color gradient from red to yellow to green
  const getColor = (i: number) => {
    if (i < 0.33) return { bg: "bg-red-500/70", text: "text-red-100" };
    if (i < 0.66) return { bg: "bg-amber-500/70", text: "text-amber-100" };
    return { bg: "bg-green-500/70", text: "text-green-100" };
  };

  const colors = getColor(intensity);

  return (
    <div className={`${colors.bg} rounded-lg p-3 text-center transition-all hover:scale-105`}>
      <p className={`text-lg font-bold ${colors.text}`}>{formatValue(value)}</p>
      {label && <p className="text-xs text-white/70 mt-1">{label}</p>}
    </div>
  );
}

// Risk Meter Component
function RiskMeter({
  value,
  max,
  thresholds = [33, 66],
  labels = ["Low", "Medium", "High"],
  title,
}: {
  value: number;
  max: number;
  thresholds?: number[];
  labels?: string[];
  title?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const getRiskLevel = () => {
    if (percentage < thresholds[0]) return { level: 0, color: "green" };
    if (percentage < thresholds[1]) return { level: 1, color: "amber" };
    return { level: 2, color: "red" };
  };

  const risk = getRiskLevel();
  const colors: Record<string, { fill: string; text: string }> = {
    green: { fill: "#22c55e", text: "text-green-500" },
    amber: { fill: "#f59e0b", text: "text-amber-500" },
    red: { fill: "#ef4444", text: "text-red-500" },
  };

  return (
    <div className="w-full">
      {title && <p className="text-sm text-zinc-400 mb-2">{title}</p>}
      <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-green-500/20"></div>
          <div className="flex-1 bg-amber-500/20"></div>
          <div className="flex-1 bg-red-500/20"></div>
        </div>
        {/* Value indicator */}
        <div
          className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            backgroundColor: colors[risk.color].fill,
            boxShadow: `0 0 10px ${colors[risk.color].fill}80`,
          }}
        ></div>
        {/* Needle */}
        <div
          className="absolute top-0 w-1 h-full bg-white rounded-full shadow-lg transition-all duration-700"
          style={{ left: `calc(${percentage}% - 2px)` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2">
        {labels.map((label, i) => (
          <span
            key={i}
            className={`text-xs ${risk.level === i ? colors[i === 0 ? 'green' : i === 1 ? 'amber' : 'red'].text + ' font-bold' : 'text-zinc-500'}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Sensitivity Matrix
function SensitivityMatrix({
  matrix,
  rowLabels,
  colLabels,
  formatValue = (v: number) => v.toFixed(1),
  title,
  currency,
}: {
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  formatValue?: (v: number) => string;
  title?: string;
  currency?: string;
}) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const allValues = matrix.flat();
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const baseRow = Math.floor(rowLabels.length / 2);
  const baseCol = Math.floor(colLabels.length / 2);

  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    if (normalized < 0.25) return "bg-red-600";
    if (normalized < 0.4) return "bg-red-500/80";
    if (normalized < 0.5) return "bg-amber-500/80";
    if (normalized < 0.6) return "bg-amber-400/80";
    if (normalized < 0.75) return "bg-green-500/80";
    return "bg-green-600";
  };

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium text-zinc-400 mb-3">{title}</h4>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs text-zinc-500 text-left">WACC \ Growth</th>
              {colLabels.map((label, i) => (
                <th
                  key={i}
                  className={`p-2 text-xs font-medium ${i === baseCol ? 'text-amber-400' : 'text-zinc-400'}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className={`p-2 text-xs font-medium ${rowIdx === baseRow ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {rowLabels[rowIdx]}
                </td>
                {row.map((value, colIdx) => {
                  const isBase = rowIdx === baseRow && colIdx === baseCol;
                  const isHovered = hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;

                  return (
                    <td
                      key={colIdx}
                      className={`p-0`}
                      onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div
                        className={`
                          m-0.5 p-2 rounded text-center text-xs font-mono cursor-pointer
                          transition-all duration-200
                          ${getColor(value)}
                          ${isBase ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-zinc-900' : ''}
                          ${isHovered ? 'scale-110 shadow-lg z-10 relative' : ''}
                        `}
                      >
                        <span className="text-white font-medium">
                          {formatValue(value)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600"></div>
          <span className="text-xs text-zinc-500">Lower</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500"></div>
          <span className="text-xs text-zinc-500">Base</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-600"></div>
          <span className="text-xs text-zinc-500">Higher</span>
        </div>
      </div>
    </div>
  );
}

// Risk Factor Card
function RiskFactorCard({
  title,
  description,
  severity,
  impact,
  probability,
  mitigation,
}: {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  impact: number;
  probability: number;
  mitigation?: string;
}) {
  const severityColors = {
    low: { bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-400", badge: "bg-green-500" },
    medium: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500" },
    high: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500" },
  };

  const c = severityColors[severity];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-white">{title}</h4>
        <span className={`${c.badge} text-xs px-2 py-0.5 rounded-full text-white font-medium`}>
          {severity.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-zinc-400 mb-4">{description}</p>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Impact</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${c.badge} rounded-full transition-all`}
              style={{ width: `${impact}%` }}
            ></div>
          </div>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Probability</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${c.badge} rounded-full transition-all`}
              style={{ width: `${probability}%` }}
            ></div>
          </div>
        </div>
      </div>
      {mitigation && (
        <div className="pt-3 border-t border-zinc-700/50">
          <p className="text-xs text-zinc-500">Mitigation</p>
          <p className="text-sm text-zinc-300 mt-1">{mitigation}</p>
        </div>
      )}
    </div>
  );
}

export function RiskDashboard({ analysis, currency }: RiskDashboardProps) {
  const { baseCase, scenarios, riskMetrics, executiveSummary } = analysis;
  const { dcfValuation, averageRatios } = baseCase;

  const formatCurrency = (value: number) => {
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };
    const symbol = symbols[currency] || "$";
    if (Math.abs(value) >= 1e9) return `${symbol}${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
    return `${symbol}${value.toFixed(0)}`;
  };

  // Generate sensitivity labels
  const waccLabels = dcfValuation.sensitivityWACC.map(w => `${(w * 100).toFixed(1)}%`);
  const growthLabels = dcfValuation.sensitivityGrowth.map(g => `${(g * 100).toFixed(1)}%`);

  // Risk factors based on analysis
  const riskFactors: Array<{
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
    impact: number;
    probability: number;
    mitigation: string;
  }> = [
    {
      title: "Market Risk",
      description: "Exposure to market fluctuations and economic cycles affecting revenue growth.",
      severity: riskMetrics.volatility > 0.25 ? "high" : riskMetrics.volatility > 0.15 ? "medium" : "low",
      impact: Math.min(riskMetrics.volatility * 200, 100),
      probability: 60,
      mitigation: "Diversify revenue streams and maintain flexible cost structure.",
    },
    {
      title: "Leverage Risk",
      description: "Risk from debt levels relative to earnings and assets.",
      severity: averageRatios.debtToEbitda > 4 ? "high" : averageRatios.debtToEbitda > 2.5 ? "medium" : "low",
      impact: Math.min(averageRatios.debtToEbitda * 15, 100),
      probability: averageRatios.debtToEbitda > 3 ? 70 : 40,
      mitigation: "Focus on debt reduction and maintain healthy coverage ratios.",
    },
    {
      title: "Liquidity Risk",
      description: "Ability to meet short-term obligations and fund operations.",
      severity: averageRatios.currentRatio < 1 ? "high" : averageRatios.currentRatio < 1.5 ? "medium" : "low",
      impact: averageRatios.currentRatio < 1 ? 85 : averageRatios.currentRatio < 1.5 ? 50 : 25,
      probability: averageRatios.currentRatio < 1.2 ? 60 : 30,
      mitigation: "Improve working capital management and maintain cash reserves.",
    },
    {
      title: "Margin Compression",
      description: "Risk of declining profitability from competitive pressure or cost inflation.",
      severity: averageRatios.ebitdaMargin < 0.1 ? "high" : averageRatios.ebitdaMargin < 0.15 ? "medium" : "low",
      impact: 100 - averageRatios.ebitdaMargin * 200,
      probability: 50,
      mitigation: "Implement pricing optimization and operational efficiency programs.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400 mb-2">Volatility Score</p>
          <p className="text-3xl font-bold text-amber-500">{(riskMetrics.volatility * 100).toFixed(1)}%</p>
          <RiskMeter
            value={riskMetrics.volatility * 100}
            max={50}
            thresholds={[15, 30]}
            labels={["Low", "Moderate", "High"]}
          />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400 mb-2">Max Drawdown</p>
          <p className="text-3xl font-bold text-red-500">{(riskMetrics.maxDrawdown * 100).toFixed(1)}%</p>
          <RiskMeter
            value={riskMetrics.maxDrawdown * 100}
            max={60}
            thresholds={[20, 40]}
            labels={["Limited", "Moderate", "Severe"]}
          />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400 mb-2">Interest Coverage</p>
          <p className="text-3xl font-bold text-green-500">{averageRatios.interestCoverage.toFixed(1)}x</p>
          <RiskMeter
            value={Math.min(averageRatios.interestCoverage, 10) * 10}
            max={100}
            thresholds={[30, 60]}
            labels={["Tight", "Adequate", "Strong"]}
          />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-400 mb-2">Debt/EBITDA</p>
          <p className="text-3xl font-bold text-blue-500">{averageRatios.debtToEbitda.toFixed(1)}x</p>
          <RiskMeter
            value={Math.min(averageRatios.debtToEbitda, 6) * 16.67}
            max={100}
            thresholds={[33, 66]}
            labels={["Low", "Moderate", "High"]}
          />
        </div>
      </div>

      {/* Sensitivity Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <SensitivityMatrix
            matrix={dcfValuation.sensitivityMatrix}
            rowLabels={waccLabels}
            colLabels={growthLabels}
            formatValue={formatCurrency}
            title="Enterprise Value Sensitivity (WACC vs Terminal Growth)"
            currency={currency}
          />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h4 className="text-sm font-medium text-zinc-400 mb-4">Scenario Risk Distribution</h4>
          <div className="space-y-4">
            {scenarios.map((scenario, idx) => {
              const colors = ["#22c55e", "#f59e0b", "#ef4444"];
              const evDiff = ((scenario.dcfValuation.enterpriseValue - dcfValuation.enterpriseValue) / dcfValuation.enterpriseValue) * 100;

              return (
                <div key={scenario.scenarioId} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-zinc-400">{scenario.scenarioName}</div>
                  <div className="flex-1 relative">
                    <div className="h-8 bg-zinc-800 rounded-lg overflow-hidden relative">
                      {/* Base line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-600 z-10"></div>
                      {/* Value bar */}
                      <div
                        className="absolute top-1 bottom-1 rounded transition-all duration-500"
                        style={{
                          left: evDiff >= 0 ? '50%' : `${50 + evDiff / 2}%`,
                          width: `${Math.abs(evDiff) / 2}%`,
                          backgroundColor: colors[idx],
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                      <span>-50%</span>
                      <span>Base</span>
                      <span>+50%</span>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className={`text-sm font-mono ${evDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {evDiff >= 0 ? '+' : ''}{evDiff.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expected Value */}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Probability-Weighted EV</span>
              <span className="text-lg font-bold text-amber-500">
                {formatCurrency(scenarios.reduce((sum, s) => sum + s.dcfValuation.enterpriseValue * (s.probability / 100), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Key Risk Factors</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {riskFactors.map((risk, idx) => (
            <RiskFactorCard key={idx} {...risk} />
          ))}
        </div>
      </div>

      {/* Risk Summary */}
      <div className="rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment Summary</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-amber-400 mb-3">Key Risks</h4>
            <ul className="space-y-2">
              {executiveSummary.risksThreats.slice(0, 4).map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="text-red-500 mt-1">⚠</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-400 mb-3">Mitigating Factors</h4>
            <ul className="space-y-2">
              {executiveSummary.strengthsOpportunities.slice(0, 4).map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="text-green-500 mt-1">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
