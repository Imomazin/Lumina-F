"use client";

import { useState, useMemo } from "react";
import { FinancialModel } from "@/lib/models/financial-model";
import { runFinancialAnalysis, AnalysisResult } from "@/lib/analysis/financial-engine";

interface ExecutiveReportProps {
  model: FinancialModel;
}

function formatCurrency(value: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$",
    CHF: "CHF", CNY: "¥", INR: "₹", BRL: "R$", MXN: "$", KRW: "₩",
    SGD: "S$", HKD: "HK$"
  };
  const symbol = symbols[currency] || "$";
  const absValue = Math.abs(value);

  if (absValue >= 1e9) return `${symbol}${(value / 1e9).toFixed(2)}B`;
  if (absValue >= 1e6) return `${symbol}${(value / 1e6).toFixed(2)}M`;
  if (absValue >= 1e3) return `${symbol}${(value / 1e3).toFixed(1)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function getRatingColor(rating: string): string {
  const colors: Record<string, string> = {
    "Strong Buy": "text-green-600",
    "Buy": "text-green-500",
    "Hold": "text-yellow-600",
    "Sell": "text-red-500",
    "Strong Sell": "text-red-600"
  };
  return colors[rating] || "text-gray-600";
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "text-green-600";
  if (confidence >= 60) return "text-yellow-600";
  return "text-red-500";
}

export function ExecutiveReport({ model }: ExecutiveReportProps) {
  const [showCoverPage, setShowCoverPage] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<string>("base");

  const analysis = useMemo(() => runFinancialAnalysis(model), [model]);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { profile } = model;
  const { dcfValuation, scenarios, executiveSummary, yearlyFinancials, ratios, industryBenchmark } = analysis;

  // Get scenario data
  const selectedScenarioData = scenarios.find(s => s.name.toLowerCase().includes(selectedScenario)) || scenarios[0];

  return (
    <>
      {/* Print Controls */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={showCoverPage}
              onChange={(e) => setShowCoverPage(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800"
            />
            Include cover page
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
          >
            <option value="base">Base Case</option>
            <option value="upside">Upside Case</option>
            <option value="downside">Downside Case</option>
            <option value="stress">Stress Test</option>
          </select>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Export PDF
        </button>
      </div>

      <div className="space-y-8 print:space-y-6">
        {/* Cover Page */}
        {showCoverPage && (
          <div className="hidden print:flex print:flex-col print:items-center print:justify-center print:min-h-screen print:text-center print:break-after-page">
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rotate-45" />
              <h1 className="text-4xl font-bold text-black">
                Executive Financial Report
              </h1>
              <div className="mt-4 h-1 w-24 bg-amber-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {profile.companyName}
            </h2>
            <p className="text-lg text-gray-600 mb-8">{profile.industry}</p>
            <div className="text-gray-600 space-y-2">
              <p>{model.profile.forecastYears}-Year Financial Projection</p>
              <p>Currency: {profile.currency}</p>
              <p>Prepared: {currentDate}</p>
            </div>
            <div className="mt-16 text-sm text-gray-500">
              <p>Generated by Lumina F</p>
              <p className="mt-2">Confidential - For Authorized Recipients Only</p>
            </div>
          </div>
        )}

        {/* Report Header */}
        <header className="border-b border-zinc-800 pb-6 print:border-gray-300">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white print:text-black">
                <span className="text-amber-400 print:text-amber-600">Lumina</span>{" "}
                <span className="text-amber-500 print:text-amber-700">F</span> Executive Report
              </h1>
              <h2 className="mt-2 text-xl text-zinc-400 print:text-gray-700">
                {profile.companyName}
              </h2>
            </div>
            <div className="text-right text-sm text-zinc-400 print:text-gray-600">
              <p>{currentDate}</p>
              <p className="mt-1">{profile.industry}</p>
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className={`text-lg font-bold ${getRatingColor(executiveSummary.investmentRating)} print:text-black`}>
                  {executiveSummary.investmentRating}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Investment Recommendation */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-lg font-semibold text-white print:text-black">
            Investment Recommendation
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
              <p className="text-sm text-zinc-400 print:text-gray-600">Rating</p>
              <p className={`mt-1 text-2xl font-bold ${getRatingColor(executiveSummary.investmentRating)} print:text-black`}>
                {executiveSummary.investmentRating}
              </p>
              <p className="mt-2 text-xs text-zinc-500 print:text-gray-500">
                Based on {model.profile.forecastYears}-year DCF analysis
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
              <p className="text-sm text-zinc-400 print:text-gray-600">Confidence Level</p>
              <p className={`mt-1 text-2xl font-bold ${getConfidenceColor(executiveSummary.confidenceLevel)} print:text-black`}>
                {executiveSummary.confidenceLevel}%
              </p>
              <p className="mt-2 text-xs text-zinc-500 print:text-gray-500">
                Model reliability score
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
              <p className="text-sm text-zinc-400 print:text-gray-600">Target Valuation</p>
              <p className="mt-1 text-2xl font-bold text-amber-400 print:text-black">
                {formatCurrency(dcfValuation.enterpriseValue, profile.currency)}
              </p>
              <p className="mt-2 text-xs text-zinc-500 print:text-gray-500">
                Enterprise Value (DCF)
              </p>
            </div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-lg font-semibold text-white print:text-black">
            Executive Summary
          </h2>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 print:border-gray-300 print:bg-gray-50">
            <p className="text-zinc-300 leading-relaxed print:text-gray-700">
              {executiveSummary.summary}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-green-400 print:text-green-700 mb-2">Key Strengths</h4>
                <ul className="space-y-1">
                  {executiveSummary.keyStrengths.map((strength, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-zinc-400 print:text-gray-600">
                      <span className="text-green-400 print:text-green-600">+</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-400 print:text-red-700 mb-2">Key Risks</h4>
                <ul className="space-y-1">
                  {executiveSummary.keyRisks.map((risk, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-zinc-400 print:text-gray-600">
                      <span className="text-red-400 print:text-red-600">!</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* DCF Valuation Summary */}
        <section className="print:break-inside-avoid print:break-before-page">
          <h2 className="mb-4 text-lg font-semibold text-white print:text-black">
            Valuation Analysis
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
              <p className="text-sm text-zinc-400 print:text-gray-600">Enterprise Value</p>
              <p className="mt-1 text-xl font-bold text-white print:text-black">
                {formatCurrency(dcfValuation.enterpriseValue, profile.currency)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
              <p className="text-sm text-zinc-400 print:text-gray-600">Equity Value</p>
              <p className="mt-1 text-xl font-bold text-white print:text-black">
                {formatCurrency(dcfValuation.equityValue, profile.currency)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
              <p className="text-sm text-zinc-400 print:text-gray-600">WACC</p>
              <p className="mt-1 text-xl font-bold text-white print:text-black">
                {formatPercent(dcfValuation.wacc)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
              <p className="text-sm text-zinc-400 print:text-gray-600">IRR</p>
              <p className="mt-1 text-xl font-bold text-white print:text-black">
                {formatPercent(dcfValuation.irr)}
              </p>
            </div>
          </div>

          {/* DCF Components */}
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
            <h3 className="text-sm font-medium text-zinc-300 print:text-gray-700 mb-4">DCF Components</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-zinc-500 print:text-gray-500">PV of Free Cash Flows</p>
                <p className="text-lg font-semibold text-white print:text-black">
                  {formatCurrency(dcfValuation.pvFreeCashFlows, profile.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 print:text-gray-500">Terminal Value (PV)</p>
                <p className="text-lg font-semibold text-white print:text-black">
                  {formatCurrency(dcfValuation.terminalValuePV, profile.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 print:text-gray-500">Terminal Value %</p>
                <p className="text-lg font-semibold text-white print:text-black">
                  {formatPercent(dcfValuation.terminalValuePV / dcfValuation.enterpriseValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Sensitivity Matrix */}
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
            <h3 className="text-sm font-medium text-zinc-300 print:text-gray-700 mb-4">
              Sensitivity Analysis (EV by WACC & Terminal Growth)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-3 text-left text-zinc-500 print:text-gray-500">WACC / TGR</th>
                    {dcfValuation.sensitivityMatrix[0]?.map((_, idx) => {
                      const tgr = 1.5 + idx * 0.5;
                      return (
                        <th key={idx} className="py-2 px-3 text-right text-zinc-500 print:text-gray-500">
                          {tgr.toFixed(1)}%
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {dcfValuation.sensitivityMatrix.map((row, rowIdx) => {
                    const wacc = (model.valuation.wacc - 2 + rowIdx) / 100;
                    return (
                      <tr key={rowIdx} className="border-t border-zinc-800 print:border-gray-200">
                        <td className="py-2 px-3 text-zinc-400 print:text-gray-600">
                          {formatPercent(wacc)}
                        </td>
                        {row.map((value, colIdx) => {
                          const isBase = rowIdx === 2 && colIdx === 2;
                          return (
                            <td
                              key={colIdx}
                              className={`py-2 px-3 text-right tabular-nums ${
                                isBase ? "bg-amber-500/20 font-bold text-amber-400 print:bg-amber-100 print:text-amber-700" : "text-zinc-300 print:text-gray-700"
                              }`}
                            >
                              {formatCurrency(value, profile.currency)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Financial Performance */}
        <section className="print:break-inside-avoid print:break-before-page">
          <h2 className="mb-4 text-lg font-semibold text-white print:text-black">
            Financial Performance Projections
          </h2>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 print:border-gray-300 print:bg-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 print:border-gray-300">
                    <th className="py-3 px-4 text-left font-medium text-zinc-400 print:text-gray-600">Metric</th>
                    {yearlyFinancials.map((yf) => (
                      <th key={yf.year} className="py-3 px-4 text-right font-medium text-zinc-400 print:text-gray-600">
                        {yf.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 print:divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-zinc-300 print:text-gray-700">Revenue</td>
                    {yearlyFinancials.map((yf) => (
                      <td key={yf.year} className="py-3 px-4 text-right tabular-nums text-zinc-300 print:text-gray-700">
                        {formatCurrency(yf.incomeStatement.revenue, profile.currency)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-zinc-300 print:text-gray-700">Gross Profit</td>
                    {yearlyFinancials.map((yf) => (
                      <td key={yf.year} className="py-3 px-4 text-right tabular-nums text-zinc-300 print:text-gray-700">
                        {formatCurrency(yf.incomeStatement.grossProfit, profile.currency)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-zinc-300 print:text-gray-700">EBITDA</td>
                    {yearlyFinancials.map((yf) => (
                      <td key={yf.year} className="py-3 px-4 text-right tabular-nums text-zinc-300 print:text-gray-700">
                        {formatCurrency(yf.incomeStatement.ebitda, profile.currency)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-zinc-300 print:text-gray-700">EBIT</td>
                    {yearlyFinancials.map((yf) => (
                      <td key={yf.year} className="py-3 px-4 text-right tabular-nums text-zinc-300 print:text-gray-700">
                        {formatCurrency(yf.incomeStatement.ebit, profile.currency)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white print:text-black">Net Income</td>
                    {yearlyFinancials.map((yf) => (
                      <td key={yf.year} className="py-3 px-4 text-right tabular-nums font-medium text-white print:text-black">
                        {formatCurrency(yf.incomeStatement.netIncome, profile.currency)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-zinc-800/30 print:bg-gray-100">
                    <td className="py-3 px-4 font-medium text-amber-400 print:text-amber-700">Free Cash Flow</td>
                    {yearlyFinancials.map((yf) => (
                      <td key={yf.year} className="py-3 px-4 text-right tabular-nums font-medium text-amber-400 print:text-amber-700">
                        {formatCurrency(yf.freeCashFlow, profile.currency)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Key Ratios */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-lg font-semibold text-white print:text-black">
            Key Financial Ratios (Average)
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 print:border-gray-300 print:bg-gray-50">
              <h4 className="text-xs font-medium text-zinc-500 print:text-gray-500 mb-3">Profitability</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Gross Margin</span>
                  <span className="text-sm font-medium text-white print:text-black">{formatPercent(ratios.grossMargin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">EBITDA Margin</span>
                  <span className="text-sm font-medium text-white print:text-black">{formatPercent(ratios.ebitdaMargin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Net Margin</span>
                  <span className="text-sm font-medium text-white print:text-black">{formatPercent(ratios.netProfitMargin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">ROIC</span>
                  <span className="text-sm font-medium text-white print:text-black">{formatPercent(ratios.roic)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 print:border-gray-300 print:bg-gray-50">
              <h4 className="text-xs font-medium text-zinc-500 print:text-gray-500 mb-3">Liquidity</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Current Ratio</span>
                  <span className="text-sm font-medium text-white print:text-black">{ratios.currentRatio.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Quick Ratio</span>
                  <span className="text-sm font-medium text-white print:text-black">{ratios.quickRatio.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Cash Ratio</span>
                  <span className="text-sm font-medium text-white print:text-black">{ratios.cashRatio.toFixed(2)}x</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 print:border-gray-300 print:bg-gray-50">
              <h4 className="text-xs font-medium text-zinc-500 print:text-gray-500 mb-3">Leverage</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Debt/Equity</span>
                  <span className="text-sm font-medium text-white print:text-black">{ratios.debtToEquity.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Debt/EBITDA</span>
                  <span className="text-sm font-medium text-white print:text-black">{ratios.debtToEbitda.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Interest Coverage</span>
                  <span className="text-sm font-medium text-white print:text-black">{ratios.interestCoverage.toFixed(1)}x</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 print:border-gray-300 print:bg-gray-50">
              <h4 className="text-xs font-medium text-zinc-500 print:text-gray-500 mb-3">Efficiency</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Asset Turnover</span>
                  <span className="text-sm font-medium text-white print:text-black">{ratios.assetTurnover.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Receivables Days</span>
                  <span className="text-sm font-medium text-white print:text-black">{ratios.receivablesDays.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400 print:text-gray-600">Payables Days</span>
                  <span className="text-sm font-medium text-white print:text-black">{ratios.payablesDays.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industry Benchmark */}
        {industryBenchmark && (
          <section className="print:break-inside-avoid">
            <h2 className="mb-4 text-lg font-semibold text-white print:text-black">
              Industry Benchmark Comparison
            </h2>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 print:border-gray-300 print:bg-gray-50">
              <p className="text-sm text-zinc-400 print:text-gray-600 mb-4">
                Comparing against {profile.industry} industry benchmarks
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700 print:border-gray-300">
                      <th className="py-2 px-3 text-left text-zinc-500 print:text-gray-500">Metric</th>
                      <th className="py-2 px-3 text-right text-zinc-500 print:text-gray-500">Company</th>
                      <th className="py-2 px-3 text-right text-zinc-500 print:text-gray-500">Industry</th>
                      <th className="py-2 px-3 text-right text-zinc-500 print:text-gray-500">vs Industry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 print:divide-gray-200">
                    <tr>
                      <td className="py-2 px-3 text-zinc-300 print:text-gray-700">Gross Margin</td>
                      <td className="py-2 px-3 text-right text-zinc-300 print:text-gray-700">{formatPercent(ratios.grossMargin)}</td>
                      <td className="py-2 px-3 text-right text-zinc-400 print:text-gray-600">{formatPercent(industryBenchmark.grossMargin)}</td>
                      <td className={`py-2 px-3 text-right font-medium ${ratios.grossMargin >= industryBenchmark.grossMargin ? "text-green-400 print:text-green-600" : "text-red-400 print:text-red-600"}`}>
                        {ratios.grossMargin >= industryBenchmark.grossMargin ? "+" : ""}{((ratios.grossMargin - industryBenchmark.grossMargin) * 100).toFixed(1)}pp
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-zinc-300 print:text-gray-700">EBITDA Margin</td>
                      <td className="py-2 px-3 text-right text-zinc-300 print:text-gray-700">{formatPercent(ratios.ebitdaMargin)}</td>
                      <td className="py-2 px-3 text-right text-zinc-400 print:text-gray-600">{formatPercent(industryBenchmark.ebitdaMargin)}</td>
                      <td className={`py-2 px-3 text-right font-medium ${ratios.ebitdaMargin >= industryBenchmark.ebitdaMargin ? "text-green-400 print:text-green-600" : "text-red-400 print:text-red-600"}`}>
                        {ratios.ebitdaMargin >= industryBenchmark.ebitdaMargin ? "+" : ""}{((ratios.ebitdaMargin - industryBenchmark.ebitdaMargin) * 100).toFixed(1)}pp
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-zinc-300 print:text-gray-700">Net Margin</td>
                      <td className="py-2 px-3 text-right text-zinc-300 print:text-gray-700">{formatPercent(ratios.netProfitMargin)}</td>
                      <td className="py-2 px-3 text-right text-zinc-400 print:text-gray-600">{formatPercent(industryBenchmark.netMargin)}</td>
                      <td className={`py-2 px-3 text-right font-medium ${ratios.netProfitMargin >= industryBenchmark.netMargin ? "text-green-400 print:text-green-600" : "text-red-400 print:text-red-600"}`}>
                        {ratios.netProfitMargin >= industryBenchmark.netMargin ? "+" : ""}{((ratios.netProfitMargin - industryBenchmark.netMargin) * 100).toFixed(1)}pp
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-zinc-300 print:text-gray-700">ROIC</td>
                      <td className="py-2 px-3 text-right text-zinc-300 print:text-gray-700">{formatPercent(ratios.roic)}</td>
                      <td className="py-2 px-3 text-right text-zinc-400 print:text-gray-600">{formatPercent(industryBenchmark.roic)}</td>
                      <td className={`py-2 px-3 text-right font-medium ${ratios.roic >= industryBenchmark.roic ? "text-green-400 print:text-green-600" : "text-red-400 print:text-red-600"}`}>
                        {ratios.roic >= industryBenchmark.roic ? "+" : ""}{((ratios.roic - industryBenchmark.roic) * 100).toFixed(1)}pp
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Scenario Analysis */}
        <section className="print:break-inside-avoid print:break-before-page">
          <h2 className="mb-4 text-lg font-semibold text-white print:text-black">
            Scenario Analysis
          </h2>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 print:border-gray-300 print:bg-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 print:border-gray-300">
                    <th className="py-3 px-4 text-left font-medium text-zinc-400 print:text-gray-600">Scenario</th>
                    <th className="py-3 px-4 text-right font-medium text-zinc-400 print:text-gray-600">Probability</th>
                    <th className="py-3 px-4 text-right font-medium text-zinc-400 print:text-gray-600">Revenue (Final)</th>
                    <th className="py-3 px-4 text-right font-medium text-zinc-400 print:text-gray-600">EBITDA Margin</th>
                    <th className="py-3 px-4 text-right font-medium text-zinc-400 print:text-gray-600">Enterprise Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 print:divide-gray-200">
                  {scenarios.map((scenario) => {
                    const isBase = scenario.name.toLowerCase().includes("base");
                    return (
                      <tr key={scenario.name} className={isBase ? "bg-amber-500/10 print:bg-amber-50" : ""}>
                        <td className="py-3 px-4 text-zinc-300 print:text-gray-700 font-medium">
                          {scenario.name}
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-400 print:text-gray-600">
                          {formatPercent(scenario.probability)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-zinc-300 print:text-gray-700">
                          {formatCurrency(scenario.metrics.finalYearRevenue, profile.currency)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-zinc-300 print:text-gray-700">
                          {formatPercent(scenario.metrics.avgEbitdaMargin)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-medium text-white print:text-black">
                          {formatCurrency(scenario.metrics.enterpriseValue, profile.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-zinc-700 print:border-gray-400">
                  <tr className="font-semibold">
                    <td className="py-3 px-4 text-amber-400 print:text-amber-700">Probability-Weighted</td>
                    <td className="py-3 px-4 text-right text-zinc-400 print:text-gray-600">100%</td>
                    <td className="py-3 px-4 text-right tabular-nums text-amber-400 print:text-amber-700">
                      {formatCurrency(
                        scenarios.reduce((sum, s) => sum + s.metrics.finalYearRevenue * s.probability, 0),
                        profile.currency
                      )}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-amber-400 print:text-amber-700">
                      {formatPercent(
                        scenarios.reduce((sum, s) => sum + s.metrics.avgEbitdaMargin * s.probability, 0)
                      )}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-amber-400 print:text-amber-700">
                      {formatCurrency(
                        scenarios.reduce((sum, s) => sum + s.metrics.enterpriseValue * s.probability, 0),
                        profile.currency
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-lg font-semibold text-white print:text-black">
            Strategic Recommendations
          </h2>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 print:border-gray-300 print:bg-gray-50">
            <ul className="space-y-3">
              {executiveSummary.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-zinc-300 print:text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-medium print:bg-amber-100 print:text-amber-700">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="print:break-inside-avoid">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 print:border-gray-300 print:bg-gray-50">
            <h3 className="text-sm font-medium text-amber-400 print:text-amber-700">Important Disclaimer</h3>
            <p className="mt-2 text-xs text-zinc-400 print:text-gray-600 leading-relaxed">
              This financial analysis report is based on assumptions and projections provided and is intended
              for informational and planning purposes only. The projections and valuations presented are
              forward-looking and subject to significant uncertainty. Actual results may differ materially
              from these projections due to market conditions, competitive dynamics, regulatory changes,
              and other unforeseen factors. This report does not constitute financial, investment, legal,
              or tax advice. Recipients should conduct their own due diligence and consult with qualified
              professionals before making any investment or business decisions based on this report.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 pt-6 text-center print:border-gray-300">
          <p className="text-xs text-zinc-500 print:text-gray-500">
            Generated by Lumina F | {currentDate}
          </p>
          <p className="mt-1 text-xs text-zinc-600 print:text-gray-400">
            Confidential - For Authorized Recipients Only
          </p>
        </footer>
      </div>
    </>
  );
}
