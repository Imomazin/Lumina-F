"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadInputs } from "@/lib/storage";
import { computeForecast, ForecastResult } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { AnalysisSession } from "@/lib/schema";

function generateExecutiveSummary(
  inputs: AnalysisSession,
  forecast: ForecastResult
): string[] {
  const { summary, ratios } = forecast;
  const currency = inputs.currency;
  const highlights: string[] = [];

  // Revenue growth
  const revenueGrowth = ((summary.revenueYearN - summary.revenueYear1) / summary.revenueYear1) * 100;
  highlights.push(
    `Revenue projected to grow from ${formatCurrency(summary.revenueYear1, currency, { compact: true })} to ${formatCurrency(summary.revenueYearN, currency, { compact: true })} over ${inputs.yearsForward} years (${formatPercent(revenueGrowth, { showSign: true })} total growth)`
  );

  // Profitability
  highlights.push(
    `Average gross margin of ${formatPercent(ratios.grossMarginPct)} maintained throughout forecast period`
  );
  highlights.push(
    `EBIT margin averages ${formatPercent(ratios.ebitMarginPct)}, indicating ${ratios.ebitMarginPct > 15 ? "strong" : ratios.ebitMarginPct > 10 ? "healthy" : "modest"} operational efficiency`
  );

  // Net income
  highlights.push(
    `Total projected net income of ${formatCurrency(summary.totalNetIncome, currency, { compact: true })} over the forecast period`
  );

  // Cash generation
  if (summary.totalCashProxy > 0) {
    highlights.push(
      `Positive cash generation of ${formatCurrency(summary.totalCashProxy, currency, { compact: true })} after capital expenditures`
    );
  } else {
    highlights.push(
      `Cash position requires ${formatCurrency(Math.abs(summary.totalCashProxy), currency, { compact: true })} in financing to cover capital expenditures`
    );
  }

  return highlights;
}

export function ReportsView() {
  const router = useRouter();
  const [inputs, setInputs] = useState<AnalysisSession | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = loadInputs();
    if (stored) {
      setInputs(stored.data);
      const result = computeForecast(stored.data);
      setForecast(result);
    }
    setIsLoaded(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  // Empty state
  if (!inputs || !forecast) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">
          No report data available
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Enter your financial inputs to generate a report
        </p>
        <button
          onClick={() => router.push("/inputs")}
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Go to Inputs
        </button>
      </div>
    );
  }

  const { yearly } = forecast;
  const currency = inputs.currency;
  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const highlights = generateExecutiveSummary(inputs, forecast);

  return (
    <>
      {/* Print Button - hidden when printing */}
      <div className="mb-6 flex justify-end print:hidden">
        <button
          onClick={handlePrint}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Report Content */}
      <div className="space-y-8 print:space-y-6">
        {/* Cover Header */}
        <header className="border-b border-zinc-200 pb-6 dark:border-zinc-700 print:border-zinc-400">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 print:text-black">
                Lumina F Report
              </h1>
              <h2 className="mt-2 text-xl font-semibold text-zinc-700 dark:text-zinc-300 print:text-zinc-800">
                {inputs.companyName}
              </h2>
            </div>
            <div className="text-right text-sm text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
              <p>{currentDate}</p>
              <p className="mt-1">
                Currency: {currency} | Horizon: {inputs.yearsForward} years
              </p>
            </div>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
            Executive Summary
          </h2>
          <ul className="space-y-2">
            {highlights.map((point, idx) => (
              <li
                key={idx}
                className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300 print:text-zinc-800"
              >
                <span className="flex-shrink-0 text-zinc-400 print:text-zinc-600">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Financial Forecast Table */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
            Financial Forecast
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm print:text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700 print:border-zinc-400">
                  <th className="py-2 text-left font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                    Year
                  </th>
                  <th className="py-2 text-right font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                    Revenue
                  </th>
                  <th className="py-2 text-right font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                    Gross Profit
                  </th>
                  <th className="py-2 text-right font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                    EBIT
                  </th>
                  <th className="py-2 text-right font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                    Net Income
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 print:divide-zinc-200">
                {yearly.map((row) => (
                  <tr key={row.year}>
                    <td className="py-2 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                      {row.year}
                    </td>
                    <td className="py-2 text-right text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                      {formatCurrency(row.revenue, currency)}
                    </td>
                    <td className="py-2 text-right text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                      {formatCurrency(row.grossProfit, currency)}
                    </td>
                    <td className="py-2 text-right text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                      {formatCurrency(row.ebit, currency)}
                    </td>
                    <td className="py-2 text-right text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                      {formatCurrency(row.netIncome, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Assumptions */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
            Key Assumptions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 print:border-zinc-300 print:p-3">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                Growth & Revenue
              </h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                    Base Revenue
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-100 print:text-black">
                    {formatCurrency(inputs.currentRevenue, currency)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                    Annual Growth
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-100 print:text-black">
                    {formatPercent(inputs.revenueGrowthAssumption)}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 print:border-zinc-300 print:p-3">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                Cost Structure
              </h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                    Base COGS
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-100 print:text-black">
                    {formatCurrency(inputs.currentCOGS, currency)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                    Base Opex
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-100 print:text-black">
                    {formatCurrency(inputs.currentOpex, currency)}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 print:border-zinc-300 print:p-3">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                Financing
              </h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                    Debt Outstanding
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-100 print:text-black">
                    {formatCurrency(inputs.debtOutstanding, currency)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                    Interest Rate
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-100 print:text-black">
                    {formatPercent(inputs.interestRatePct)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                    Tax Rate
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-100 print:text-black">
                    {formatPercent(inputs.taxRatePct)}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 print:border-zinc-300 print:p-3">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                Capital
              </h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                    Annual Capex
                  </dt>
                  <dd className="text-zinc-900 dark:text-zinc-100 print:text-black">
                    {formatCurrency(inputs.annualCapex, currency)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Notes */}
        {inputs.notes && (
          <section className="print:break-inside-avoid">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
              Notes
            </h2>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 print:border-zinc-300">
              <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 print:text-zinc-800">
                {inputs.notes}
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500 print:border-zinc-300 print:text-zinc-500">
          <p>Generated by Lumina F</p>
        </footer>
      </div>
    </>
  );
}
