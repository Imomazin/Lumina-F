"use client";

import { useState, useEffect, useMemo } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface KPIDashboardProps {
  analysis: AnalysisResult;
  currency: string;
}

// Animated counter hook
function useAnimatedValue(targetValue: number, duration: number = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setValue(targetValue * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);

  return value;
}

// Gauge Component
function GaugeChart({
  value,
  max,
  label,
  color = "amber",
  size = 120
}: {
  value: number;
  max: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const animatedValue = useAnimatedValue(value, 1200);
  const percentage = Math.min((animatedValue / max) * 100, 100);
  const strokeDasharray = `${percentage * 2.51} 251`;

  const colors: Record<string, { stroke: string; text: string; bg: string }> = {
    amber: { stroke: "#f59e0b", text: "text-amber-500", bg: "bg-amber-500" },
    green: { stroke: "#22c55e", text: "text-green-500", bg: "bg-green-500" },
    blue: { stroke: "#3b82f6", text: "text-blue-500", bg: "bg-blue-500" },
    purple: { stroke: "#a855f7", text: "text-purple-500", bg: "bg-purple-500" },
    red: { stroke: "#ef4444", text: "text-red-500", bg: "bg-red-500" },
    cyan: { stroke: "#06b6d4", text: "text-cyan-500", bg: "bg-cyan-500" },
  };

  const c = colors[color] || colors.amber;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
        <svg
          width={size}
          height={size / 2 + 10}
          viewBox="0 0 100 55"
          className="transform -rotate-0"
        >
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#27272a"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Animated arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={c.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            className="transition-all duration-500"
            style={{ filter: `drop-shadow(0 0 6px ${c.stroke}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className={`text-2xl font-bold ${c.text}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <p className="mt-1 text-xs text-zinc-400">{label}</p>
    </div>
  );
}

// Sparkline Component
function Sparkline({
  data,
  color = "#f59e0b",
  height = 40,
  width = 120
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="3"
        fill={color}
        className="animate-pulse"
      />
    </svg>
  );
}

// KPI Card Component
function KPICard({
  title,
  value,
  formattedValue,
  change,
  changeLabel,
  icon,
  color = "amber",
  sparkData,
}: {
  title: string;
  value: number;
  formattedValue: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: string;
  sparkData?: number[];
}) {
  const colors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500", iconBg: "bg-amber-500/20" },
    green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-500", iconBg: "bg-green-500/20" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500", iconBg: "bg-blue-500/20" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-500", iconBg: "bg-purple-500/20" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-500", iconBg: "bg-cyan-500/20" },
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-500", iconBg: "bg-rose-500/20" },
  };

  const c = colors[color] || colors.amber;
  const sparkColor = color === "amber" ? "#f59e0b" : color === "green" ? "#22c55e" : color === "blue" ? "#3b82f6" : color === "purple" ? "#a855f7" : color === "cyan" ? "#06b6d4" : "#f43f5e";

  return (
    <div className={`relative overflow-hidden rounded-xl border ${c.border} ${c.bg} p-5 transition-all hover:scale-[1.02] hover:shadow-lg`}>
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="80" cy="20" r="60" fill="currentColor" />
        </svg>
      </div>

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg ${c.iconBg} p-2`}>
            {icon}
          </div>
          {sparkData && sparkData.length > 0 && (
            <Sparkline data={sparkData} color={sparkColor} />
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-zinc-400">{title}</p>
          <p className={`mt-1 text-3xl font-bold ${c.text}`}>{formattedValue}</p>
        </div>

        {change !== undefined && (
          <div className="mt-3 flex items-center gap-2">
            <span className={`flex items-center text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {change >= 0 ? (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
            {changeLabel && <span className="text-xs text-zinc-500">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// Progress Ring
function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 6,
  color = "amber"
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const animatedProgress = useAnimatedValue(progress, 1000);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  const colors: Record<string, string> = {
    amber: "#f59e0b",
    green: "#22c55e",
    blue: "#3b82f6",
    purple: "#a855f7",
  };

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#27272a"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors[color] || colors.amber}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-500"
        style={{ filter: `drop-shadow(0 0 4px ${colors[color]}40)` }}
      />
    </svg>
  );
}

// Main KPI Dashboard
export function KPIDashboard({ analysis, currency }: KPIDashboardProps) {
  const { baseCase, scenarios, executiveSummary, riskMetrics } = analysis;
  const { dcfValuation, yearlyFinancials, cagr, averageRatios } = baseCase;

  const formatCurrency = (value: number) => {
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };
    const symbol = symbols[currency] || "$";
    if (Math.abs(value) >= 1e9) return `${symbol}${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${symbol}${(value / 1e3).toFixed(0)}K`;
    return `${symbol}${value.toFixed(0)}`;
  };

  // Get sparkline data from yearly financials
  const revenueData = yearlyFinancials.map(yf => yf.revenue);
  const ebitdaData = yearlyFinancials.map(yf => yf.ebitda);
  const fcfData = yearlyFinancials.map(yf => yf.freeCashFlow);
  const netIncomeData = yearlyFinancials.map(yf => yf.netIncome);

  // Investment rating score
  const ratingScores: Record<string, number> = {
    strong_buy: 95, buy: 75, hold: 50, sell: 25, strong_sell: 10
  };
  const ratingScore = ratingScores[executiveSummary.investmentRating] || 50;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Enterprise Value"
          value={dcfValuation.enterpriseValue}
          formattedValue={formatCurrency(dcfValuation.enterpriseValue)}
          icon={<svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="amber"
          sparkData={revenueData}
        />
        <KPICard
          title="Revenue (Base Year)"
          value={yearlyFinancials[0]?.revenue || 0}
          formattedValue={formatCurrency(yearlyFinancials[0]?.revenue || 0)}
          change={cagr.revenue * 100}
          changeLabel="CAGR"
          icon={<svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          color="green"
          sparkData={revenueData}
        />
        <KPICard
          title="EBITDA"
          value={yearlyFinancials[0]?.ebitda || 0}
          formattedValue={formatCurrency(yearlyFinancials[0]?.ebitda || 0)}
          change={cagr.ebitda * 100}
          changeLabel="CAGR"
          icon={<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          color="blue"
          sparkData={ebitdaData}
        />
        <KPICard
          title="Free Cash Flow"
          value={yearlyFinancials[0]?.freeCashFlow || 0}
          formattedValue={formatCurrency(yearlyFinancials[0]?.freeCashFlow || 0)}
          change={cagr.fcf * 100}
          changeLabel="CAGR"
          icon={<svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          color="purple"
          sparkData={fcfData}
        />
      </div>

      {/* Gauges Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col items-center">
          <GaugeChart
            value={averageRatios.grossMargin * 100}
            max={100}
            label="Gross Margin"
            color="green"
          />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col items-center">
          <GaugeChart
            value={averageRatios.ebitdaMargin * 100}
            max={50}
            label="EBITDA Margin"
            color="blue"
          />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col items-center">
          <GaugeChart
            value={averageRatios.netMargin * 100}
            max={40}
            label="Net Margin"
            color="purple"
          />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col items-center">
          <GaugeChart
            value={ratingScore}
            max={100}
            label="Investment Score"
            color="amber"
          />
        </div>
      </div>

      {/* Valuation Metrics */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* DCF Summary */}
        <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            DCF Valuation
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">PV of Cash Flows</span>
              <span className="text-white font-mono">{formatCurrency(dcfValuation.sumPVFCF)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Terminal Value (PV)</span>
              <span className="text-white font-mono">{formatCurrency(dcfValuation.terminalValuePV)}</span>
            </div>
            <div className="h-px bg-zinc-800"></div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Enterprise Value</span>
              <span className="text-amber-500 font-mono font-bold">{formatCurrency(dcfValuation.enterpriseValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Net Debt</span>
              <span className="text-white font-mono">({formatCurrency(dcfValuation.netDebt)})</span>
            </div>
            <div className="h-px bg-zinc-800"></div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-300 font-medium">Equity Value</span>
              <span className="text-green-500 font-mono font-bold text-xl">{formatCurrency(dcfValuation.equityValue)}</span>
            </div>
          </div>
        </div>

        {/* Key Ratios */}
        <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Key Ratios
          </h3>
          <div className="space-y-3">
            {[
              { label: "ROE", value: averageRatios.returnOnEquity * 100, suffix: "%", target: 15 },
              { label: "ROA", value: averageRatios.returnOnAssets * 100, suffix: "%", target: 10 },
              { label: "ROIC", value: averageRatios.returnOnInvestedCapital * 100, suffix: "%", target: 12 },
              { label: "Current Ratio", value: averageRatios.currentRatio, suffix: "x", target: 2 },
              { label: "Debt/EBITDA", value: averageRatios.debtToEbitda, suffix: "x", target: 3, inverse: true },
            ].map((ratio, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">{ratio.label}</span>
                    <span className="text-white font-mono">{ratio.value.toFixed(1)}{ratio.suffix}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        ratio.inverse
                          ? ratio.value <= ratio.target ? "bg-green-500" : "bg-red-500"
                          : ratio.value >= ratio.target ? "bg-green-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min((ratio.value / (ratio.target * 2)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Rating */}
        <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            Investment Rating
          </h3>
          <div className="flex flex-col items-center py-4">
            <div className="relative">
              <ProgressRing progress={ratingScore} size={100} strokeWidth={8} color="amber" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{ratingScore}</span>
              </div>
            </div>
            <p className={`mt-4 text-xl font-bold ${
              executiveSummary.investmentRating.includes('buy') ? 'text-green-500' :
              executiveSummary.investmentRating === 'hold' ? 'text-amber-500' : 'text-red-500'
            }`}>
              {executiveSummary.investmentRating.replace(/_/g, ' ').toUpperCase()}
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              Confidence: {executiveSummary.confidenceLevel}
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {executiveSummary.keyHighlights.slice(0, 3).map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-0.5">•</span>
                <span className="text-zinc-400">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Scenario Analysis</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {scenarios.slice(0, 3).map((scenario, idx) => {
            const colors = ["green", "amber", "red"];
            const color = colors[idx] || "amber";
            const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
              green: { border: "border-green-500/30", bg: "bg-green-500/10", text: "text-green-500" },
              amber: { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-500" },
              red: { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-500" },
            };
            const c = colorClasses[color];

            return (
              <div key={scenario.scenarioId} className={`rounded-lg border ${c.border} ${c.bg} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-white">{scenario.scenarioName}</span>
                  <span className="text-xs text-zinc-500">{scenario.probability}% prob.</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">NPV</span>
                    <span className={`font-mono ${c.text}`}>{formatCurrency(scenario.npv)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">IRR</span>
                    <span className={`font-mono ${c.text}`}>{(scenario.irr * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">EV</span>
                    <span className={`font-mono ${c.text}`}>{formatCurrency(scenario.dcfValuation.enterpriseValue)}</span>
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
