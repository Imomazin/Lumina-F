"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadInputs } from "@/lib/storage";
import { computeForecast, ForecastResult } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { AnalysisSession } from "@/lib/schema";

interface SummaryCardProps {
  label: string;
  value: string;
  subtext?: string;
}

function SummaryCard({ label, value, subtext }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {subtext && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtext}</p>
      )}
    </div>
  );
}

export function AnalysisView() {
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

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  // Empty state - no inputs
  if (!inputs || !forecast) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">
          No analysis data available
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Enter your financial inputs to generate a forecast
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

  const { summary, ratios, yearly } = forecast;
  const currency = inputs.currency;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Revenue (Year 1)"
            value={formatCurrency(summary.revenueYear1, currency, { compact: true })}
          />
          <SummaryCard
            label={`Revenue (Year ${inputs.yearsForward})`}
            value={formatCurrency(summary.revenueYearN, currency, { compact: true })}
          />
          <SummaryCard
            label="Avg. EBIT Margin"
            value={formatPercent(summary.averageEbitMargin)}
          />
          <SummaryCard
            label="Avg. Net Margin"
            value={formatPercent(summary.averageNetMargin)}
          />
        </div>
      </section>

      {/* Key Ratios */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Key Ratios
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Gross Margin"
            value={formatPercent(ratios.grossMarginPct)}
            subtext="Average across forecast period"
          />
          <SummaryCard
            label="EBIT Margin"
            value={formatPercent(ratios.ebitMarginPct)}
            subtext="Average across forecast period"
          />
          <SummaryCard
            label="Net Margin"
            value={formatPercent(ratios.netMarginPct)}
            subtext="Average across forecast period"
          />
        </div>
      </section>

      {/* Yearly Forecast Table */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Yearly Forecast
        </h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  Year
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  COGS
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  Gross Profit
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  Opex
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  EBIT
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  Net Income
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  Cash Proxy
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
              {yearly.map((row) => (
                <tr key={row.year}>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {row.year}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(row.revenue, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(row.cogs, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(row.grossProfit, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(row.opex, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(row.ebit, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(row.netIncome, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(row.cashProxy, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Totals */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Totals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard
            label="Total Net Income"
            value={formatCurrency(summary.totalNetIncome, currency, { compact: true })}
            subtext={`Over ${inputs.yearsForward} years`}
          />
          <SummaryCard
            label="Total Cash Proxy"
            value={formatCurrency(summary.totalCashProxy, currency, { compact: true })}
            subtext="Net Income minus Capex"
          />
        </div>
      </section>

      {/* Navigation */}
      <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <button
          onClick={() => router.push("/reports")}
          className="rounded-md bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Go to Reports
        </button>
      </div>
    </div>
  );
}
