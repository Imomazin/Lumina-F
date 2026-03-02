"use client";

import { useState, useMemo } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface VarianceAnalyticsProps {
  analysis: AnalysisResult;
  currency: string;
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

type ViewMode = "budget_vs_actual" | "forecast_vs_actual" | "yoy_comparison";

interface VarianceItem {
  name: string;
  category: string;
  budget: number;
  actual: number;
  variance: number;
  variancePct: number;
  status: "favorable" | "unfavorable" | "neutral";
  explanation?: string;
}

export function VarianceAnalytics({ analysis, currency }: VarianceAnalyticsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("budget_vs_actual");
  const [selectedYear, setSelectedYear] = useState<number>(
    analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1]?.year || 2024
  );

  const years = analysis.baseCase.yearlyFinancials.map(yf => yf.year);

  // Generate variance data (simulated budget vs actual - in real app this would come from actual data)
  const varianceData = useMemo(() => {
    const currentYear = analysis.baseCase.yearlyFinancials.find(yf => yf.year === selectedYear);
    const prevYear = analysis.baseCase.yearlyFinancials.find(yf => yf.year === selectedYear - 1);

    if (!currentYear) return [];

    // Simulate budget as 95% of actual (for demo) - in production this comes from budget data
    const budgetMultiplier = 0.95 + Math.random() * 0.1; // 95-105% of actual

    const items: VarianceItem[] = [
      {
        name: "Revenue",
        category: "Income",
        budget: currentYear.revenue * budgetMultiplier,
        actual: currentYear.revenue,
        variance: currentYear.revenue - currentYear.revenue * budgetMultiplier,
        variancePct: (1 - budgetMultiplier),
        status: currentYear.revenue > currentYear.revenue * budgetMultiplier ? "favorable" : "unfavorable",
        explanation: "Strong Q4 performance driven by enterprise deals",
      },
      {
        name: "Cost of Goods Sold",
        category: "Costs",
        budget: currentYear.costOfGoodsSold * (budgetMultiplier + 0.02),
        actual: currentYear.costOfGoodsSold,
        variance: currentYear.costOfGoodsSold * (budgetMultiplier + 0.02) - currentYear.costOfGoodsSold,
        variancePct: 0.02,
        status: currentYear.costOfGoodsSold < currentYear.costOfGoodsSold * (budgetMultiplier + 0.02) ? "favorable" : "unfavorable",
        explanation: "Supply chain optimizations yielded cost savings",
      },
      {
        name: "Gross Profit",
        category: "Profitability",
        budget: currentYear.grossProfit * budgetMultiplier,
        actual: currentYear.grossProfit,
        variance: currentYear.grossProfit - currentYear.grossProfit * budgetMultiplier,
        variancePct: (1 - budgetMultiplier),
        status: currentYear.grossProfit > currentYear.grossProfit * budgetMultiplier ? "favorable" : "unfavorable",
      },
      {
        name: "Operating Expenses",
        category: "Costs",
        budget: currentYear.operatingExpenses * (budgetMultiplier - 0.03),
        actual: currentYear.operatingExpenses,
        variance: currentYear.operatingExpenses * (budgetMultiplier - 0.03) - currentYear.operatingExpenses,
        variancePct: -0.03,
        status: currentYear.operatingExpenses > currentYear.operatingExpenses * (budgetMultiplier - 0.03) ? "unfavorable" : "favorable",
        explanation: "Increased R&D investment for product expansion",
      },
      {
        name: "EBITDA",
        category: "Profitability",
        budget: currentYear.ebitda * budgetMultiplier,
        actual: currentYear.ebitda,
        variance: currentYear.ebitda - currentYear.ebitda * budgetMultiplier,
        variancePct: (1 - budgetMultiplier),
        status: currentYear.ebitda > currentYear.ebitda * budgetMultiplier ? "favorable" : "unfavorable",
      },
      {
        name: "Net Income",
        category: "Profitability",
        budget: currentYear.netIncome * budgetMultiplier,
        actual: currentYear.netIncome,
        variance: currentYear.netIncome - currentYear.netIncome * budgetMultiplier,
        variancePct: (1 - budgetMultiplier),
        status: currentYear.netIncome > currentYear.netIncome * budgetMultiplier ? "favorable" : "unfavorable",
      },
      {
        name: "Free Cash Flow",
        category: "Cash Flow",
        budget: currentYear.freeCashFlow * (budgetMultiplier + 0.05),
        actual: currentYear.freeCashFlow,
        variance: currentYear.freeCashFlow - currentYear.freeCashFlow * (budgetMultiplier + 0.05),
        variancePct: -0.05,
        status: currentYear.freeCashFlow > currentYear.freeCashFlow * (budgetMultiplier + 0.05) ? "favorable" : "unfavorable",
        explanation: "Higher CapEx for capacity expansion",
      },
    ];

    return items;
  }, [analysis, selectedYear]);

  // Calculate summary metrics
  const summary = useMemo(() => {
    const favorable = varianceData.filter(v => v.status === "favorable").length;
    const unfavorable = varianceData.filter(v => v.status === "unfavorable").length;
    const totalVariance = varianceData.reduce((sum, v) => sum + v.variance, 0);

    return { favorable, unfavorable, totalVariance };
  }, [varianceData]);

  // Waterfall data for visualization
  const waterfallData = useMemo(() => {
    const currentYear = analysis.baseCase.yearlyFinancials.find(yf => yf.year === selectedYear);
    const prevYear = analysis.baseCase.yearlyFinancials.find(yf => yf.year === selectedYear - 1);

    if (!currentYear || !prevYear) return [];

    return [
      { label: `${selectedYear - 1} Revenue`, value: prevYear.revenue, type: "start" as const },
      { label: "Volume Growth", value: (currentYear.revenue - prevYear.revenue) * 0.6, type: "positive" as const },
      { label: "Price Increase", value: (currentYear.revenue - prevYear.revenue) * 0.3, type: "positive" as const },
      { label: "Mix Impact", value: (currentYear.revenue - prevYear.revenue) * 0.1, type: "positive" as const },
      { label: `${selectedYear} Revenue`, value: currentYear.revenue, type: "end" as const },
    ];
  }, [analysis, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Variance & Performance Analytics</h2>
          <p className="text-sm text-zinc-500 mt-1">Budget vs Actual analysis with driver explanations</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
          >
            {years.map(year => (
              <option key={year} value={year}>FY {year}</option>
            ))}
          </select>

          {/* View Mode Tabs */}
          <div className="flex bg-zinc-800/50 rounded-lg p-1">
            {[
              { id: "budget_vs_actual", label: "Budget vs Actual" },
              { id: "forecast_vs_actual", label: "Forecast vs Actual" },
              { id: "yoy_comparison", label: "YoY" },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as ViewMode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === mode.id
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Variance</p>
          <p className={`text-2xl font-bold mt-2 ${summary.totalVariance >= 0 ? "text-green-400" : "text-red-400"}`}>
            {summary.totalVariance >= 0 ? "+" : ""}{fmt(summary.totalVariance, currency)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">vs budget</p>
        </div>

        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-xs text-green-400/70 uppercase tracking-wider">Favorable Items</p>
          <p className="text-2xl font-bold text-green-400 mt-2">{summary.favorable}</p>
          <p className="text-xs text-zinc-500 mt-1">of {varianceData.length} line items</p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs text-red-400/70 uppercase tracking-wider">Unfavorable Items</p>
          <p className="text-2xl font-bold text-red-400 mt-2">{summary.unfavorable}</p>
          <p className="text-xs text-zinc-500 mt-1">require attention</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Forecast Accuracy</p>
          <p className="text-2xl font-bold text-white mt-2">94.2%</p>
          <p className="text-xs text-zinc-500 mt-1">within ±5% threshold</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Variance Table */}
        <div className="col-span-8 rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Detailed Variance Analysis</h3>
            <span className="text-xs text-zinc-500">FY {selectedYear}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800/50">
                  <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Line Item</th>
                  <th className="text-right text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Budget</th>
                  <th className="text-right text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Actual</th>
                  <th className="text-right text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Variance</th>
                  <th className="text-right text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">%</th>
                  <th className="text-center text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {varianceData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-zinc-500">{item.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-400 font-mono">
                      {fmt(item.budget, currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white font-mono">
                      {fmt(item.actual, currency)}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-mono ${
                      item.status === "favorable" ? "text-green-400" : item.status === "unfavorable" ? "text-red-400" : "text-zinc-400"
                    }`}>
                      {item.variance >= 0 ? "+" : ""}{fmt(item.variance, currency)}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-mono ${
                      item.status === "favorable" ? "text-green-400" : item.status === "unfavorable" ? "text-red-400" : "text-zinc-400"
                    }`}>
                      {item.variancePct >= 0 ? "+" : ""}{pct(item.variancePct)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium uppercase ${
                        item.status === "favorable"
                          ? "bg-green-500/20 text-green-400"
                          : item.status === "unfavorable"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-zinc-700 text-zinc-400"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Explanations */}
        <div className="col-span-4 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Driver Variance Explanations</h3>
            <div className="space-y-3">
              {varianceData.filter(v => v.explanation).map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    item.status === "favorable"
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {item.status === "favorable" ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <span className={`text-sm font-medium ${
                      item.status === "favorable" ? "text-green-400" : "text-red-400"
                    }`}>{item.name}</span>
                  </div>
                  <p className="text-xs text-zinc-400 ml-6">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Co-Pilot Analysis */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-2 mb-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h4 className="text-sm font-semibold text-amber-400">Financial Co-Pilot Analysis</h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {summary.favorable > summary.unfavorable
                ? `Strong performance in FY${selectedYear}. Revenue beat budget by ${pct(Math.abs(varianceData[0]?.variancePct || 0))} driven by enterprise expansion. Consider reinvesting favorable variances into growth initiatives.`
                : `Mixed performance in FY${selectedYear}. While revenue met targets, operating expenses exceeded budget. Recommend operational efficiency review and cost containment measures for next planning cycle.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Revenue Bridge Analysis</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Year-over-year revenue drivers</p>
          </div>
        </div>

        <div className="flex items-end justify-between h-48 gap-4">
          {waterfallData.map((item, idx) => {
            const maxValue = Math.max(...waterfallData.map(d => d.value));
            const height = (Math.abs(item.value) / maxValue) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <span className="text-xs text-zinc-400 mb-2">{fmt(item.value, currency)}</span>
                <div className="w-full flex flex-col items-center" style={{ height: `${height}%`, minHeight: "40px" }}>
                  <div
                    className={`w-full rounded-t-lg ${
                      item.type === "start" || item.type === "end"
                        ? "bg-gradient-to-t from-blue-600 to-blue-400"
                        : item.type === "positive"
                        ? "bg-gradient-to-t from-green-600 to-green-400"
                        : "bg-gradient-to-t from-red-600 to-red-400"
                    }`}
                    style={{ height: "100%" }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 mt-2 text-center max-w-[80px]">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
