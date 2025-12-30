"use client";

import { ValuationMetrics, SensitivityAnalysis } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { CurrencyCode } from "@/lib/schema";
import { Card, CardContent, CardHeader } from "@/components/ui";

interface ValuationDashboardProps {
  valuation: ValuationMetrics;
  sensitivity: SensitivityAnalysis;
  currency: CurrencyCode;
}

export function ValuationDashboard({
  valuation,
  sensitivity,
  currency,
}: ValuationDashboardProps) {
  const { dcf, duPont, leverage, efficiency, returnMetrics, eva } = valuation;

  return (
    <div className="space-y-8">
      {/* DCF Valuation Summary */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">DCF Valuation</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ValuationCard
            label="Enterprise Value"
            value={formatCurrency(dcf.enterpriseValue, currency, { compact: true })}
            sublabel="Sum of discounted cash flows"
            variant="primary"
          />
          <ValuationCard
            label="Equity Value"
            value={formatCurrency(dcf.equityValue, currency, { compact: true })}
            sublabel="EV minus net debt"
          />
          <ValuationCard
            label="Terminal Value"
            value={formatCurrency(dcf.terminalValue, currency, { compact: true })}
            sublabel={`PV: ${formatCurrency(dcf.terminalValuePV, currency, { compact: true })}`}
          />
          <ValuationCard
            label="WACC"
            value={`${dcf.wacc.toFixed(1)}%`}
            sublabel="Weighted cost of capital"
          />
        </div>

        {/* Implied Multiples */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface-2 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{dcf.impliedMultiples.evToRevenue.toFixed(1)}x</p>
            <p className="text-xs text-foreground-muted">EV/Revenue</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{dcf.impliedMultiples.evToEbitda.toFixed(1)}x</p>
            <p className="text-xs text-foreground-muted">EV/EBITDA</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{dcf.impliedMultiples.priceToEarnings.toFixed(1)}x</p>
            <p className="text-xs text-foreground-muted">P/E Ratio</p>
          </div>
        </div>
      </section>

      {/* Return Metrics */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Return Metrics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ReturnCard label="ROA" value={returnMetrics.roa} benchmark={5} />
          <ReturnCard label="ROE" value={returnMetrics.roe} benchmark={12} />
          <ReturnCard label="ROIC" value={returnMetrics.roic} benchmark={10} />
          <ReturnCard label="ROCE" value={returnMetrics.roce} benchmark={10} />
          <ValuationCard
            label="EVA"
            value={formatCurrency(eva, currency, { compact: true })}
            sublabel="Economic value added"
            variant={eva >= 0 ? "success" : "danger"}
          />
        </div>
      </section>

      {/* DuPont Analysis */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">DuPont Analysis</h3>
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <DuPontBox label="Net Profit Margin" value={`${duPont.netProfitMargin.toFixed(1)}%`} />
            <span className="text-2xl text-foreground-muted">×</span>
            <DuPontBox label="Asset Turnover" value={`${duPont.assetTurnover.toFixed(2)}x`} />
            <span className="text-2xl text-foreground-muted">×</span>
            <DuPontBox label="Equity Multiplier" value={`${duPont.equityMultiplier.toFixed(2)}x`} />
            <span className="text-2xl text-foreground-muted">=</span>
            <DuPontBox label="ROE" value={`${duPont.roe.toFixed(1)}%`} highlight />
          </div>

          {duPont.roeFiveWay && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-foreground-muted mb-4 text-center">5-Way DuPont Decomposition</p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <MiniDuPontBox label="Tax Burden" value={duPont.roeFiveWay.taxBurden.toFixed(2)} />
                <span className="text-foreground-muted">×</span>
                <MiniDuPontBox label="Interest Burden" value={duPont.roeFiveWay.interestBurden.toFixed(2)} />
                <span className="text-foreground-muted">×</span>
                <MiniDuPontBox label="Operating Margin" value={`${(duPont.roeFiveWay.operatingMargin * 100).toFixed(1)}%`} />
                <span className="text-foreground-muted">×</span>
                <MiniDuPontBox label="Asset Turnover" value={duPont.roeFiveWay.assetTurnover.toFixed(2)} />
                <span className="text-foreground-muted">×</span>
                <MiniDuPontBox label="Leverage" value={duPont.roeFiveWay.leverage.toFixed(2)} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Leverage & Efficiency */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">Leverage Metrics</h3>
          <div className="space-y-3">
            <LeverageBar label="Operating Leverage (DOL)" value={leverage.degreeOfOperatingLeverage} max={5} />
            <LeverageBar label="Financial Leverage (DFL)" value={leverage.degreeOfFinancialLeverage} max={3} />
            <LeverageBar label="Combined Leverage (DCL)" value={leverage.degreeCombinedLeverage} max={10} />
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-4">
              <div>
                <p className="text-xs text-foreground-muted">Interest Coverage</p>
                <p className={`text-xl font-bold ${leverage.interestCoverage >= 3 ? "text-success" : leverage.interestCoverage >= 1.5 ? "text-warning" : "text-danger"}`}>
                  {leverage.interestCoverage.toFixed(1)}x
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">Debt/Equity</p>
                <p className="text-xl font-bold text-foreground">{leverage.debtToEquity.toFixed(2)}x</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">Efficiency Metrics</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-xs text-foreground-muted">Receivables Turnover</p>
                <p className="text-lg font-bold text-foreground">{efficiency.receivablesTurnover.toFixed(1)}x</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-xs text-foreground-muted">Inventory Turnover</p>
                <p className="text-lg font-bold text-foreground">{efficiency.inventoryTurnover.toFixed(1)}x</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-xs text-foreground-muted">Payables Turnover</p>
                <p className="text-lg font-bold text-foreground">{efficiency.payablesTurnover.toFixed(1)}x</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-xs text-foreground-muted">Asset Turnover</p>
                <p className="text-lg font-bold text-foreground">{efficiency.assetTurnover.toFixed(2)}x</p>
              </div>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Cash Conversion Cycle</p>
                  <p className="text-xs text-foreground-muted">DSO + DIO - DPO</p>
                </div>
                <p className="text-2xl font-bold text-primary">{efficiency.cashConversionCycle} days</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Probability-Weighted Valuation */}
      <section className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Probability-Weighted Enterprise Value</h3>
            <p className="text-sm text-foreground-muted mt-1">
              Weighted average across Bull (25%), Base (50%), and Bear (25%) scenarios
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-accent">
              {formatCurrency(sensitivity.probabilityWeightedEV, currency, { compact: true })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Components

function ValuationCard({
  label,
  value,
  sublabel,
  variant = "default",
}: {
  label: string;
  value: string;
  sublabel?: string;
  variant?: "default" | "primary" | "success" | "danger";
}) {
  const variants = {
    default: "border-border",
    primary: "border-primary/30 bg-primary/5",
    success: "border-success/30 bg-success/5",
    danger: "border-danger/30 bg-danger/5",
  };

  return (
    <div className={`rounded-xl border p-4 ${variants[variant]}`}>
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className="text-xl font-bold text-foreground mt-1">{value}</p>
      {sublabel && <p className="text-xs text-foreground-muted mt-1">{sublabel}</p>}
    </div>
  );
}

function ReturnCard({
  label,
  value,
  benchmark,
}: {
  label: string;
  value: number;
  benchmark: number;
}) {
  const isGood = value >= benchmark;

  return (
    <div className={`rounded-xl border p-4 ${isGood ? "border-success/30 bg-success/5" : "border-border"}`}>
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className={`text-xl font-bold ${isGood ? "text-success" : "text-foreground"}`}>
        {value.toFixed(1)}%
      </p>
      <p className="text-xs text-foreground-muted mt-1">
        Benchmark: {benchmark}%
      </p>
    </div>
  );
}

function DuPontBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? "border-primary bg-primary/10" : "border-border bg-surface-2"
      }`}
    >
      <p className={`text-xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      <p className="text-xs text-foreground-muted mt-1">{label}</p>
    </div>
  );
}

function MiniDuPontBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-surface px-3 py-2">
      <p className="font-medium text-foreground">{value}</p>
      <p className="text-foreground-muted">{label}</p>
    </div>
  );
}

function LeverageBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const isHigh = value > max * 0.7;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-foreground">{label}</span>
        <span className={`text-sm font-medium ${isHigh ? "text-warning" : "text-foreground"}`}>
          {value.toFixed(2)}x
        </span>
      </div>
      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isHigh ? "bg-warning" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
