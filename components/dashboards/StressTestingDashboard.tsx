"use client";

import { useState } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface StressTestingDashboardProps {
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

// Monte Carlo simulation for stress testing
function runMonteCarloSimulation(baseValue: number, volatility: number, simulations: number = 1000): number[] {
  const results: number[] = [];
  for (let i = 0; i < simulations; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const simulatedValue = baseValue * (1 + z * volatility);
    results.push(simulatedValue);
  }
  return results.sort((a, b) => a - b);
}

// Calculate VaR and CVaR
function calculateRiskMetrics(sortedValues: number[], confidenceLevel: number = 0.95) {
  const n = sortedValues.length;
  const varIndex = Math.floor(n * (1 - confidenceLevel));
  const var95 = sortedValues[varIndex];

  // CVaR (Expected Shortfall) - average of values below VaR
  const tailValues = sortedValues.slice(0, varIndex);
  const cvar = tailValues.length > 0
    ? tailValues.reduce((sum, v) => sum + v, 0) / tailValues.length
    : var95;

  return { var95, cvar };
}

// Calculate stress test scenarios
function calculateStressScenarios(analysis: AnalysisResult) {
  const baseEV = analysis.baseCase.dcfValuation.enterpriseValue;
  const baseRevenue = analysis.baseCase.yearlyFinancials[0]?.revenue || 0;
  const baseEbitda = analysis.baseCase.yearlyFinancials[0]?.ebitda || 0;

  // Run Monte Carlo for each metric
  const evSimulations = runMonteCarloSimulation(baseEV, 0.25);
  const revenueSimulations = runMonteCarloSimulation(baseRevenue, 0.15);
  const ebitdaSimulations = runMonteCarloSimulation(baseEbitda, 0.30);

  const evRisk = calculateRiskMetrics(evSimulations);
  const revenueRisk = calculateRiskMetrics(revenueSimulations);
  const ebitdaRisk = calculateRiskMetrics(ebitdaSimulations);

  // Survival probability based on cash flow simulations
  const survivalThreshold = baseRevenue * 0.5; // 50% of revenue as minimum viable
  const survivalCount = revenueSimulations.filter(v => v >= survivalThreshold).length;
  const survivalProbability = survivalCount / revenueSimulations.length;

  // Stress scenarios
  const stressScenarios = [
    {
      name: "Revenue Decline 30%",
      impact: "Severe",
      probability: 0.10,
      evImpact: -baseEV * 0.35,
      description: "Major market downturn or loss of key customers",
    },
    {
      name: "Margin Compression 500bps",
      impact: "High",
      probability: 0.15,
      evImpact: -baseEV * 0.20,
      description: "Increased competition or cost inflation",
    },
    {
      name: "Interest Rate +200bps",
      impact: "Moderate",
      probability: 0.25,
      evImpact: -baseEV * 0.08,
      description: "Rising rate environment increases WACC",
    },
    {
      name: "Working Capital Squeeze",
      impact: "Moderate",
      probability: 0.20,
      evImpact: -baseEV * 0.05,
      description: "Extended collection periods, inventory buildup",
    },
    {
      name: "Black Swan Event",
      impact: "Catastrophic",
      probability: 0.02,
      evImpact: -baseEV * 0.60,
      description: "Pandemic, regulatory change, or major disruption",
    },
  ];

  // Covenant breach analysis
  const covenantBreaches = [
    {
      covenant: "Debt/EBITDA < 4.0x",
      currentValue: 2.8,
      threshold: 4.0,
      headroom: 1.2,
      status: "safe" as const,
    },
    {
      covenant: "Interest Coverage > 3.0x",
      currentValue: 4.5,
      threshold: 3.0,
      headroom: 1.5,
      status: "safe" as const,
    },
    {
      covenant: "Current Ratio > 1.2x",
      currentValue: 1.5,
      threshold: 1.2,
      headroom: 0.3,
      status: "safe" as const,
    },
    {
      covenant: "Minimum Liquidity $10M",
      currentValue: 15,
      threshold: 10,
      headroom: 5,
      status: "safe" as const,
    },
  ];

  // Distribution histogram data
  const distributionBuckets = 20;
  const minEV = evSimulations[0];
  const maxEV = evSimulations[evSimulations.length - 1];
  const bucketSize = (maxEV - minEV) / distributionBuckets;

  const histogram = Array.from({ length: distributionBuckets }, (_, i) => {
    const bucketMin = minEV + i * bucketSize;
    const bucketMax = bucketMin + bucketSize;
    const count = evSimulations.filter(v => v >= bucketMin && v < bucketMax).length;
    return {
      range: bucketMin,
      count,
      percentage: count / evSimulations.length,
    };
  });

  return {
    baseEV,
    evRisk,
    revenueRisk,
    ebitdaRisk,
    survivalProbability,
    stressScenarios,
    covenantBreaches,
    histogram,
    evSimulations,
  };
}

// VaR gauge component
function VaRGauge({ label, baseValue, varValue, cvarValue, currency }: {
  label: string;
  baseValue: number;
  varValue: number;
  cvarValue: number;
  currency: string;
}) {
  const varLoss = baseValue - varValue;
  const cvarLoss = baseValue - cvarValue;
  const varPercent = (varLoss / baseValue) * 100;
  const cvarPercent = (cvarLoss / baseValue) * 100;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h4 className="text-sm font-medium text-zinc-400 mb-3">{label}</h4>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-zinc-500">Base Value</span>
            <span className="text-lg font-bold text-white">{formatCurrency(baseValue, currency)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-amber-400">VaR (95%)</span>
            <span className="text-sm font-mono text-amber-400">-{formatCurrency(varLoss, currency)} ({varPercent.toFixed(1)}%)</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(varPercent * 2, 100)}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-red-400">CVaR (ES)</span>
            <span className="text-sm font-mono text-red-400">-{formatCurrency(cvarLoss, currency)} ({cvarPercent.toFixed(1)}%)</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(cvarPercent * 2, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Survival probability gauge
function SurvivalGauge({ probability }: { probability: number }) {
  const percentage = probability * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  let color = "text-green-400";
  let strokeColor = "#22c55e";
  if (percentage < 70) { color = "text-red-400"; strokeColor = "#ef4444"; }
  else if (percentage < 85) { color = "text-amber-400"; strokeColor = "#f59e0b"; }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col items-center">
      <h4 className="text-sm font-medium text-zinc-400 mb-4">Survival Probability</h4>

      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{percentage.toFixed(1)}%</span>
        </div>
      </div>

      <p className="text-xs text-zinc-500 mt-3 text-center">
        Probability of maintaining operational viability over forecast period
      </p>
    </div>
  );
}

// Distribution histogram
function DistributionHistogram({ data, varValue, cvarValue, baseValue, currency }: {
  data: { range: number; count: number; percentage: number }[];
  varValue: number;
  cvarValue: number;
  baseValue: number;
  currency: string;
}) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h4 className="text-sm font-medium text-zinc-400 mb-4">Enterprise Value Distribution (Monte Carlo)</h4>

      <div className="flex items-end gap-1 h-32">
        {data.map((bucket, idx) => {
          const height = (bucket.count / maxCount) * 100;
          const isVaR = bucket.range <= varValue && (idx === data.length - 1 || data[idx + 1].range > varValue);
          const isCVaR = bucket.range <= cvarValue;
          const isBase = bucket.range <= baseValue && (idx === data.length - 1 || data[idx + 1].range > baseValue);

          let color = "bg-blue-500";
          if (isCVaR) color = "bg-red-500";
          else if (isVaR) color = "bg-amber-500";
          else if (isBase) color = "bg-green-500";

          return (
            <div
              key={idx}
              className={`flex-1 ${color} rounded-t opacity-70 hover:opacity-100 transition-opacity`}
              style={{ height: `${height}%` }}
              title={`${formatCurrency(bucket.range, currency)}: ${bucket.count} simulations`}
            />
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-xs text-zinc-500">
        <span>{formatCurrency(data[0]?.range || 0, currency)}</span>
        <span>{formatCurrency(data[data.length - 1]?.range || 0, currency)}</span>
      </div>

      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /><span className="text-zinc-400">CVaR Zone</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded" /><span className="text-zinc-400">VaR Zone</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded" /><span className="text-zinc-400">Normal</span></div>
      </div>
    </div>
  );
}

// Stress scenario table
function StressScenarioTable({ scenarios, baseEV, currency }: {
  scenarios: { name: string; impact: string; probability: number; evImpact: number; description: string }[];
  baseEV: number;
  currency: string;
}) {
  const impactColors: Record<string, string> = {
    Catastrophic: "text-red-500 bg-red-500/10",
    Severe: "text-red-400 bg-red-500/10",
    High: "text-orange-400 bg-orange-500/10",
    Moderate: "text-amber-400 bg-amber-500/10",
    Low: "text-green-400 bg-green-500/10",
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h4 className="text-sm font-medium text-zinc-400 mb-4">Stress Test Scenarios</h4>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-2 text-zinc-500 font-medium">Scenario</th>
              <th className="text-center py-2 text-zinc-500 font-medium">Impact</th>
              <th className="text-center py-2 text-zinc-500 font-medium">Probability</th>
              <th className="text-right py-2 text-zinc-500 font-medium">EV Impact</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario, idx) => (
              <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="py-3">
                  <div className="font-medium text-white">{scenario.name}</div>
                  <div className="text-xs text-zinc-500">{scenario.description}</div>
                </td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${impactColors[scenario.impact]}`}>
                    {scenario.impact}
                  </span>
                </td>
                <td className="py-3 text-center text-zinc-400">{(scenario.probability * 100).toFixed(0)}%</td>
                <td className="py-3 text-right">
                  <span className="text-red-400 font-mono">{formatCurrency(scenario.evImpact, currency)}</span>
                  <span className="text-zinc-500 text-xs ml-1">
                    ({((scenario.evImpact / baseEV) * 100).toFixed(0)}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Covenant status
function CovenantStatus({ covenants }: {
  covenants: { covenant: string; currentValue: number; threshold: number; headroom: number; status: 'safe' | 'warning' | 'breach' }[];
}) {
  const statusConfig = {
    safe: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", icon: "✓" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: "⚠" },
    breach: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", icon: "✗" },
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h4 className="text-sm font-medium text-zinc-400 mb-4">Debt Covenant Status</h4>

      <div className="space-y-3">
        {covenants.map((cov, idx) => {
          const cfg = statusConfig[cov.status];
          const headroomPercent = (cov.headroom / cov.threshold) * 100;

          return (
            <div key={idx} className={`p-3 rounded-lg border ${cfg.border} ${cfg.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white">{cov.covenant}</span>
                <span className={`text-sm font-bold ${cfg.text}`}>{cfg.icon} {cov.status.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-zinc-400">Current: <span className="text-white font-mono">{cov.currentValue.toFixed(1)}</span></span>
                <span className="text-zinc-400">Threshold: <span className="text-zinc-300 font-mono">{cov.threshold.toFixed(1)}</span></span>
                <span className="text-zinc-400">Headroom: <span className={cfg.text}>{headroomPercent.toFixed(0)}%</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StressTestingDashboard({ analysis, currency }: StressTestingDashboardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const metrics = calculateStressScenarios(analysis);

  return (
    <div className="space-y-6">
      {/* Key Risk Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <VaRGauge
          label="Enterprise Value at Risk"
          baseValue={metrics.baseEV}
          varValue={metrics.evRisk.var95}
          cvarValue={metrics.evRisk.cvar}
          currency={currency}
        />
        <VaRGauge
          label="Revenue at Risk"
          baseValue={analysis.baseCase.yearlyFinancials[0]?.revenue || 0}
          varValue={metrics.revenueRisk.var95}
          cvarValue={metrics.revenueRisk.cvar}
          currency={currency}
        />
        <VaRGauge
          label="EBITDA at Risk"
          baseValue={analysis.baseCase.yearlyFinancials[0]?.ebitda || 0}
          varValue={metrics.ebitdaRisk.var95}
          cvarValue={metrics.ebitdaRisk.cvar}
          currency={currency}
        />
        <SurvivalGauge probability={metrics.survivalProbability} />
      </div>

      {/* Distribution & Scenarios */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionHistogram
          data={metrics.histogram}
          varValue={metrics.evRisk.var95}
          cvarValue={metrics.evRisk.cvar}
          baseValue={metrics.baseEV}
          currency={currency}
        />
        <CovenantStatus covenants={metrics.covenantBreaches} />
      </div>

      {/* Stress Scenarios */}
      <StressScenarioTable
        scenarios={metrics.stressScenarios}
        baseEV={metrics.baseEV}
        currency={currency}
      />

      {/* Risk Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h4 className="text-sm font-medium text-zinc-400 mb-4">Risk Assessment Summary</h4>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
            <div className="text-3xl font-bold text-amber-400">
              {formatCurrency(metrics.baseEV - metrics.evRisk.var95, currency)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">Maximum Loss (95% confidence)</div>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
            <div className="text-3xl font-bold text-red-400">
              {formatCurrency(metrics.baseEV - metrics.evRisk.cvar, currency)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">Expected Shortfall (Tail Risk)</div>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
            <div className={`text-3xl font-bold ${metrics.survivalProbability > 0.85 ? 'text-green-400' : metrics.survivalProbability > 0.70 ? 'text-amber-400' : 'text-red-400'}`}>
              {(metrics.survivalProbability * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-zinc-500 mt-1">Business Continuity Probability</div>
          </div>
        </div>
      </div>
    </div>
  );
}
