"use client";

import { useEffect, useState } from "react";
import { loadInputs } from "@/lib/storage";
import { computeForecast, ForecastResult, YearlyMetrics } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { AnalysisSession, CurrencyCode } from "@/lib/schema";
import { Card, CardContent, Button, EmptyState, Badge, LimitationsStatement } from "@/components/ui";

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
    `Average gross margin of ${formatPercent(ratios.grossMarginPct)} maintained throughout projection period`
  );
  highlights.push(
    `EBIT margin averages ${formatPercent(ratios.ebitMarginPct)}, indicating ${ratios.ebitMarginPct > 15 ? "strong" : ratios.ebitMarginPct > 10 ? "healthy" : "modest"} operational efficiency`
  );

  highlights.push(
    `Total projected net income of ${formatCurrency(summary.totalNetIncome, currency, { compact: true })} over the projection period`
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

interface MarginTableRowProps {
  row: YearlyMetrics;
}

function MarginTableRow({ row }: MarginTableRowProps) {
  const grossMargin = row.revenue > 0 ? (row.grossProfit / row.revenue) * 100 : 0;
  const ebitMargin = row.revenue > 0 ? (row.ebit / row.revenue) * 100 : 0;
  const netMargin = row.revenue > 0 ? (row.netIncome / row.revenue) * 100 : 0;

  return (
    <tr>
      <td className="py-3 font-medium text-foreground print:text-black">
        {row.year}
      </td>
      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
        {formatPercent(grossMargin)}
      </td>
      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
        {formatPercent(ebitMargin)}
      </td>
      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
        {formatPercent(netMargin)}
      </td>
    </tr>
  );
}

interface CashFlowRowProps {
  row: YearlyMetrics;
  currency: CurrencyCode;
  capex: number;
}

function CashFlowRow({ row, currency, capex }: CashFlowRowProps) {
  // cashProxy is already netIncome - capex, so freeCashFlow = cashProxy
  const freeCashFlow = row.cashProxy;

  return (
    <tr>
      <td className="py-3 font-medium text-foreground print:text-black">
        {row.year}
      </td>
      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
        {formatCurrency(row.netIncome, currency)}
      </td>
      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
        ({formatCurrency(capex, currency)})
      </td>
      <td className={`py-3 text-right tabular-nums font-medium ${freeCashFlow >= 0 ? "text-success" : "text-danger"} print:text-gray-700`}>
        {formatCurrency(freeCashFlow, currency)}
      </td>
    </tr>
  );
}

export function ReportsView() {
  const [inputs, setInputs] = useState<AnalysisSession | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCoverPage, setShowCoverPage] = useState(true);

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

  const { yearly, summary, ratios } = forecast;
  const currency = inputs.currency;
  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const highlights = generateExecutiveSummary(inputs, forecast);

  return (
    <>
      {/* Print Controls */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground-muted">
            <input
              type="checkbox"
              checked={showCoverPage}
              onChange={(e) => setShowCoverPage(e.target.checked)}
              className="rounded border-border"
            />
            Include cover page
          </label>
        </div>
        <Button onClick={handlePrint}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Export PDF
        </Button>
      </div>

      <div className="space-y-8 print:space-y-6">
        {/* Cover Page */}
        {showCoverPage && (
          <div className="hidden print:block print-cover">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-black">
                Financial Analysis Report
              </h1>
              <div className="mt-4 h-1 w-24 bg-gray-300 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">
              {inputs.companyName}
            </h2>
            <div className="text-gray-600 space-y-2">
              <p>{inputs.yearsForward}-Year Projection</p>
              <p>Currency: {currency}</p>
              <p>Prepared: {currentDate}</p>
            </div>
            <div className="mt-16 text-sm text-gray-500">
              <p>Generated by Lumina F</p>
              <p className="mt-2">Confidential - For Internal Use Only</p>
            </div>
          </div>
        )}

        {/* Report Header */}
        <header className="border-b border-border pb-6 print:border-gray-300 print:pt-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-display text-foreground print:text-black print:text-2xl">
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
              <Badge variant="default" className="mt-2">Draft</Badge>
            </div>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Executive Summary
          </h2>
          <Card className="print:border-gray-300 print:shadow-none print-card">
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

        {/* Key Metrics Summary */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Key Metrics at a Glance
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
            <Card className="print:border-gray-300 print:shadow-none print-card">
              <CardContent className="text-center">
                <p className="text-sm text-foreground-muted print:text-gray-600">Total Revenue</p>
                <p className="mt-1 text-xl font-bold text-foreground print:text-black">
                  {formatCurrency(yearly.reduce((sum, row) => sum + row.revenue, 0), currency, { compact: true })}
                </p>
              </CardContent>
            </Card>
            <Card className="print:border-gray-300 print:shadow-none print-card">
              <CardContent className="text-center">
                <p className="text-sm text-foreground-muted print:text-gray-600">Total Net Income</p>
                <p className="mt-1 text-xl font-bold text-foreground print:text-black">
                  {formatCurrency(summary.totalNetIncome, currency, { compact: true })}
                </p>
              </CardContent>
            </Card>
            <Card className="print:border-gray-300 print:shadow-none print-card">
              <CardContent className="text-center">
                <p className="text-sm text-foreground-muted print:text-gray-600">Avg Gross Margin</p>
                <p className="mt-1 text-xl font-bold text-foreground print:text-black">
                  {formatPercent(ratios.grossMarginPct)}
                </p>
              </CardContent>
            </Card>
            <Card className="print:border-gray-300 print:shadow-none print-card">
              <CardContent className="text-center">
                <p className="text-sm text-foreground-muted print:text-gray-600">Avg EBIT Margin</p>
                <p className="mt-1 text-xl font-bold text-foreground print:text-black">
                  {formatPercent(ratios.ebitMarginPct)}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Income Statement Projection */}
        <section className="print:break-inside-avoid print-page-break">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Income Statement Projection
          </h2>
          <Card className="print:border-gray-300 print:shadow-none print-card">
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
                      COGS
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Gross Profit
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Opex
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
                        ({formatCurrency(row.cogs, currency)})
                      </td>
                      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                        {formatCurrency(row.grossProfit, currency)}
                      </td>
                      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                        ({formatCurrency(row.opex, currency)})
                      </td>
                      <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                        {formatCurrency(row.ebit, currency)}
                      </td>
                      <td className="py-3 text-right font-medium text-foreground tabular-nums print:text-black">
                        {formatCurrency(row.netIncome, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-border print:border-gray-400">
                  <tr className="font-semibold">
                    <td className="py-3 text-foreground print:text-black">Total</td>
                    <td className="py-3 text-right text-foreground tabular-nums print:text-black">
                      {formatCurrency(yearly.reduce((sum, row) => sum + row.revenue, 0), currency)}
                    </td>
                    <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                      —
                    </td>
                    <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                      —
                    </td>
                    <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                      —
                    </td>
                    <td className="py-3 text-right text-foreground tabular-nums print:text-black">
                      {formatCurrency(yearly.reduce((sum, row) => sum + row.ebit, 0), currency)}
                    </td>
                    <td className="py-3 text-right text-foreground tabular-nums print:text-black">
                      {formatCurrency(summary.totalNetIncome, currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Margin Analysis */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Margin Analysis
          </h2>
          <Card className="print:border-gray-300 print:shadow-none print-card">
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm print:text-xs">
                <thead>
                  <tr className="border-b border-border print:border-gray-300">
                    <th className="py-3 text-left font-medium text-foreground print:text-black">
                      Year
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Gross Margin
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      EBIT Margin
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Net Margin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-gray-200">
                  {yearly.map((row) => (
                    <MarginTableRow key={row.year} row={row} />
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-border print:border-gray-400">
                  <tr className="font-semibold">
                    <td className="py-3 text-foreground print:text-black">Average</td>
                    <td className="py-3 text-right text-foreground tabular-nums print:text-black">
                      {formatPercent(ratios.grossMarginPct)}
                    </td>
                    <td className="py-3 text-right text-foreground tabular-nums print:text-black">
                      {formatPercent(ratios.ebitMarginPct)}
                    </td>
                    <td className="py-3 text-right text-foreground tabular-nums print:text-black">
                      {formatPercent(ratios.netMarginPct)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Cash Flow Summary */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Cash Flow Summary
          </h2>
          <Card className="print:border-gray-300 print:shadow-none print-card">
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm print:text-xs">
                <thead>
                  <tr className="border-b border-border print:border-gray-300">
                    <th className="py-3 text-left font-medium text-foreground print:text-black">
                      Year
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Net Income
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Capex
                    </th>
                    <th className="py-3 text-right font-medium text-foreground print:text-black">
                      Free Cash Flow
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-gray-200">
                  {yearly.map((row) => (
                    <CashFlowRow key={row.year} row={row} currency={currency} capex={inputs.annualCapex} />
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-border print:border-gray-400">
                  <tr className="font-semibold">
                    <td className="py-3 text-foreground print:text-black">Total</td>
                    <td className="py-3 text-right text-foreground tabular-nums print:text-black">
                      {formatCurrency(summary.totalNetIncome, currency)}
                    </td>
                    <td className="py-3 text-right text-foreground-muted tabular-nums print:text-gray-700">
                      ({formatCurrency(inputs.annualCapex * inputs.yearsForward, currency)})
                    </td>
                    <td className={`py-3 text-right tabular-nums ${summary.totalCashProxy >= 0 ? "text-success" : "text-danger"} print:text-black`}>
                      {formatCurrency(summary.totalCashProxy, currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Key Assumptions */}
        <section className="print:break-inside-avoid print-page-break">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Key Assumptions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            <Card className="print:border-gray-300 print:shadow-none print-card">
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
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Projection Period</dt>
                    <dd className="font-medium text-foreground print:text-black">
                      {inputs.yearsForward} years
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="print:border-gray-300 print:shadow-none print-card">
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
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">COGS Scaling</dt>
                    <dd className="font-medium text-foreground print:text-black">
                      Proportional
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="print:border-gray-300 print:shadow-none print-card">
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

            <Card className="print:border-gray-300 print:shadow-none print-card">
              <CardContent>
                <h3 className="text-sm font-medium text-foreground print:text-black">
                  Capital Expenditure
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Annual Capex</dt>
                    <dd className="font-medium text-foreground tabular-nums print:text-black">
                      {formatCurrency(inputs.annualCapex, currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground-muted print:text-gray-600">Total Capex</dt>
                    <dd className="font-medium text-foreground tabular-nums print:text-black">
                      {formatCurrency(inputs.annualCapex * inputs.yearsForward, currency)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Notes */}
        {inputs.notes && (
          <section className="print:break-inside-avoid">
            <h2 className="mb-4 text-section text-foreground print:text-black">
              Notes & Commentary
            </h2>
            <Card className="print:border-gray-300 print:shadow-none print-card">
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-foreground-muted print:text-gray-700">
                  {inputs.notes}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Model Limitations */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-4 text-section text-foreground print:text-black">
            Model Limitations
          </h2>
          <LimitationsStatement className="print:border-gray-300 print:bg-gray-50" />
        </section>

        {/* Disclaimer */}
        <section className="print:break-inside-avoid">
          <Card className="border-warning/30 bg-warning/5 print:border-gray-300 print:bg-gray-50 print-card">
            <CardContent>
              <h3 className="text-sm font-medium text-foreground print:text-black">Disclaimer</h3>
              <p className="mt-2 text-xs text-foreground-muted print:text-gray-600">
                This financial projection is based on assumptions provided by the user and is intended
                for internal planning purposes only. Actual results may differ materially from these
                projections due to market conditions, operational factors, and other uncertainties.
                This report does not constitute financial advice or a recommendation for investment.
                All outputs are deterministic: they derive directly from stated assumptions and do not
                incorporate probabilistic forecasting or machine learning predictions.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 text-center print:border-gray-300">
          <p className="text-xs text-foreground-muted print:text-gray-500">
            Generated by Lumina F | {currentDate}
          </p>
          <p className="mt-1 text-xs text-foreground-muted/50 print:text-gray-400">
            Confidential - For Internal Use Only
          </p>
        </footer>

        {/* Print confidential watermark */}
        <div className="hidden print:block print-confidential">
          Confidential - {inputs.companyName} - {currentDate}
        </div>
      </div>
    </>
  );
}
