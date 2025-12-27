"use client";

import { useEffect, useState } from "react";
import { loadInputs } from "@/lib/storage";
import { computeForecast, ForecastResult } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { AnalysisSession } from "@/lib/schema";
import { Card, CardContent, Button, EmptyState } from "@/components/ui";

function generateExecutiveSummary(
  inputs: AnalysisSession,
  forecast: ForecastResult
): string[] {
  const { summary, ratios } = forecast;
  const currency = inputs.currency;
  const highlights: string[] = [];

  const revenueGrowth = ((summary.revenueYearN - summary.revenueYear1) / summary.revenueYear1) * 100;
  highlights.push(
    `Revenue projected to grow from ${formatCurrency(summary.revenueYear1, currency, { compact: true })} to ${formatCurrency(summary.revenueYearN, currency, { compact: true })} over ${inputs.yearsForward} years (${formatPercent(revenueGrowth, { showSign: true })} total growth)`
  );

  highlights.push(
    `Average gross margin of ${formatPercent(ratios.grossMarginPct)} maintained throughout forecast period`
  );
  highlights.push(
    `EBIT margin averages ${formatPercent(ratios.ebitMarginPct)}, indicating ${ratios.ebitMarginPct > 15 ? "strong" : ratios.ebitMarginPct > 10 ? "healthy" : "modest"} operational efficiency`
  );

  highlights.push(
    `Total projected net income of ${formatCurrency(summary.totalNetIncome, currency, { compact: true })} over the forecast period`
  );

  if (summary.totalCashProxy > 0) {
    highlights.push(
      `Positive cash generation of ${formatCurrency(Math.abs(summary.totalCashProxy), currency, { compact: true })} after capital expenditures`
    );
  } else {
    highlights.push(
      `Cash position requires ${formatCurrency(Math.abs(summary.totalCashProxy), currency, { compact: true })} in financing to cover capital expenditures`
    );
  }

  return highlights;
}

export function ReportsView() {
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
        <p className="text-foreground-muted">Loading...</p>
      </div>
    );
  }

  if (!inputs || !forecast) {
    return (
      <EmptyState
        icon={
          <svg
            className="h-7 w-7 text-foreground-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
        title="No report data available"
        description="Enter your financial inputs to generate a professional financial report ready for export."
        primaryAction={{ label: "Enter Inputs", href: "/inputs" }}
        secondaryAction={{ label: "Go to Dashboard", href: "/dashboard" }}
      />
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
      <div className="mb-6 flex justify-end print:hidden">
        <Button onClick={handlePrint}>
          Print / Save as PDF
        </Button>
      </div>

      <div className="space-y-8 print:space-y-6">
        <header className="border-b border-border pb-6 print:border-gray-300">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-display text-foreground print:text-black">
                <span className="text-primary print:text-black">Lumina</span>{" "}
                <span className="text-accent print:text-black">F</span> Report
              </h1>
              <h2 className="mt-2 text-title text-foreground-muted print:text-gray-700">
                {inputs.companyName}
              </h2>
            </div>
            <div className="text-right text-sm text-foreground-muted print:text-gray-600">
              <p>{currentDate}</p>
              <p className="mt-1">
                Currency: {currency} | Horizon: {inputs.yearsForward} years
              </p>
            </div>
          </div>
        </header>

        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Executive Summary
          </h2>
          <Card className="print:border-gray-300 print:shadow-none">
            <CardContent>
              <ul className="space-y-3">
                {highlights.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 text-sm text-foreground-muted print:text-gray-700"
                  >
                    <span className="flex-shrink-0 text-accent print:text-gray-500">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Financial Forecast
          </h2>
          <Card className="print:border-gray-300 print:shadow-none">
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm print:text-xs">
                <thead>
                  <tr className="border-b border-border print:border-gray-300">
                    <th className="py-3 text-left font-medium text-foreground print:text-black">
                      Year
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Revenue
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Gross Profit
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      EBIT
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Net Income
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-gray-200">
                  {yearly.map((row, idx) => (
                    <tr key={row.year} className={idx % 2 === 1 ? "bg-surface-2 print:bg-gray-50" : ""}>
                      <td className="py-3 font-medium text-foreground print:text-black">
                        {row.year}
                      </td>
                      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                        {formatCurrency(row.revenue, currency)}
                      </td>
                      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                        {formatCurrency(row.grossProfit, currency)}
                      </td>
                      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                        {formatCurrency(row.ebit, currency)}
                      </td>
                      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                        {formatCurrency(row.netIncome, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Key Assumptions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            <Card className="print:border-gray-300 print:shadow-none">
              <CardContent>
                <h3 className="text-sm font-medium text-foreground print:text-black">
                  Growth & Revenue
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Base Revenue</dt>
                    <dd className="font-medium text-foreground tabular-nums print:text-black">
                      {formatCurrency(inputs.currentRevenue, currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Annual Growth</dt>
                    <dd className="font-medium text-foreground print:text-black">
                      {formatPercent(inputs.revenueGrowthAssumption)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="print:border-gray-300 print:shadow-none">
              <CardContent>
                <h3 className="text-sm font-medium text-foreground print:text-black">
                  Cost Structure
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Base COGS</dt>
                    <dd className="font-medium text-foreground tabular-nums print:text-black">
                      {formatCurrency(inputs.currentCOGS, currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Base Opex</dt>
                    <dd className="font-medium text-foreground tabular-nums print:text-black">
                      {formatCurrency(inputs.currentOpex, currency)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="print:border-gray-300 print:shadow-none">
              <CardContent>
                <h3 className="text-sm font-medium text-foreground print:text-black">
                  Financing
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Debt Outstanding</dt>
                    <dd className="font-medium text-foreground tabular-nums print:text-black">
                      {formatCurrency(inputs.debtOutstanding, currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Interest Rate</dt>
                    <dd className="font-medium text-foreground print:text-black">
                      {formatPercent(inputs.interestRatePct)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Tax Rate</dt>
                    <dd className="font-medium text-foreground print:text-black">
                      {formatPercent(inputs.taxRatePct)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="print:border-gray-300 print:shadow-none">
              <CardContent>
                <h3 className="text-sm font-medium text-foreground print:text-black">
                  Capital
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Annual Capex</dt>
                    <dd className="font-medium text-foreground tabular-nums print:text-black">
                      {formatCurrency(inputs.annualCapex, currency)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </section>

        {inputs.notes && (
          <section className="print:break-inside-avoid">
            <h2 className="mb-4 text-section text-foreground print:text-black">
              Notes
            </h2>
            <Card className="print:border-gray-300 print:shadow-none">
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-foreground-muted print:text-gray-700">
                  {inputs.notes}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        <footer className="border-t border-border pt-6 text-center text-xs text-foreground-muted print:border-gray-300 print:text-gray-500">
          <p>Generated by Lumina F</p>
        </footer>
      </div>
    </>
  );
}
