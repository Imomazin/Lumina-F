"use client";

import { useMemo } from "react";
import { GlassPanel, Badge, ProgressRing } from "@/components/ui/design-system";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

// =============================================================================
// TYPES
// =============================================================================

interface UnitEconomicsProps {
  analysis: AnalysisResult;
  currency: string;
  // SaaS-specific inputs (could come from model)
  avgRevenuePerUser?: number;
  customerAcquisitionCost?: number;
  monthlyChurnRate?: number;
  grossMarginPercent?: number;
}

// =============================================================================
// CALCULATIONS
// =============================================================================

function calculateUnitEconomics(props: UnitEconomicsProps) {
  const lastYear = props.analysis.baseCase.yearlyFinancials[props.analysis.baseCase.yearlyFinancials.length - 1];

  // Use provided values or derive from analysis
  const arpu = props.avgRevenuePerUser || (lastYear.revenue / 10000); // Assume 10k customers
  const cac = props.customerAcquisitionCost || (lastYear.operatingExpenses * 0.4 / 2000); // 40% of opex on sales, 2k new customers
  const monthlyChurn = props.monthlyChurnRate || 0.02; // 2% monthly
  const grossMargin = props.grossMarginPercent || lastYear.grossMargin;

  // Derived metrics
  const annualChurn = 1 - Math.pow(1 - monthlyChurn, 12);
  const avgLifetimeMonths = 1 / monthlyChurn;
  const ltv = (arpu * 12 * grossMargin) / annualChurn;
  const ltvCacRatio = ltv / cac;
  const paybackMonths = cac / (arpu * grossMargin);
  const magicNumber = (lastYear.revenue - props.analysis.baseCase.yearlyFinancials[0].revenue) /
    (lastYear.operatingExpenses * 0.4); // Revenue growth / sales spend

  return {
    arpu,
    cac,
    monthlyChurn,
    annualChurn,
    avgLifetimeMonths,
    ltv,
    ltvCacRatio,
    paybackMonths,
    grossMargin,
    magicNumber,
  };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };
  const s = symbols[currency] || "$";
  if (value >= 1e6) return `${s}${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${s}${(value / 1e3).toFixed(1)}K`;
  return `${s}${value.toFixed(0)}`;
}

function MetricGauge({
  label,
  value,
  target,
  format,
  description,
}: {
  label: string;
  value: number;
  target: number;
  format: "ratio" | "months" | "percent" | "currency";
  description: string;
}) {
  const progress = Math.min(100, (value / target) * 100);
  const isGood = value >= target;

  const formatValue = () => {
    switch (format) {
      case "ratio":
        return `${value.toFixed(1)}x`;
      case "months":
        return `${value.toFixed(1)} mo`;
      case "percent":
        return `${(value * 100).toFixed(1)}%`;
      case "currency":
        return formatCurrency(value, "USD");
    }
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold ${isGood ? "text-green-400" : "text-amber-400"}`}>
            {formatValue()}
          </p>
        </div>
        <ProgressRing
          progress={progress}
          size={40}
          strokeWidth={3}
          color={isGood ? "green" : "amber"}
        />
      </div>
      <p className="text-xs text-zinc-500">{description}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-zinc-600">Target:</span>
        <span className={`text-xs ${isGood ? "text-green-400" : "text-zinc-400"}`}>
          {format === "ratio" ? `${target}x` : format === "months" ? `${target} mo` : `${target}`}
        </span>
      </div>
    </div>
  );
}

function CohortTable() {
  // Mock cohort data
  const cohorts = [
    { month: "Jan 2024", customers: 100, m1: 95, m2: 90, m3: 85, m4: 82, m5: 80, m6: 78 },
    { month: "Feb 2024", customers: 120, m1: 96, m2: 91, m3: 87, m4: 84, m5: 82, m6: null },
    { month: "Mar 2024", customers: 150, m1: 94, m2: 89, m3: 85, m4: 83, m5: null, m6: null },
    { month: "Apr 2024", customers: 180, m1: 95, m2: 90, m3: 86, m4: null, m5: null, m6: null },
    { month: "May 2024", customers: 200, m1: 96, m2: 92, m3: null, m4: null, m5: null, m6: null },
    { month: "Jun 2024", customers: 220, m1: 97, m2: null, m3: null, m4: null, m5: null, m6: null },
  ];

  const getColor = (retention: number | null) => {
    if (retention === null) return "bg-zinc-800/30";
    if (retention >= 95) return "bg-green-500/40";
    if (retention >= 90) return "bg-green-500/20";
    if (retention >= 85) return "bg-amber-500/20";
    if (retention >= 80) return "bg-amber-500/40";
    return "bg-red-500/30";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-2 px-3 text-zinc-500 font-medium">Cohort</th>
            <th className="text-center py-2 px-3 text-zinc-500 font-medium">Size</th>
            <th className="text-center py-2 px-3 text-zinc-500 font-medium">M1</th>
            <th className="text-center py-2 px-3 text-zinc-500 font-medium">M2</th>
            <th className="text-center py-2 px-3 text-zinc-500 font-medium">M3</th>
            <th className="text-center py-2 px-3 text-zinc-500 font-medium">M4</th>
            <th className="text-center py-2 px-3 text-zinc-500 font-medium">M5</th>
            <th className="text-center py-2 px-3 text-zinc-500 font-medium">M6</th>
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <tr key={cohort.month} className="border-b border-zinc-800/50">
              <td className="py-2 px-3 text-zinc-300">{cohort.month}</td>
              <td className="py-2 px-3 text-center text-zinc-400">{cohort.customers}</td>
              {[cohort.m1, cohort.m2, cohort.m3, cohort.m4, cohort.m5, cohort.m6].map((val, idx) => (
                <td key={idx} className={`py-2 px-3 text-center ${getColor(val)}`}>
                  {val !== null ? `${val}%` : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UnitEconomics({ analysis, currency, ...props }: UnitEconomicsProps) {
  const metrics = useMemo(() => calculateUnitEconomics({ analysis, currency, ...props }), [analysis, currency, props]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">📈</span>
            Unit Economics
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Customer acquisition, retention, and lifetime value metrics
          </p>
        </div>
        <Badge variant={metrics.ltvCacRatio >= 3 ? "success" : metrics.ltvCacRatio >= 2 ? "warning" : "danger"}>
          {metrics.ltvCacRatio >= 3 ? "Healthy" : metrics.ltvCacRatio >= 2 ? "Moderate" : "At Risk"}
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricGauge
          label="LTV:CAC Ratio"
          value={metrics.ltvCacRatio}
          target={3}
          format="ratio"
          description="Lifetime Value / Customer Acquisition Cost"
        />
        <MetricGauge
          label="Payback Period"
          value={metrics.paybackMonths}
          target={12}
          format="months"
          description="Months to recover CAC"
        />
        <MetricGauge
          label="Monthly Churn"
          value={metrics.monthlyChurn}
          target={0.02}
          format="percent"
          description="Monthly customer churn rate"
        />
        <MetricGauge
          label="Magic Number"
          value={metrics.magicNumber}
          target={1}
          format="ratio"
          description="Revenue growth efficiency"
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassPanel padding="lg">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>💰</span> Revenue Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Avg Revenue Per User (ARPU)</span>
              <span className="font-mono text-white">{formatCurrency(metrics.arpu, currency)}/mo</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Customer Lifetime Value (LTV)</span>
              <span className="font-mono text-green-400">{formatCurrency(metrics.ltv, currency)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Avg Customer Lifetime</span>
              <span className="font-mono text-white">{metrics.avgLifetimeMonths.toFixed(0)} months</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-zinc-400">Annual Revenue Per User</span>
              <span className="font-mono text-white">{formatCurrency(metrics.arpu * 12, currency)}/yr</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel padding="lg">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>🎯</span> Acquisition Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Customer Acquisition Cost (CAC)</span>
              <span className="font-mono text-red-400">{formatCurrency(metrics.cac, currency)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">CAC Payback Period</span>
              <span className="font-mono text-white">{metrics.paybackMonths.toFixed(1)} months</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Annual Churn Rate</span>
              <span className="font-mono text-amber-400">{(metrics.annualChurn * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-zinc-400">Gross Margin</span>
              <span className="font-mono text-white">{(metrics.grossMargin * 100).toFixed(1)}%</span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Cohort Analysis */}
      <GlassPanel padding="lg">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span>👥</span> Cohort Retention Analysis
        </h3>
        <CohortTable />
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500/40 rounded" />
            <span className="text-zinc-500">95%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500/20 rounded" />
            <span className="text-zinc-500">90-95%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500/20 rounded" />
            <span className="text-zinc-500">85-90%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500/40 rounded" />
            <span className="text-zinc-500">80-85%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500/30 rounded" />
            <span className="text-zinc-500">&lt;80%</span>
          </div>
        </div>
      </GlassPanel>

      {/* Summary */}
      <GlassPanel padding="lg" variant="brand" glow="amber">
        <h3 className="font-semibold text-amber-400 mb-3">Unit Economics Summary</h3>
        <p className="text-sm text-zinc-300">
          {metrics.ltvCacRatio >= 3 ? (
            <>
              Strong unit economics with LTV:CAC of <span className="text-green-400 font-bold">{metrics.ltvCacRatio.toFixed(1)}x</span>.
              The {metrics.paybackMonths.toFixed(0)}-month payback period indicates efficient customer acquisition.
              Focus on maintaining churn below {(metrics.monthlyChurn * 100).toFixed(1)}% to preserve LTV.
            </>
          ) : metrics.ltvCacRatio >= 2 ? (
            <>
              Moderate unit economics with LTV:CAC of <span className="text-amber-400 font-bold">{metrics.ltvCacRatio.toFixed(1)}x</span>.
              Consider optimizing CAC or improving retention to reach the 3x benchmark.
              Current payback of {metrics.paybackMonths.toFixed(0)} months may strain cash flow.
            </>
          ) : (
            <>
              Unit economics need improvement with LTV:CAC of <span className="text-red-400 font-bold">{metrics.ltvCacRatio.toFixed(1)}x</span>.
              Priority actions: reduce CAC, improve retention, or increase ARPU.
              Current trajectory is not sustainable for growth.
            </>
          )}
        </p>
      </GlassPanel>
    </div>
  );
}
