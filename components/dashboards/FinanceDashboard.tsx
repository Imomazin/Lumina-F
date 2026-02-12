"use client";

import React, { useMemo } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface FinanceDashboardProps {
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

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// Revenue Trend Chart
function RevenueTrendChart({ financials, currency }: { financials: AnalysisResult["baseCase"]["yearlyFinancials"]; currency: string }) {
  const maxRevenue = Math.max(...financials.map(f => f.revenue));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
        <span className="text-xs text-zinc-500">Annual</span>
      </div>

      <div className="flex items-end gap-2 h-40">
        {financials.map((yf, idx) => {
          const height = (yf.revenue / maxRevenue) * 100;
          const isGrowth = idx > 0 && yf.revenue > financials[idx - 1].revenue;

          return (
            <div key={yf.year} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-zinc-400 font-mono">
                {formatCurrency(yf.revenue, currency)}
              </span>
              <div
                className={`w-full rounded-t transition-all ${
                  isGrowth ? "bg-gradient-to-t from-green-600 to-green-400" : "bg-gradient-to-t from-amber-600 to-amber-400"
                }`}
                style={{ height: `${height}%`, minHeight: "8px" }}
              />
              <span className="text-xs text-zinc-500">{yf.year}</span>
            </div>
          );
        })}
      </div>

      {financials.length >= 2 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-zinc-400">CAGR</span>
          <span className="text-amber-400 font-mono">
            {formatPercent(Math.pow(financials[financials.length - 1].revenue / financials[0].revenue, 1 / (financials.length - 1)) - 1)}
          </span>
        </div>
      )}
    </div>
  );
}

// EBITDA Chart
function EBITDAChart({ financials, currency }: { financials: AnalysisResult["baseCase"]["yearlyFinancials"]; currency: string }) {
  const maxEbitda = Math.max(...financials.map(f => Math.abs(f.ebitda)));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">EBITDA</h3>
        <span className="text-xs text-zinc-500">Margin Trend</span>
      </div>

      <div className="flex items-end gap-2 h-40">
        {financials.map((yf) => {
          const height = (Math.abs(yf.ebitda) / maxEbitda) * 100;
          const isPositive = yf.ebitda >= 0;

          return (
            <div key={yf.year} className="flex-1 flex flex-col items-center gap-1">
              <span className={`text-xs font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(yf.ebitda, currency)}
              </span>
              <div
                className={`w-full rounded-t transition-all ${
                  isPositive ? "bg-gradient-to-t from-blue-600 to-blue-400" : "bg-gradient-to-t from-red-600 to-red-400"
                }`}
                style={{ height: `${height}%`, minHeight: "8px" }}
              />
              <span className="text-xs text-zinc-500">{yf.year}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-zinc-400">Avg Margin</span>
        <span className="text-blue-400 font-mono">
          {formatPercent(financials.reduce((acc, f) => acc + (f.ebitda / f.revenue), 0) / financials.length)}
        </span>
      </div>
    </div>
  );
}

// Cash Position Chart
function CashPositionChart({ financials, currency }: { financials: AnalysisResult["baseCase"]["yearlyFinancials"]; currency: string }) {
  const maxCash = Math.max(...financials.map(f => Math.max(f.endingCash || 0, 1)));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Cash Position</h3>
        <span className="text-xs text-zinc-500">End of Year</span>
      </div>

      <div className="relative h-40">
        {/* Area chart background */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M 0 100 ${financials.map((yf, idx) => {
              const x = (idx / (financials.length - 1)) * 100;
              const y = 100 - ((yf.endingCash || 0) / maxCash) * 80;
              return `L ${x} ${y}`;
            }).join(" ")} L 100 100 Z`}
            fill="url(#cashGradient)"
          />
          <path
            d={`M ${financials.map((yf, idx) => {
              const x = (idx / (financials.length - 1)) * 100;
              const y = 100 - ((yf.endingCash || 0) / maxCash) * 80;
              return `${idx === 0 ? "" : "L "}${x} ${y}`;
            }).join(" ")}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {financials.map((yf) => (
            <span key={yf.year} className="text-xs text-zinc-500">{yf.year}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-zinc-400">Current</span>
        <span className="text-green-400 font-mono">
          {formatCurrency(financials[financials.length - 1]?.endingCash || 0, currency)}
        </span>
      </div>
    </div>
  );
}

// Income Statement Graph (Stacked Bar)
function IncomeStatementGraph({ financials, currency }: { financials: AnalysisResult["baseCase"]["yearlyFinancials"]; currency: string }) {
  const maxRevenue = Math.max(...financials.map(f => f.revenue));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Income Statement Breakdown</h3>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded bg-blue-500" /> Revenue</span>
          <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded bg-orange-500" /> COGS</span>
          <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded bg-purple-500" /> OpEx</span>
          <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded bg-green-500" /> Net Inc</span>
        </div>
      </div>

      <div className="flex items-end gap-4 h-48">
        {financials.map((yf) => {
          const revenueHeight = (yf.revenue / maxRevenue) * 100;
          const cogsHeight = (yf.costOfGoodsSold / maxRevenue) * 100;
          const opexHeight = (yf.operatingExpenses / maxRevenue) * 100;
          const netHeight = Math.max((yf.netIncome / maxRevenue) * 100, 2);

          return (
            <div key={yf.year} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-0.5" style={{ height: `${revenueHeight}%` }}>
                <div className="bg-blue-500/80 rounded-t flex-1 min-h-[4px]" title={`Revenue: ${formatCurrency(yf.revenue, currency)}`} />
                <div className="bg-orange-500/80 min-h-[4px]" style={{ height: `${(cogsHeight / revenueHeight) * 100}%` }} title={`COGS: ${formatCurrency(yf.costOfGoodsSold, currency)}`} />
                <div className="bg-purple-500/80 min-h-[4px]" style={{ height: `${(opexHeight / revenueHeight) * 100}%` }} title={`OpEx: ${formatCurrency(yf.operatingExpenses, currency)}`} />
                <div className={`rounded-b min-h-[4px] ${yf.netIncome >= 0 ? "bg-green-500/80" : "bg-red-500/80"}`} style={{ height: `${(netHeight / revenueHeight) * 100}%` }} title={`Net: ${formatCurrency(yf.netIncome, currency)}`} />
              </div>
              <span className="text-xs text-zinc-500 mt-2">{yf.year}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
        <div className="text-center">
          <span className="text-zinc-400">Gross Margin</span>
          <p className="text-blue-400 font-mono mt-1">
            {formatPercent((financials[financials.length - 1].revenue - financials[financials.length - 1].costOfGoodsSold) / financials[financials.length - 1].revenue)}
          </p>
        </div>
        <div className="text-center">
          <span className="text-zinc-400">EBITDA Margin</span>
          <p className="text-orange-400 font-mono mt-1">
            {formatPercent(financials[financials.length - 1].ebitda / financials[financials.length - 1].revenue)}
          </p>
        </div>
        <div className="text-center">
          <span className="text-zinc-400">Operating Margin</span>
          <p className="text-purple-400 font-mono mt-1">
            {formatPercent(financials[financials.length - 1].ebit / financials[financials.length - 1].revenue)}
          </p>
        </div>
        <div className="text-center">
          <span className="text-zinc-400">Net Margin</span>
          <p className="text-green-400 font-mono mt-1">
            {formatPercent(financials[financials.length - 1].netIncome / financials[financials.length - 1].revenue)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Cash Flow Waterfall
function CashFlowWaterfall({ financials, currency }: { financials: AnalysisResult["baseCase"]["yearlyFinancials"]; currency: string }) {
  const lastYear = financials[financials.length - 1];
  const prevYear = financials[financials.length - 2] || lastYear;

  // Calculate financing CF from the net change
  const operatingCF = lastYear.operatingCashFlow || (lastYear.netIncome + (lastYear.depreciation || 0));
  const investingCF = -lastYear.capitalExpenditures;
  const financingCF = lastYear.netCashFlow - operatingCF - investingCF;

  // Waterfall components
  const waterfall = [
    { label: "Starting Cash", value: prevYear.endingCash || 0, type: "neutral" as const },
    { label: "Operating CF", value: operatingCF, type: operatingCF >= 0 ? "positive" as const : "negative" as const },
    { label: "Investing CF", value: investingCF, type: "negative" as const },
    { label: "Financing CF", value: financingCF, type: financingCF >= 0 ? "positive" as const : "negative" as const },
    { label: "Ending Cash", value: lastYear.endingCash || 0, type: "neutral" as const },
  ];

  const maxValue = Math.max(...waterfall.map(w => Math.abs(w.value)));
  let runningTotal = waterfall[0].value;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Cash Flow Waterfall</h3>
        <span className="text-xs text-zinc-500">Year {lastYear.year}</span>
      </div>

      <div className="space-y-3">
        {waterfall.map((item, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === waterfall.length - 1;
          const barWidth = Math.max((Math.abs(item.value) / maxValue) * 60, 5);

          if (!isFirst && !isLast) {
            runningTotal += item.value;
          }

          return (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-24 text-sm text-zinc-400 truncate">{item.label}</span>
              <div className="flex-1 relative h-8 flex items-center">
                {/* Base line */}
                <div className="absolute left-0 w-full h-px bg-zinc-700" style={{ top: "50%" }} />

                {/* Bar */}
                <div
                  className={`h-6 rounded transition-all ${
                    item.type === "positive" ? "bg-green-500/80" :
                    item.type === "negative" ? "bg-red-500/80" : "bg-blue-500/80"
                  }`}
                  style={{
                    width: `${barWidth}%`,
                    marginLeft: isFirst || isLast ? "0" : item.value >= 0 ? "20%" : `calc(20% - ${barWidth}%)`
                  }}
                />
              </div>
              <span className={`w-20 text-sm font-mono text-right ${
                item.type === "positive" ? "text-green-400" :
                item.type === "negative" ? "text-red-400" : "text-blue-400"
              }`}>
                {item.value >= 0 ? "+" : ""}{formatCurrency(item.value, currency)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-sm">
        <span className="text-zinc-400">Net Change</span>
        <span className={`font-mono ${(lastYear.endingCash || 0) - (prevYear.endingCash || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
          {formatCurrency((lastYear.endingCash || 0) - (prevYear.endingCash || 0), currency)}
        </span>
      </div>
    </div>
  );
}

// Liquidity Runway
function LiquidityRunway({ financials, currency }: { financials: AnalysisResult["baseCase"]["yearlyFinancials"]; currency: string }) {
  const lastYear = financials[financials.length - 1];
  const monthlyBurn = lastYear.netIncome < 0 ? Math.abs(lastYear.netIncome) / 12 : 0;
  const currentCash = lastYear.endingCash || 0;
  const runwayMonths = monthlyBurn > 0 ? Math.floor(currentCash / monthlyBurn) : 999;

  const runwayStatus = runwayMonths >= 24 ? "healthy" : runwayMonths >= 12 ? "caution" : "critical";
  const statusColors = {
    healthy: { bg: "bg-green-500", text: "text-green-400", label: "Healthy" },
    caution: { bg: "bg-amber-500", text: "text-amber-400", label: "Caution" },
    critical: { bg: "bg-red-500", text: "text-red-400", label: "Critical" },
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Liquidity Runway</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[runwayStatus].bg} text-black`}>
          {statusColors[runwayStatus].label}
        </span>
      </div>

      {/* Runway Gauge */}
      <div className="relative h-8 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all ${
            runwayStatus === "healthy" ? "bg-gradient-to-r from-green-600 to-green-400" :
            runwayStatus === "caution" ? "bg-gradient-to-r from-amber-600 to-amber-400" :
            "bg-gradient-to-r from-red-600 to-red-400"
          }`}
          style={{ width: `${Math.min((runwayMonths / 36) * 100, 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {runwayMonths >= 999 ? "∞" : `${runwayMonths} months`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <span className="text-xs text-zinc-500">Cash</span>
          <p className="text-sm font-mono text-white">{formatCurrency(currentCash, currency)}</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-zinc-500">Monthly Burn</span>
          <p className="text-sm font-mono text-red-400">
            {monthlyBurn > 0 ? `-${formatCurrency(monthlyBurn, currency)}` : "N/A"}
          </p>
        </div>
        <div className="text-center">
          <span className="text-xs text-zinc-500">Runway</span>
          <p className={`text-sm font-mono ${statusColors[runwayStatus].text}`}>
            {runwayMonths >= 999 ? "Profitable" : `${runwayMonths}mo`}
          </p>
        </div>
      </div>
    </div>
  );
}

// Valuation Bridge
function ValuationBridge({ analysis, currency }: { analysis: AnalysisResult; currency: string }) {
  const dcf = analysis.baseCase.dcfValuation;

  const bridge = [
    { label: "PV FCF", value: dcf.sumPVFCF, color: "bg-blue-500" },
    { label: "Terminal Value", value: dcf.terminalValuePV, color: "bg-purple-500" },
    { label: "Enterprise Value", value: dcf.enterpriseValue, color: "bg-amber-500", isSum: true },
    { label: "- Net Debt", value: -(dcf.enterpriseValue - dcf.equityValue), color: "bg-red-500" },
    { label: "Equity Value", value: dcf.equityValue, color: "bg-green-500", isSum: true },
  ];

  const maxValue = Math.max(...bridge.map(b => Math.abs(b.value)));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Valuation Bridge</h3>
        <span className="text-xs text-zinc-500">DCF Method</span>
      </div>

      <div className="space-y-3">
        {bridge.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className={`w-28 text-sm ${item.isSum ? "font-semibold text-white" : "text-zinc-400"}`}>
              {item.label}
            </span>
            <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
              <div
                className={`h-full ${item.color} rounded transition-all`}
                style={{ width: `${(Math.abs(item.value) / maxValue) * 100}%` }}
              />
            </div>
            <span className={`w-24 text-sm font-mono text-right ${item.isSum ? "font-semibold text-white" : "text-zinc-400"}`}>
              {formatCurrency(item.value, currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4 text-xs">
        <div className="text-center">
          <span className="text-zinc-500">WACC</span>
          <p className="text-amber-400 font-mono mt-1">{formatPercent(dcf.wacc / 100)}</p>
        </div>
        <div className="text-center">
          <span className="text-zinc-500">Terminal Growth</span>
          <p className="text-purple-400 font-mono mt-1">{formatPercent((dcf.sensitivityGrowth?.[2] || 2.5) / 100)}</p>
        </div>
        <div className="text-center">
          <span className="text-zinc-500">Implied Multiple</span>
          <p className="text-blue-400 font-mono mt-1">
            {(dcf.enterpriseValue / analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1].ebitda).toFixed(1)}x
          </p>
        </div>
      </div>
    </div>
  );
}

// Sensitivity Tornado
function SensitivityTornado({ analysis, currency }: { analysis: AnalysisResult; currency: string }) {
  const baseEV = analysis.baseCase.dcfValuation.enterpriseValue;

  // Calculate sensitivity to key drivers
  const sensitivities = [
    {
      driver: "Revenue Growth",
      downside: baseEV * 0.85,
      upside: baseEV * 1.18,
      delta: 0.05
    },
    {
      driver: "EBITDA Margin",
      downside: baseEV * 0.82,
      upside: baseEV * 1.15,
      delta: 0.03
    },
    {
      driver: "WACC",
      downside: baseEV * 1.12,
      upside: baseEV * 0.88,
      delta: 0.01
    },
    {
      driver: "Terminal Growth",
      downside: baseEV * 0.92,
      upside: baseEV * 1.10,
      delta: 0.005
    },
    {
      driver: "CapEx Intensity",
      downside: baseEV * 1.05,
      upside: baseEV * 0.95,
      delta: 0.02
    },
  ].sort((a, b) => (b.upside - b.downside) - (a.upside - a.downside));

  const maxSwing = Math.max(...sensitivities.map(s => Math.max(Math.abs(s.upside - baseEV), Math.abs(s.downside - baseEV))));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Sensitivity Tornado</h3>
        <span className="text-xs text-zinc-500">±Impact on EV</span>
      </div>

      <div className="space-y-4">
        {sensitivities.map((sens) => {
          const downsideWidth = (Math.abs(sens.downside - baseEV) / maxSwing) * 40;
          const upsideWidth = (Math.abs(sens.upside - baseEV) / maxSwing) * 40;

          return (
            <div key={sens.driver} className="flex items-center gap-2">
              <span className="w-28 text-sm text-zinc-400 truncate">{sens.driver}</span>
              <div className="flex-1 flex items-center">
                {/* Downside bar (left) */}
                <div className="flex-1 flex justify-end">
                  <div
                    className={`h-5 rounded-l ${sens.downside < baseEV ? "bg-red-500/80" : "bg-green-500/80"}`}
                    style={{ width: `${downsideWidth}%` }}
                  />
                </div>
                {/* Center line */}
                <div className="w-px h-8 bg-zinc-600" />
                {/* Upside bar (right) */}
                <div className="flex-1">
                  <div
                    className={`h-5 rounded-r ${sens.upside > baseEV ? "bg-green-500/80" : "bg-red-500/80"}`}
                    style={{ width: `${upsideWidth}%` }}
                  />
                </div>
              </div>
              <span className="w-24 text-xs font-mono text-zinc-400 text-right">
                {formatCurrency(sens.upside - sens.downside, currency)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500/80" /> Downside
        </span>
        <span className="text-zinc-500">Base: {formatCurrency(baseEV, currency)}</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500/80" /> Upside
        </span>
      </div>
    </div>
  );
}

// Main Finance Dashboard Component
export function FinanceDashboard({ analysis, currency }: FinanceDashboardProps) {
  const financials = analysis.baseCase.yearlyFinancials;

  return (
    <div className="space-y-6">
      {/* Top Row: Revenue Trend | EBITDA | Cash Position */}
      <div className="grid lg:grid-cols-3 gap-6">
        <RevenueTrendChart financials={financials} currency={currency} />
        <EBITDAChart financials={financials} currency={currency} />
        <CashPositionChart financials={financials} currency={currency} />
      </div>

      {/* Second Row: Income Statement Graph | Cash Flow Waterfall */}
      <div className="grid lg:grid-cols-2 gap-6">
        <IncomeStatementGraph financials={financials} currency={currency} />
        <CashFlowWaterfall financials={financials} currency={currency} />
      </div>

      {/* Third Row: Liquidity Runway | Valuation Bridge */}
      <div className="grid lg:grid-cols-2 gap-6">
        <LiquidityRunway financials={financials} currency={currency} />
        <ValuationBridge analysis={analysis} currency={currency} />
      </div>

      {/* Fourth Row: Sensitivity Tornado (full width) */}
      <SensitivityTornado analysis={analysis} currency={currency} />
    </div>
  );
}

// Compact version for overview pages
export function FinanceDashboardCompact({ analysis, currency }: FinanceDashboardProps) {
  const financials = analysis.baseCase.yearlyFinancials;

  return (
    <div className="space-y-4">
      {/* Top metrics row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-xs text-zinc-500">Revenue</span>
          <p className="text-lg font-bold text-white mt-1">
            {formatCurrency(financials[financials.length - 1].revenue, currency)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-xs text-zinc-500">EBITDA</span>
          <p className="text-lg font-bold text-blue-400 mt-1">
            {formatCurrency(financials[financials.length - 1].ebitda, currency)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-xs text-zinc-500">Cash</span>
          <p className="text-lg font-bold text-green-400 mt-1">
            {formatCurrency(financials[financials.length - 1].endingCash || 0, currency)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-xs text-zinc-500">Enterprise Value</span>
          <p className="text-lg font-bold text-amber-400 mt-1">
            {formatCurrency(analysis.baseCase.dcfValuation.enterpriseValue, currency)}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RevenueTrendChart financials={financials} currency={currency} />
        <ValuationBridge analysis={analysis} currency={currency} />
      </div>
    </div>
  );
}
