"use client";

import { useState } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface ComparableValuationProps {
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

// Generate comparable companies data
function generateComparables(analysis: AnalysisResult) {
  const baseRevenue = analysis.baseCase.yearlyFinancials[0]?.revenue || 1000000;
  const baseEbitda = analysis.baseCase.yearlyFinancials[0]?.ebitda || 100000;
  const baseEbitdaMargin = baseEbitda / baseRevenue;

  // Simulated comparable companies
  const comparables = [
    {
      name: "TechCorp Alpha",
      ticker: "TCHA",
      marketCap: baseRevenue * 4.2,
      ev: baseRevenue * 4.5,
      revenue: baseRevenue * 0.85,
      ebitda: baseRevenue * 0.85 * 0.22,
      netIncome: baseRevenue * 0.85 * 0.12,
      evRevenue: 4.5 / 0.85,
      evEbitda: 4.5 / (0.85 * 0.22),
      peRatio: 4.2 / (0.85 * 0.12),
      revenueGrowth: 0.18,
      ebitdaMargin: 0.22,
    },
    {
      name: "InnovateSoft Inc",
      ticker: "ISOFT",
      marketCap: baseRevenue * 5.8,
      ev: baseRevenue * 6.2,
      revenue: baseRevenue * 1.2,
      ebitda: baseRevenue * 1.2 * 0.25,
      netIncome: baseRevenue * 1.2 * 0.14,
      evRevenue: 6.2 / 1.2,
      evEbitda: 6.2 / (1.2 * 0.25),
      peRatio: 5.8 / (1.2 * 0.14),
      revenueGrowth: 0.25,
      ebitdaMargin: 0.25,
    },
    {
      name: "DataDriven Corp",
      ticker: "DDC",
      marketCap: baseRevenue * 3.5,
      ev: baseRevenue * 3.8,
      revenue: baseRevenue * 0.95,
      ebitda: baseRevenue * 0.95 * 0.18,
      netIncome: baseRevenue * 0.95 * 0.09,
      evRevenue: 3.8 / 0.95,
      evEbitda: 3.8 / (0.95 * 0.18),
      peRatio: 3.5 / (0.95 * 0.09),
      revenueGrowth: 0.12,
      ebitdaMargin: 0.18,
    },
    {
      name: "CloudScale Systems",
      ticker: "CSYS",
      marketCap: baseRevenue * 7.2,
      ev: baseRevenue * 7.5,
      revenue: baseRevenue * 1.5,
      ebitda: baseRevenue * 1.5 * 0.28,
      netIncome: baseRevenue * 1.5 * 0.16,
      evRevenue: 7.5 / 1.5,
      evEbitda: 7.5 / (1.5 * 0.28),
      peRatio: 7.2 / (1.5 * 0.16),
      revenueGrowth: 0.32,
      ebitdaMargin: 0.28,
    },
    {
      name: "Enterprise Logic",
      ticker: "ELGC",
      marketCap: baseRevenue * 2.8,
      ev: baseRevenue * 3.1,
      revenue: baseRevenue * 0.7,
      ebitda: baseRevenue * 0.7 * 0.15,
      netIncome: baseRevenue * 0.7 * 0.07,
      evRevenue: 3.1 / 0.7,
      evEbitda: 3.1 / (0.7 * 0.15),
      peRatio: 2.8 / (0.7 * 0.07),
      revenueGrowth: 0.08,
      ebitdaMargin: 0.15,
    },
  ];

  // Calculate median multiples
  const evRevenueMultiples = comparables.map(c => c.evRevenue).sort((a, b) => a - b);
  const evEbitdaMultiples = comparables.map(c => c.evEbitda).sort((a, b) => a - b);
  const peMultiples = comparables.map(c => c.peRatio).sort((a, b) => a - b);

  const medianEvRevenue = evRevenueMultiples[Math.floor(evRevenueMultiples.length / 2)];
  const medianEvEbitda = evEbitdaMultiples[Math.floor(evEbitdaMultiples.length / 2)];
  const medianPe = peMultiples[Math.floor(peMultiples.length / 2)];

  // Implied valuations
  const impliedFromEvRevenue = medianEvRevenue * baseRevenue;
  const impliedFromEvEbitda = medianEvEbitda * baseEbitda;
  const impliedFromPe = medianPe * baseEbitda * 0.6; // Assume net income is 60% of EBITDA

  return {
    comparables,
    medians: {
      evRevenue: medianEvRevenue,
      evEbitda: medianEvEbitda,
      pe: medianPe,
    },
    ranges: {
      evRevenue: { min: Math.min(...evRevenueMultiples), max: Math.max(...evRevenueMultiples) },
      evEbitda: { min: Math.min(...evEbitdaMultiples), max: Math.max(...evEbitdaMultiples) },
      pe: { min: Math.min(...peMultiples), max: Math.max(...peMultiples) },
    },
    impliedValuations: {
      evRevenue: impliedFromEvRevenue,
      evEbitda: impliedFromEvEbitda,
      pe: impliedFromPe,
    },
    targetMetrics: {
      revenue: baseRevenue,
      ebitda: baseEbitda,
      ebitdaMargin: baseEbitdaMargin,
    },
  };
}

// Generate precedent transactions
function generatePrecedentTransactions(analysis: AnalysisResult) {
  const baseRevenue = analysis.baseCase.yearlyFinancials[0]?.revenue || 1000000;

  return [
    {
      date: "2024-Q3",
      target: "SaaSCloud Inc",
      acquirer: "TechGiant Corp",
      dealValue: baseRevenue * 5.2,
      evRevenue: 5.8,
      evEbitda: 22.5,
      premium: 0.32,
      dealType: "Strategic",
    },
    {
      date: "2024-Q2",
      target: "DataFlow Systems",
      acquirer: "Private Equity Fund",
      dealValue: baseRevenue * 3.8,
      evRevenue: 4.2,
      evEbitda: 18.0,
      premium: 0.25,
      dealType: "Financial",
    },
    {
      date: "2024-Q1",
      target: "CloudMetrics Ltd",
      acquirer: "Enterprise Software Inc",
      dealValue: baseRevenue * 6.5,
      evRevenue: 7.2,
      evEbitda: 28.0,
      premium: 0.45,
      dealType: "Strategic",
    },
    {
      date: "2023-Q4",
      target: "AnalyticsPro",
      acquirer: "Growth Partners LP",
      dealValue: baseRevenue * 4.1,
      evRevenue: 4.5,
      evEbitda: 19.5,
      premium: 0.28,
      dealType: "Financial",
    },
  ];
}

// Football field chart
function FootballField({ analysis, compData, currency }: {
  analysis: AnalysisResult;
  compData: ReturnType<typeof generateComparables>;
  currency: string;
}) {
  const dcfValue = analysis.baseCase.dcfValuation.enterpriseValue;
  const impliedValues = compData.impliedValuations;

  const valuations = [
    { label: "DCF", value: dcfValue, low: dcfValue * 0.85, high: dcfValue * 1.15, color: "#f59e0b" },
    { label: "EV/Revenue", value: impliedValues.evRevenue, low: impliedValues.evRevenue * 0.8, high: impliedValues.evRevenue * 1.2, color: "#3b82f6" },
    { label: "EV/EBITDA", value: impliedValues.evEbitda, low: impliedValues.evEbitda * 0.75, high: impliedValues.evEbitda * 1.25, color: "#8b5cf6" },
    { label: "P/E Multiple", value: impliedValues.pe, low: impliedValues.pe * 0.7, high: impliedValues.pe * 1.3, color: "#22c55e" },
  ];

  const allValues = valuations.flatMap(v => [v.low, v.high]);
  const minValue = Math.min(...allValues) * 0.9;
  const maxValue = Math.max(...allValues) * 1.1;
  const range = maxValue - minValue;

  const getPosition = (value: number) => ((value - minValue) / range) * 100;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-2">Valuation Football Field</h3>
      <p className="text-sm text-zinc-400 mb-6">Comparison of valuation methodologies</p>

      <div className="space-y-4">
        {valuations.map((val, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-24 text-sm text-zinc-400">{val.label}</div>
            <div className="flex-1 relative h-8 bg-zinc-800 rounded">
              {/* Range bar */}
              <div
                className="absolute h-full rounded opacity-30"
                style={{
                  left: `${getPosition(val.low)}%`,
                  width: `${getPosition(val.high) - getPosition(val.low)}%`,
                  backgroundColor: val.color,
                }}
              />
              {/* Center line */}
              <div
                className="absolute w-1 h-full rounded"
                style={{
                  left: `${getPosition(val.value)}%`,
                  backgroundColor: val.color,
                }}
              />
              {/* Value label */}
              <div
                className="absolute top-1/2 -translate-y-1/2 text-xs font-mono px-1 rounded"
                style={{
                  left: `${getPosition(val.value)}%`,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: val.color,
                  color: "#000",
                }}
              >
                {formatCurrency(val.value, currency)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scale */}
      <div className="flex justify-between mt-4 text-xs text-zinc-500">
        <span>{formatCurrency(minValue, currency)}</span>
        <span>{formatCurrency(maxValue, currency)}</span>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Weighted Average Valuation</span>
          <span className="text-xl font-bold text-amber-400">
            {formatCurrency(
              valuations.reduce((sum, v) => sum + v.value, 0) / valuations.length,
              currency
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ComparableValuation({ analysis, currency }: ComparableValuationProps) {
  const [activeTab, setActiveTab] = useState<'comps' | 'transactions' | 'summary'>('comps');
  const compData = generateComparables(analysis);
  const transactions = generatePrecedentTransactions(analysis);

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {[
          { id: 'comps' as const, label: 'Comparable Companies' },
          { id: 'transactions' as const, label: 'Precedent Transactions' },
          { id: 'summary' as const, label: 'Valuation Summary' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'comps' && (
        <>
          {/* Comparable Companies Table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Comparable Public Companies</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 text-zinc-500">Company</th>
                    <th className="text-right py-2 text-zinc-500">Market Cap</th>
                    <th className="text-right py-2 text-zinc-500">EV/Revenue</th>
                    <th className="text-right py-2 text-zinc-500">EV/EBITDA</th>
                    <th className="text-right py-2 text-zinc-500">P/E</th>
                    <th className="text-right py-2 text-zinc-500">Growth</th>
                    <th className="text-right py-2 text-zinc-500">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {compData.comparables.map((comp, idx) => (
                    <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3">
                        <div className="font-medium text-white">{comp.name}</div>
                        <div className="text-xs text-zinc-500">{comp.ticker}</div>
                      </td>
                      <td className="py-3 text-right text-zinc-300">{formatCurrency(comp.marketCap, currency)}</td>
                      <td className="py-3 text-right font-mono text-blue-400">{comp.evRevenue.toFixed(1)}x</td>
                      <td className="py-3 text-right font-mono text-purple-400">{comp.evEbitda.toFixed(1)}x</td>
                      <td className="py-3 text-right font-mono text-green-400">{comp.peRatio.toFixed(1)}x</td>
                      <td className="py-3 text-right text-zinc-300">{(comp.revenueGrowth * 100).toFixed(0)}%</td>
                      <td className="py-3 text-right text-zinc-300">{(comp.ebitdaMargin * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-zinc-700 bg-zinc-800/30">
                    <td className="py-3 font-semibold text-amber-400">Median</td>
                    <td className="py-3"></td>
                    <td className="py-3 text-right font-mono font-bold text-blue-400">{compData.medians.evRevenue.toFixed(1)}x</td>
                    <td className="py-3 text-right font-mono font-bold text-purple-400">{compData.medians.evEbitda.toFixed(1)}x</td>
                    <td className="py-3 text-right font-mono font-bold text-green-400">{compData.medians.pe.toFixed(1)}x</td>
                    <td className="py-3"></td>
                    <td className="py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Implied Valuations */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
              <div className="text-xs text-blue-400/70 uppercase tracking-wider">EV/Revenue Implied</div>
              <div className="text-2xl font-bold text-blue-400 mt-2">
                {formatCurrency(compData.impliedValuations.evRevenue, currency)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {compData.medians.evRevenue.toFixed(1)}x × {formatCurrency(compData.targetMetrics.revenue, currency)}
              </div>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5">
              <div className="text-xs text-purple-400/70 uppercase tracking-wider">EV/EBITDA Implied</div>
              <div className="text-2xl font-bold text-purple-400 mt-2">
                {formatCurrency(compData.impliedValuations.evEbitda, currency)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {compData.medians.evEbitda.toFixed(1)}x × {formatCurrency(compData.targetMetrics.ebitda, currency)}
              </div>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5">
              <div className="text-xs text-green-400/70 uppercase tracking-wider">P/E Implied</div>
              <div className="text-2xl font-bold text-green-400 mt-2">
                {formatCurrency(compData.impliedValuations.pe, currency)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {compData.medians.pe.toFixed(1)}x × Est. Net Income
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'transactions' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Precedent M&A Transactions</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 text-zinc-500">Date</th>
                  <th className="text-left py-2 text-zinc-500">Target</th>
                  <th className="text-left py-2 text-zinc-500">Acquirer</th>
                  <th className="text-right py-2 text-zinc-500">Deal Value</th>
                  <th className="text-right py-2 text-zinc-500">EV/Rev</th>
                  <th className="text-right py-2 text-zinc-500">EV/EBITDA</th>
                  <th className="text-right py-2 text-zinc-500">Premium</th>
                  <th className="text-center py-2 text-zinc-500">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-3 text-zinc-400">{tx.date}</td>
                    <td className="py-3 font-medium text-white">{tx.target}</td>
                    <td className="py-3 text-zinc-300">{tx.acquirer}</td>
                    <td className="py-3 text-right text-zinc-300">{formatCurrency(tx.dealValue, currency)}</td>
                    <td className="py-3 text-right font-mono text-blue-400">{tx.evRevenue.toFixed(1)}x</td>
                    <td className="py-3 text-right font-mono text-purple-400">{tx.evEbitda.toFixed(1)}x</td>
                    <td className="py-3 text-right text-green-400">{(tx.premium * 100).toFixed(0)}%</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.dealType === 'Strategic'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {tx.dealType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 mb-2">Average Control Premium</div>
            <div className="text-xl font-bold text-green-400">
              {(transactions.reduce((sum, t) => sum + t.premium, 0) / transactions.length * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <FootballField analysis={analysis} compData={compData} currency={currency} />
      )}
    </div>
  );
}
