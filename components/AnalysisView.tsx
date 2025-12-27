"use client";

import { useEffect, useState, ReactNode } from "react";
import { loadInputs } from "@/lib/storage";
import {
  computeForecast,
  ForecastResult,
  computeValuation,
  ValuationMetrics,
  computeSensitivityAnalysis,
  SensitivityAnalysis,
  computeBreakeven,
  BreakevenResult,
} from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { AnalysisSession, CONFIDENCE_LEVELS } from "@/lib/schema";
import {
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  TriangulationPanel,
  Badge,
  MetricCard,
  MetricGrid,
} from "@/components/ui";
import {
  RevenueChart,
  ProfitChart,
  MarginChart,
  WaterfallChart,
  createPnLWaterfall,
  TornadoChart,
  TornadoCompact,
  ScenarioChart,
  ScenarioCards,
  ValuationDashboard,
} from "@/components/charts";

type AnalysisTab = "overview" | "valuation" | "scenarios" | "sensitivity";

const TABS: { id: AnalysisTab; label: string; icon: ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: "valuation",
    label: "Valuation",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "scenarios",
    label: "Scenarios",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "sensitivity",
    label: "Sensitivity",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
];

export function AnalysisView() {
  const [inputs, setInputs] = useState<AnalysisSession | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [valuation, setValuation] = useState<ValuationMetrics | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityAnalysis | null>(null);
  const [breakeven, setBreakeven] = useState<BreakevenResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");

  useEffect(() => {
    const stored = loadInputs();
    if (stored) {
      setInputs(stored.data);
      const forecastResult = computeForecast(stored.data);
      setForecast(forecastResult);

      // Compute advanced analytics
      const valuationResult = computeValuation(stored.data, forecastResult);
      setValuation(valuationResult);

      const sensitivityResult = computeSensitivityAnalysis(stored.data);
      setSensitivity(sensitivityResult);

      const breakevenResult = computeBreakeven(stored.data, forecastResult);
      setBreakeven(breakevenResult);
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-foreground-muted">Computing analysis...</p>
        </div>
      </div>
    );
  }

  if (!inputs || !forecast) {
    return (
      <EmptyState
        icon={
          <svg className="h-7 w-7 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        title="No analysis data available"
        description="Enter your financial inputs to generate comprehensive projection analysis with CFA-level metrics."
        primaryAction={{ label: "Enter Inputs", href: "/inputs" }}
        secondaryAction={{ label: "Go to Dashboard", href: "/dashboard" }}
      />
    );
  }

  const { yearly, summary, ratios } = forecast;
  const currency = inputs.currency;

  // Get year 1 data for waterfall
  const year1 = yearly[0];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground-muted hover:text-foreground hover:border-border"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Executive Summary Cards */}
          <MetricGrid columns={4}>
            <MetricCard
              label="Revenue (Year 1)"
              value={formatCurrency(summary.revenueYear1, currency, { compact: true })}
              sparkline={yearly.map((y) => y.revenue)}
              change={{
                value: ((summary.revenueYearN - summary.revenueYear1) / summary.revenueYear1) * 100,
                label: `to Year ${inputs.yearsForward}`,
              }}
            />
            <MetricCard
              label="Total Net Income"
              value={formatCurrency(summary.totalNetIncome, currency, { compact: true })}
              sparkline={yearly.map((y) => y.netIncome)}
              variant={summary.totalNetIncome >= 0 ? "success" : "danger"}
            />
            <MetricCard
              label="Gross Margin"
              value={`${ratios.grossMarginPct.toFixed(1)}%`}
              subValue="Average across projection"
            />
            <MetricCard
              label="Free Cash Flow"
              value={formatCurrency(summary.totalCashProxy, currency, { compact: true })}
              variant={summary.totalCashProxy >= 0 ? "success" : "warning"}
              subValue="After capital expenditure"
            />
          </MetricGrid>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="text-section text-foreground">Revenue Trajectory</h2>
              </CardHeader>
              <CardContent>
                <RevenueChart data={yearly} currency={currency} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-section text-foreground">P&L Waterfall (Year 1)</h2>
              </CardHeader>
              <CardContent>
                {year1 && (
                  <WaterfallChart
                    data={createPnLWaterfall(
                      year1.revenue,
                      year1.cogs,
                      year1.opex,
                      year1.interest,
                      year1.tax
                    )}
                    currency={currency}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profitability & Margins */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="text-section text-foreground">EBIT & Net Income</h2>
              </CardHeader>
              <CardContent>
                <ProfitChart data={yearly} currency={currency} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-section text-foreground">Margin Trends</h2>
              </CardHeader>
              <CardContent>
                <MarginChart data={yearly} />
              </CardContent>
            </Card>
          </div>

          {/* Key Ratios */}
          <Card>
            <CardHeader>
              <h2 className="text-section text-foreground">Key Ratios (Average)</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{ratios.grossMarginPct.toFixed(1)}%</p>
                  <p className="mt-1 text-sm text-foreground-muted">Gross Margin</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{ratios.ebitMarginPct.toFixed(1)}%</p>
                  <p className="mt-1 text-sm text-foreground-muted">EBIT Margin</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{ratios.netMarginPct.toFixed(1)}%</p>
                  <p className="mt-1 text-sm text-foreground-muted">Net Margin</p>
                </div>
                {breakeven && (
                  <>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-accent">{breakeven.contributionMarginRatio.toFixed(1)}%</p>
                      <p className="mt-1 text-sm text-foreground-muted">Contribution Margin</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-accent">{breakeven.marginOfSafetyPct.toFixed(1)}%</p>
                      <p className="mt-1 text-sm text-foreground-muted">Margin of Safety</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(breakeven.breakEvenRevenue, currency, { compact: true })}
                      </p>
                      <p className="mt-1 text-sm text-foreground-muted">Break-even Revenue</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Projection Table */}
          <Card>
            <CardHeader>
              <h2 className="text-section text-foreground">Yearly Projection</h2>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 text-left font-medium text-foreground">Year</th>
                    <th className="py-3 text-right font-medium text-foreground">Revenue</th>
                    <th className="py-3 text-right font-medium text-foreground">COGS</th>
                    <th className="py-3 text-right font-medium text-foreground">Gross Profit</th>
                    <th className="py-3 text-right font-medium text-foreground">EBIT</th>
                    <th className="py-3 text-right font-medium text-foreground">Net Income</th>
                    <th className="py-3 text-right font-medium text-foreground">FCF</th>
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
                        ({formatCurrency(row.cogs, currency)})
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
                      <td className={`py-3 text-right tabular-nums font-medium ${row.cashProxy >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrency(row.cashProxy, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Driving Assumptions */}
          <Card>
            <CardHeader>
              <h2 className="text-section text-foreground">Driving Assumptions</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AssumptionCard
                  label="Revenue Growth"
                  value={`${inputs.revenueGrowthAssumption.toFixed(1)}%`}
                  description="Annual growth rate"
                  confidence={inputs.assumptionMeta?.revenueGrowth?.confidence}
                />
                <AssumptionCard
                  label="COGS Ratio"
                  value={`${((inputs.currentCOGS / inputs.currentRevenue) * 100).toFixed(1)}%`}
                  description="Cost of goods sold"
                  confidence={inputs.assumptionMeta?.costStructure?.confidence}
                />
                <AssumptionCard
                  label="Interest Rate"
                  value={`${inputs.interestRatePct.toFixed(1)}%`}
                  description={`On ${formatCurrency(inputs.debtOutstanding, currency, { compact: true })} debt`}
                  confidence={inputs.assumptionMeta?.financing?.confidence}
                />
                <AssumptionCard
                  label="Tax Rate"
                  value={`${inputs.taxRatePct.toFixed(1)}%`}
                  description="Effective corporate rate"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Valuation Tab */}
      {activeTab === "valuation" && valuation && sensitivity && (
        <ValuationDashboard
          valuation={valuation}
          sensitivity={sensitivity}
          currency={currency}
        />
      )}

      {/* Scenarios Tab */}
      {activeTab === "scenarios" && sensitivity && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <h2 className="text-section text-foreground">Scenario Comparison</h2>
              <p className="text-sm text-foreground-muted mt-1">
                Three scenarios with different growth and risk assumptions
              </p>
            </CardHeader>
            <CardContent>
              <ScenarioCards scenarios={sensitivity.scenarios} currency={currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-section text-foreground">Revenue Projection by Scenario</h2>
            </CardHeader>
            <CardContent>
              <ScenarioChart
                scenarios={sensitivity.scenarios}
                currency={currency}
                metric="revenue"
                height={350}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-section text-foreground">Net Income by Scenario</h2>
            </CardHeader>
            <CardContent>
              <ScenarioChart
                scenarios={sensitivity.scenarios}
                currency={currency}
                metric="netIncome"
                height={350}
              />
            </CardContent>
          </Card>

          <TriangulationPanel type="strategic" title="Scenario Analysis Context">
            Scenarios reflect different assumption sets: Optimistic (higher growth, lower risk),
            Base Case (stated assumptions), and Conservative (lower growth, higher risk).
            Probability weights are illustrative and should be adjusted based on market conditions.
          </TriangulationPanel>
        </div>
      )}

      {/* Sensitivity Tab */}
      {activeTab === "sensitivity" && sensitivity && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <h2 className="text-section text-foreground">Tornado Analysis</h2>
              <p className="text-sm text-foreground-muted mt-1">
                Impact of ±25% change in key variables on Enterprise Value
              </p>
            </CardHeader>
            <CardContent>
              <TornadoChart data={sensitivity.tornado} currency={currency} height={300} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="text-section text-foreground">Key Sensitivities</h2>
              </CardHeader>
              <CardContent>
                <TornadoCompact data={sensitivity.tornado} currency={currency} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-section text-foreground">WACC Sensitivity</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sensitivity.sensitivityMatrix.wacc.map((point, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-foreground">WACC: {point.newValue.toFixed(1)}%</span>
                      <span className={`text-sm font-medium ${point.evImpact >= 0 ? "text-success" : "text-danger"}`}>
                        {point.evImpact >= 0 ? "+" : ""}{formatCurrency(point.evImpact, currency, { compact: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-section text-foreground">Revenue Growth Sensitivity</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 text-left font-medium text-foreground">Growth Rate</th>
                      <th className="py-3 text-right font-medium text-foreground">Change</th>
                      <th className="py-3 text-right font-medium text-foreground">EV Impact</th>
                      <th className="py-3 text-right font-medium text-foreground">% Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sensitivity.sensitivityMatrix.revenueGrowth.map((point, idx) => (
                      <tr key={idx} className="hover:bg-surface-2">
                        <td className="py-3 font-medium text-foreground">{point.newValue.toFixed(1)}%</td>
                        <td className="py-3 text-right text-foreground-muted">{point.percentChange >= 0 ? "+" : ""}{point.percentChange}%</td>
                        <td className={`py-3 text-right font-medium ${point.evImpact >= 0 ? "text-success" : "text-danger"}`}>
                          {point.evImpact >= 0 ? "+" : ""}{formatCurrency(point.evImpact, currency, { compact: true })}
                        </td>
                        <td className={`py-3 text-right ${point.evPercentChange >= 0 ? "text-success" : "text-danger"}`}>
                          {point.evPercentChange >= 0 ? "+" : ""}{point.evPercentChange.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <TriangulationPanel type="risk" title="Sensitivity Analysis Limitations">
            This analysis shows single-variable sensitivity. In practice, variables are often correlated
            (e.g., higher growth may require higher capex). Consider multi-factor scenarios for
            more realistic stress testing.
          </TriangulationPanel>
        </div>
      )}

      {/* Model Context Footer */}
      <TriangulationPanel type="limitation" title="Projection Methodology">
        This analysis uses deterministic modeling: outputs derive directly from stated assumptions
        with no probabilistic adjustment or machine learning. Results should be interpreted as
        scenario illustrations, not predictions.
      </TriangulationPanel>
    </div>
  );
}

// Helper component for assumption display
function AssumptionCard({
  label,
  value,
  description,
  confidence,
}: {
  label: string;
  value: string;
  description: string;
  confidence?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {confidence && (
          <Badge
            variant={
              confidence === "grounded"
                ? "success"
                : confidence === "reasoned"
                ? "default"
                : "warning"
            }
          >
            {CONFIDENCE_LEVELS.find((c) => c.value === confidence)?.label || "Reasoned"}
          </Badge>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-foreground-muted mt-1">{description}</p>
    </div>
  );
}
