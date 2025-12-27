"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadInputs } from "@/lib/storage";
import { computeForecast, ForecastResult } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { AnalysisSession } from "@/lib/schema";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";

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
        <p className="text-foreground-muted">Loading...</p>
      </div>
    );
  }

  // Empty state
  if (!inputs || !forecast) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
              <svg
                className="h-6 w-6 text-foreground-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-section text-foreground">No analysis data</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              Enter your financial inputs to generate a forecast analysis
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => router.push("/inputs")}>
                Go to Inputs
              </Button>
              <Button variant="secondary" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { yearly, summary, ratios } = forecast;
  const currency = inputs.currency;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-foreground-muted">Revenue (Year 1)</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(summary.revenueYear1, currency, { compact: true })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-foreground-muted">Revenue (Year {inputs.yearsForward})</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(summary.revenueYearN, currency, { compact: true })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-foreground-muted">Total Net Income</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(summary.totalNetIncome, currency, { compact: true })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-foreground-muted">Cash Generation</p>
            <p className={`mt-1 text-2xl font-semibold ${summary.totalCashProxy >= 0 ? "text-success" : "text-danger"}`}>
              {formatCurrency(summary.totalCashProxy, currency, { compact: true })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Ratios */}
      <Card>
        <CardHeader>
          <h2 className="text-section text-foreground">Key Ratios</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {formatPercent(ratios.grossMarginPct)}
              </p>
              <p className="mt-1 text-sm text-foreground-muted">Gross Margin</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {formatPercent(ratios.ebitMarginPct)}
              </p>
              <p className="mt-1 text-sm text-foreground-muted">EBIT Margin</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {formatPercent(ratios.netMarginPct)}
              </p>
              <p className="mt-1 text-sm text-foreground-muted">Net Margin</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Forecast Table */}
      <Card>
        <CardHeader>
          <h2 className="text-section text-foreground">Yearly Forecast</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-medium text-foreground">Year</th>
                <th className="py-3 text-right font-medium text-foreground">Revenue</th>
                <th className="py-3 text-right font-medium text-foreground">Gross Profit</th>
                <th className="py-3 text-right font-medium text-foreground">EBIT</th>
                <th className="py-3 text-right font-medium text-foreground">Net Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {yearly.map((row) => (
                <tr key={row.year} className="hover:bg-surface-2 transition-colors">
                  <td className="py-3 font-medium text-foreground">{row.year}</td>
                  <td className="py-3 text-right text-foreground-muted tabular-nums">
                    {formatCurrency(row.revenue, currency)}
                  </td>
                  <td className="py-3 text-right text-foreground-muted tabular-nums">
                    {formatCurrency(row.grossProfit, currency)}
                  </td>
                  <td className="py-3 text-right text-foreground-muted tabular-nums">
                    {formatCurrency(row.ebit, currency)}
                  </td>
                  <td className="py-3 text-right text-foreground-muted tabular-nums">
                    {formatCurrency(row.netIncome, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
