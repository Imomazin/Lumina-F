"use client";

import { useState } from "react";
import Link from "next/link";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface CommandCentreProps {
  analysis: AnalysisResult;
  currency: string;
  companyName: string;
  onStartPlanning?: () => void;
}

function fmt(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$" };
  const s = symbols[currency] || "$";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${s}${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${s}${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${s}${(value / 1e3).toFixed(0)}K`;
  return `${s}${value.toFixed(0)}`;
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// Financial Health Score Calculator
function calculateHealthScore(analysis: AnalysisResult): {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  factors: { name: string; score: number; weight: number; status: "good" | "warning" | "critical" }[];
} {
  const lastYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1];
  const ratios = analysis.baseCase.averageRatios;
  const dcf = analysis.baseCase.dcfValuation;

  const factors = [
    {
      name: "Profitability",
      score: Math.min(100, Math.max(0, lastYear.ebitdaMargin * 300)), // 33% margin = 100
      weight: 0.25,
      status: lastYear.ebitdaMargin > 0.2 ? "good" : lastYear.ebitdaMargin > 0.1 ? "warning" : "critical",
    },
    {
      name: "Liquidity",
      score: Math.min(100, Math.max(0, (ratios.currentRatio || 1.5) * 40)), // 2.5 ratio = 100
      weight: 0.2,
      status: (ratios.currentRatio || 0) > 1.5 ? "good" : (ratios.currentRatio || 0) > 1 ? "warning" : "critical",
    },
    {
      name: "Growth",
      score: Math.min(100, Math.max(0, analysis.baseCase.cagr.revenue * 400)), // 25% CAGR = 100
      weight: 0.2,
      status: analysis.baseCase.cagr.revenue > 0.15 ? "good" : analysis.baseCase.cagr.revenue > 0.05 ? "warning" : "critical",
    },
    {
      name: "Cash Flow",
      score: Math.min(100, Math.max(0, lastYear.fcfMargin * 500)), // 20% FCF margin = 100
      weight: 0.2,
      status: lastYear.fcfMargin > 0.1 ? "good" : lastYear.fcfMargin > 0 ? "warning" : "critical",
    },
    {
      name: "Leverage",
      score: Math.min(100, Math.max(0, 100 - (lastYear.netDebt / lastYear.ebitda) * 20)), // 0 debt = 100, 5x = 0
      weight: 0.15,
      status: lastYear.netDebt / lastYear.ebitda < 2 ? "good" : lastYear.netDebt / lastYear.ebitda < 4 ? "warning" : "critical",
    },
  ] as const;

  const totalScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  const grade = totalScore >= 80 ? "A" : totalScore >= 65 ? "B" : totalScore >= 50 ? "C" : totalScore >= 35 ? "D" : "F";

  return { score: Math.round(totalScore), grade, factors: factors as any };
}

// Alert Generator
function generateAlerts(analysis: AnalysisResult): {
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
}[] {
  const alerts: { type: "critical" | "warning" | "info"; title: string; message: string }[] = [];
  const lastYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1];
  const prevYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 2];

  // Margin compression
  if (prevYear && lastYear.ebitdaMargin < prevYear.ebitdaMargin - 0.02) {
    alerts.push({
      type: "warning",
      title: "Margin Compression",
      message: `EBITDA margin declined ${pct(prevYear.ebitdaMargin - lastYear.ebitdaMargin)} YoY`,
    });
  }

  // Liquidity risk
  if (lastYear.endingCash < lastYear.operatingExpenses * 0.5) {
    alerts.push({
      type: "critical",
      title: "Liquidity Risk",
      message: "Cash reserves below 6 months of operating expenses",
    });
  }

  // High leverage
  if (lastYear.netDebt > lastYear.ebitda * 4) {
    alerts.push({
      type: "critical",
      title: "High Leverage",
      message: `Net Debt/EBITDA ratio exceeds 4.0x (${(lastYear.netDebt / lastYear.ebitda).toFixed(1)}x)`,
    });
  }

  // Negative FCF
  if (lastYear.freeCashFlow < 0) {
    alerts.push({
      type: "warning",
      title: "Negative Free Cash Flow",
      message: "Company is burning cash - monitor runway closely",
    });
  }

  // Strong growth (positive)
  if (analysis.baseCase.cagr.revenue > 0.2) {
    alerts.push({
      type: "info",
      title: "Strong Growth Trajectory",
      message: `Revenue CAGR of ${pct(analysis.baseCase.cagr.revenue)} indicates healthy expansion`,
    });
  }

  // Declining revenue
  if (analysis.baseCase.cagr.revenue < 0) {
    alerts.push({
      type: "critical",
      title: "Revenue Decline",
      message: "Negative revenue growth trajectory requires strategic intervention",
    });
  }

  return alerts.slice(0, 4); // Max 4 alerts
}

export function CommandCentre({ analysis, currency, companyName, onStartPlanning }: CommandCentreProps) {
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

  const lastYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1];
  const health = calculateHealthScore(analysis);
  const alerts = generateAlerts(analysis);

  // Calculate burn rate and runway
  const monthlyBurn = lastYear.freeCashFlow < 0 ? Math.abs(lastYear.freeCashFlow) / 12 : 0;
  const runwayMonths = monthlyBurn > 0 ? Math.floor(lastYear.endingCash / monthlyBurn) : 999;

  // Risk index (0-100, higher = more risk)
  const riskIndex = Math.round(
    (1 - health.score / 100) * 40 +
    (lastYear.netDebt / (lastYear.ebitda || 1)) * 10 +
    (monthlyBurn > 0 ? Math.max(0, 30 - runwayMonths) : 0)
  );

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Command Centre</h1>
          <p className="text-zinc-500 text-sm mt-1">{companyName} • Real-time Financial Intelligence</p>
        </div>
        <button
          onClick={onStartPlanning}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Start Planning Cycle
        </button>
      </div>

      {/* Executive Snapshot - 5 Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl" />
          <p className="text-xs text-amber-400/80 uppercase tracking-wider font-medium">Revenue</p>
          <p className="text-2xl font-bold text-white mt-2">{fmt(lastYear.revenue, currency)}</p>
          <p className="text-xs text-amber-400/60 mt-1">
            {analysis.baseCase.cagr.revenue >= 0 ? "+" : ""}{pct(analysis.baseCase.cagr.revenue)} CAGR
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-5">
          <p className="text-xs text-blue-400/80 uppercase tracking-wider font-medium">EBITDA</p>
          <p className="text-2xl font-bold text-white mt-2">{fmt(lastYear.ebitda, currency)}</p>
          <p className="text-xs text-blue-400/60 mt-1">{pct(lastYear.ebitdaMargin)} margin</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 p-5">
          <p className="text-xs text-green-400/80 uppercase tracking-wider font-medium">Cash Position</p>
          <p className="text-2xl font-bold text-white mt-2">{fmt(lastYear.endingCash, currency)}</p>
          <p className="text-xs text-green-400/60 mt-1">
            {runwayMonths >= 999 ? "Cash positive" : `${runwayMonths}mo runway`}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-5">
          <p className="text-xs text-purple-400/80 uppercase tracking-wider font-medium">Burn Rate</p>
          <p className="text-2xl font-bold text-white mt-2">
            {monthlyBurn > 0 ? fmt(monthlyBurn, currency) : "—"}
          </p>
          <p className="text-xs text-purple-400/60 mt-1">
            {monthlyBurn > 0 ? "per month" : "Cash flow positive"}
          </p>
        </div>

        <div className={`relative overflow-hidden rounded-xl border p-5 ${
          riskIndex < 30 ? "border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5" :
          riskIndex < 60 ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5" :
          "border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5"
        }`}>
          <p className="text-xs uppercase tracking-wider font-medium text-zinc-400">Risk Index</p>
          <p className={`text-2xl font-bold mt-2 ${
            riskIndex < 30 ? "text-green-400" : riskIndex < 60 ? "text-amber-400" : "text-red-400"
          }`}>{riskIndex}</p>
          <p className="text-xs text-zinc-500 mt-1">
            {riskIndex < 30 ? "Low risk" : riskIndex < 60 ? "Moderate risk" : "High risk"}
          </p>
        </div>
      </div>

      {/* Health Score & Alerts Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Financial Health Score */}
        <div className="col-span-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Financial Health Score</h3>
            <div className={`text-3xl font-bold ${
              health.grade === "A" ? "text-green-400" :
              health.grade === "B" ? "text-blue-400" :
              health.grade === "C" ? "text-amber-400" :
              "text-red-400"
            }`}>
              {health.grade}
            </div>
          </div>

          {/* Score Gauge */}
          <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                health.score >= 80 ? "bg-gradient-to-r from-green-600 to-green-400" :
                health.score >= 50 ? "bg-gradient-to-r from-amber-600 to-amber-400" :
                "bg-gradient-to-r from-red-600 to-red-400"
              }`}
              style={{ width: `${health.score}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {health.score}/100
            </span>
          </div>

          {/* Factor Breakdown */}
          <div className="space-y-3">
            {health.factors.map((factor) => (
              <div key={factor.name} className="flex items-center gap-3">
                <span className="w-24 text-xs text-zinc-500">{factor.name}</span>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      factor.status === "good" ? "bg-green-500" :
                      factor.status === "warning" ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <span className={`w-8 text-xs font-mono ${
                  factor.status === "good" ? "text-green-400" :
                  factor.status === "warning" ? "text-amber-400" : "text-red-400"
                }`}>{Math.round(factor.score)}</span>
              </div>
            ))}
          </div>

          {/* Co-Pilot Nudge */}
          <div className="mt-6 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-xs text-zinc-400">
                <span className="text-amber-400 font-medium">Co-Pilot: </span>
                {health.score >= 70
                  ? "Strong financial foundation. Focus on optimizing capital allocation and growth investments."
                  : health.score >= 50
                  ? "Moderate health. Prioritize margin improvement and working capital efficiency."
                  : "Financial stress detected. Immediate focus on liquidity and cost structure required."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Alert Panel */}
        <div className="col-span-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Active Alerts</h3>
            <span className="text-xs text-zinc-500">{alerts.length} alerts</span>
          </div>

          {alerts.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-600">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-green-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-zinc-500">All systems nominal</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  onClick={() => setExpandedAlert(expandedAlert === idx ? null : idx)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    alert.type === "critical"
                      ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
                      : alert.type === "warning"
                      ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                      : "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.type === "critical" ? "bg-red-500/20" :
                      alert.type === "warning" ? "bg-amber-500/20" : "bg-blue-500/20"
                    }`}>
                      {alert.type === "critical" ? (
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : alert.type === "warning" ? (
                        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium text-sm ${
                          alert.type === "critical" ? "text-red-400" :
                          alert.type === "warning" ? "text-amber-400" : "text-blue-400"
                        }`}>{alert.title}</h4>
                        <span className={`px-1.5 py-0.5 text-[10px] uppercase font-medium rounded ${
                          alert.type === "critical" ? "bg-red-500/20 text-red-400" :
                          alert.type === "warning" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                        }`}>{alert.type}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{alert.message}</p>
                      {expandedAlert === idx && (
                        <div className="mt-3 pt-3 border-t border-zinc-700/50">
                          <p className="text-xs text-zinc-500">
                            <span className="text-amber-400">Recommended Action: </span>
                            {alert.type === "critical"
                              ? "Immediate executive review required. Schedule financial planning session."
                              : alert.type === "warning"
                              ? "Monitor closely. Consider scenario planning for mitigation strategies."
                              : "Continue monitoring. This metric is performing within acceptable range."
                            }
                          </p>
                        </div>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-zinc-600 transition-transform ${expandedAlert === idx ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-4 gap-4">
        <Link
          href="/analysis"
          className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-white text-sm group-hover:text-blue-400 transition-colors">Deep Analysis</h4>
            <p className="text-xs text-zinc-500">50+ metrics & ratios</p>
          </div>
        </Link>

        <Link
          href="/inputs"
          className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-white text-sm group-hover:text-amber-400 transition-colors">Model Builder</h4>
            <p className="text-xs text-zinc-500">Configure assumptions</p>
          </div>
        </Link>

        <Link
          href="/analysis?tab=scenarios"
          className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-white text-sm group-hover:text-purple-400 transition-colors">Scenario Lab</h4>
            <p className="text-xs text-zinc-500">Stress test & simulate</p>
          </div>
        </Link>

        <Link
          href="/reports"
          className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-white text-sm group-hover:text-green-400 transition-colors">Export Report</h4>
            <p className="text-xs text-zinc-500">Board-ready PDF</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
