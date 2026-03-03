"use client";

import { useState, useEffect, useMemo } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";
import { FinancialModel, INDUSTRY_BENCHMARKS, Industry } from "@/lib/models/financial-model";
import { GlassPanel, Badge, ProgressRing } from "@/components/ui/design-system";

// =============================================================================
// ACTIVITY FEED WIDGET
// =============================================================================

interface ActivityItem {
  id: string;
  type: "model_update" | "analysis_run" | "scenario_created" | "export" | "alert";
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

function generateMockActivity(companyName: string): ActivityItem[] {
  const now = new Date();
  return [
    {
      id: "1",
      type: "analysis_run",
      title: "DCF Analysis Completed",
      description: `Full valuation recalculated for ${companyName}`,
      timestamp: new Date(now.getTime() - 5 * 60000),
      icon: "📊",
    },
    {
      id: "2",
      type: "model_update",
      title: "Revenue Assumptions Updated",
      description: "Growth rates adjusted for Q4 outlook",
      timestamp: new Date(now.getTime() - 15 * 60000),
      icon: "📝",
    },
    {
      id: "3",
      type: "scenario_created",
      title: "Bear Case Scenario Added",
      description: "New downside scenario with 15% revenue decline",
      timestamp: new Date(now.getTime() - 45 * 60000),
      icon: "🎯",
    },
    {
      id: "4",
      type: "alert",
      title: "Margin Alert Triggered",
      description: "EBITDA margin dropped below threshold",
      timestamp: new Date(now.getTime() - 120 * 60000),
      icon: "⚠️",
    },
    {
      id: "5",
      type: "export",
      title: "Executive Report Generated",
      description: "PDF report exported for board review",
      timestamp: new Date(now.getTime() - 180 * 60000),
      icon: "📄",
    },
  ];
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed({ companyName }: { companyName: string }) {
  const activities = useMemo(() => generateMockActivity(companyName), [companyName]);

  return (
    <GlassPanel padding="none">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <span className="text-lg">🕐</span>
            Recent Activity
          </h3>
          <Badge variant="default">{activities.length} events</Badge>
        </div>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-white truncate">{activity.title}</h4>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-zinc-600 flex-shrink-0">{formatTimeAgo(activity.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-zinc-800 text-center">
        <button className="text-xs text-amber-400 hover:text-amber-300">View All Activity</button>
      </div>
    </GlassPanel>
  );
}

// =============================================================================
// INDUSTRY BENCHMARK WIDGET
// =============================================================================

interface BenchmarkMetric {
  name: string;
  value: number;
  benchmark: { low: number; median: number; high: number };
  format: "percent" | "multiple";
}

export function IndustryBenchmark({
  analysis,
  industry,
}: {
  analysis: AnalysisResult;
  industry: Industry;
}) {
  const benchmark = INDUSTRY_BENCHMARKS[industry];
  const lastYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1];

  const metrics: BenchmarkMetric[] = [
    {
      name: "Gross Margin",
      value: lastYear.grossMargin * 100,
      benchmark: benchmark.grossMargin,
      format: "percent",
    },
    {
      name: "EBITDA Margin",
      value: lastYear.ebitdaMargin * 100,
      benchmark: benchmark.ebitdaMargin,
      format: "percent",
    },
    {
      name: "Net Margin",
      value: lastYear.netMargin * 100,
      benchmark: benchmark.netMargin,
      format: "percent",
    },
    {
      name: "Revenue Growth",
      value: analysis.baseCase.cagr.revenue * 100,
      benchmark: benchmark.revenueGrowth,
      format: "percent",
    },
  ];

  const getPercentile = (value: number, bench: { low: number; median: number; high: number }) => {
    if (value <= bench.low) return 10;
    if (value >= bench.high) return 90;
    if (value <= bench.median) {
      return 10 + ((value - bench.low) / (bench.median - bench.low)) * 40;
    }
    return 50 + ((value - bench.median) / (bench.high - bench.median)) * 40;
  };

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="text-lg">📈</span>
          Industry Benchmark
        </h3>
        <Badge variant="info">{industry.replace("_", " ")}</Badge>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => {
          const percentile = getPercentile(metric.value, metric.benchmark);
          const isAboveMedian = metric.value >= metric.benchmark.median;

          return (
            <div key={metric.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-400">{metric.name}</span>
                <span className={`text-xs font-mono ${isAboveMedian ? "text-green-400" : "text-amber-400"}`}>
                  {metric.value.toFixed(1)}%
                </span>
              </div>
              <div className="relative h-2 bg-zinc-800 rounded-full">
                {/* Range markers */}
                <div
                  className="absolute h-full bg-zinc-700 rounded-full"
                  style={{
                    left: `${(metric.benchmark.low / metric.benchmark.high) * 100}%`,
                    right: `${100 - (metric.benchmark.high / metric.benchmark.high) * 100}%`,
                  }}
                />
                {/* Median marker */}
                <div
                  className="absolute top-0 w-0.5 h-full bg-zinc-500"
                  style={{ left: `${(metric.benchmark.median / metric.benchmark.high) * 100}%` }}
                />
                {/* Value marker */}
                <div
                  className={`absolute top-0 w-2 h-2 rounded-full ${isAboveMedian ? "bg-green-500" : "bg-amber-500"} shadow-lg`}
                  style={{ left: `${Math.min(95, Math.max(5, (metric.value / metric.benchmark.high) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-zinc-600">{metric.benchmark.low}%</span>
                <span className="text-[10px] text-zinc-500">Median: {metric.benchmark.median}%</span>
                <span className="text-[10px] text-zinc-600">{metric.benchmark.high}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Overall Percentile</span>
          <span className="text-sm font-bold text-amber-400">
            {Math.round(metrics.reduce((sum, m) => sum + getPercentile(m.value, m.benchmark), 0) / metrics.length)}th
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}

// =============================================================================
// KEY DRIVERS WIDGET
// =============================================================================

interface Driver {
  name: string;
  impact: number; // -100 to 100
  description: string;
  type: "positive" | "negative";
}

export function KeyDrivers({ analysis, currency }: { analysis: AnalysisResult; currency: string }) {
  const dcf = analysis.baseCase.dcfValuation;
  const cagr = analysis.baseCase.cagr;
  const lastYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1];

  // Calculate value drivers based on sensitivity analysis
  const drivers: Driver[] = [
    {
      name: "Revenue Growth",
      impact: Math.round(cagr.revenue * 300),
      description: `${(cagr.revenue * 100).toFixed(1)}% CAGR driving top-line expansion`,
      type: cagr.revenue > 0 ? "positive" as const : "negative" as const,
    },
    {
      name: "Operating Margin",
      impact: Math.round(lastYear.ebitdaMargin * 200),
      description: `${(lastYear.ebitdaMargin * 100).toFixed(1)}% EBITDA margin efficiency`,
      type: lastYear.ebitdaMargin > 0.15 ? "positive" as const : "negative" as const,
    },
    {
      name: "WACC",
      impact: -Math.round(dcf.wacc * 5),
      description: `${dcf.wacc.toFixed(1)}% cost of capital`,
      type: dcf.wacc < 12 ? "positive" as const : "negative" as const,
    },
    {
      name: "Terminal Growth",
      impact: Math.round((dcf.terminalValue / dcf.enterpriseValue) * 30),
      description: `${((dcf.terminalValue / dcf.enterpriseValue) * 100).toFixed(0)}% of value from terminal`,
      type: "positive" as const,
    },
    {
      name: "FCF Conversion",
      impact: Math.round(lastYear.fcfMargin * 150),
      description: `${(lastYear.fcfMargin * 100).toFixed(1)}% free cash flow margin`,
      type: lastYear.fcfMargin > 0 ? "positive" as const : "negative" as const,
    },
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="text-lg">🎯</span>
          Key Value Drivers
        </h3>
      </div>

      <div className="space-y-3">
        {drivers.map((driver) => (
          <div key={driver.name} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-zinc-300">{driver.name}</span>
              <span className={`text-xs font-mono ${driver.type === "positive" ? "text-green-400" : "text-red-400"}`}>
                {driver.impact > 0 ? "+" : ""}{driver.impact}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${driver.type === "positive" ? "bg-green-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, Math.abs(driver.impact))}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-600 mt-1">{driver.description}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

// =============================================================================
// DATA QUALITY WIDGET
// =============================================================================

interface QualityCheck {
  name: string;
  status: "pass" | "warning" | "fail";
  message: string;
}

export function DataQuality({ model }: { model: FinancialModel }) {
  const checks: QualityCheck[] = useMemo(() => {
    const results: QualityCheck[] = [];

    // Check revenue streams
    const hasRevenue = model.incomeStatement.revenueStreams.some((r) => r.baseAmount > 0);
    results.push({
      name: "Revenue Data",
      status: hasRevenue ? "pass" : "fail",
      message: hasRevenue ? "Revenue streams configured" : "No revenue data entered",
    });

    // Check growth rates
    const hasGrowthRates = model.incomeStatement.revenueStreams.some((r) => r.growthRates.length > 0);
    results.push({
      name: "Growth Assumptions",
      status: hasGrowthRates ? "pass" : "warning",
      message: hasGrowthRates ? "Growth rates defined" : "Using default growth rates",
    });

    // Check cost structure
    const hasCosts = model.incomeStatement.costItems.length > 0;
    results.push({
      name: "Cost Structure",
      status: hasCosts ? "pass" : "warning",
      message: hasCosts ? `${model.incomeStatement.costItems.length} cost items` : "No costs configured",
    });

    // Check balance sheet
    const hasBalanceSheet = model.balanceSheet.cashAndEquivalents > 0 || model.balanceSheet.propertyPlantEquipment > 0;
    results.push({
      name: "Balance Sheet",
      status: hasBalanceSheet ? "pass" : "warning",
      message: hasBalanceSheet ? "Balance sheet populated" : "Limited balance sheet data",
    });

    // Check valuation assumptions
    const hasValuation = model.valuationAssumptions.beta > 0 && model.valuationAssumptions.riskFreeRate > 0;
    results.push({
      name: "Valuation Inputs",
      status: hasValuation ? "pass" : "warning",
      message: hasValuation ? "DCF parameters set" : "Using default valuation inputs",
    });

    return results;
  }, [model]);

  const passCount = checks.filter((c) => c.status === "pass").length;
  const score = Math.round((passCount / checks.length) * 100);

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="text-lg">✅</span>
          Data Quality
        </h3>
        <ProgressRing progress={score} size={40} strokeWidth={3} color={score >= 80 ? "green" : score >= 60 ? "amber" : "red"} />
      </div>

      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.name} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/30">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              check.status === "pass" ? "bg-green-500/20 text-green-400" :
              check.status === "warning" ? "bg-amber-500/20 text-amber-400" :
              "bg-red-500/20 text-red-400"
            }`}>
              {check.status === "pass" ? "✓" : check.status === "warning" ? "!" : "✗"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300">{check.name}</p>
              <p className="text-[10px] text-zinc-600 truncate">{check.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800">
        <div className="text-center">
          <span className={`text-lg font-bold ${score >= 80 ? "text-green-400" : score >= 60 ? "text-amber-400" : "text-red-400"}`}>
            {score}%
          </span>
          <span className="text-xs text-zinc-500 ml-2">Model Completeness</span>
        </div>
      </div>
    </GlassPanel>
  );
}

// =============================================================================
// FORECAST TIMELINE WIDGET
// =============================================================================

export function ForecastTimeline({ analysis, currency }: { analysis: AnalysisResult; currency: string }) {
  const years = analysis.baseCase.yearlyFinancials;
  const maxRevenue = Math.max(...years.map((y) => y.revenue));

  const formatValue = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  return (
    <GlassPanel padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="text-lg">📅</span>
          Forecast Timeline
        </h3>
        <Badge variant="brand">{years.length} Years</Badge>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-500/50 via-amber-500 to-amber-500/50" />

        {/* Year markers */}
        <div className="flex justify-between relative">
          {years.map((year, index) => {
            const height = (year.revenue / maxRevenue) * 60 + 20;
            const isLast = index === years.length - 1;

            return (
              <div key={year.year} className="flex flex-col items-center" style={{ width: `${100 / years.length}%` }}>
                {/* Connector */}
                <div className={`w-3 h-3 rounded-full ${isLast ? "bg-amber-500 ring-4 ring-amber-500/30" : "bg-zinc-600"}`} />

                {/* Bar */}
                <div
                  className={`w-8 mt-3 rounded-t-lg ${isLast ? "bg-gradient-to-t from-amber-600 to-amber-400" : "bg-zinc-700"}`}
                  style={{ height }}
                />

                {/* Labels */}
                <div className="text-center mt-2">
                  <p className={`text-xs font-medium ${isLast ? "text-amber-400" : "text-zinc-400"}`}>{year.year}</p>
                  <p className={`text-[10px] ${isLast ? "text-amber-400/70" : "text-zinc-600"}`}>{formatValue(year.revenue)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-zinc-500">Start</p>
          <p className="text-sm font-bold text-white">{formatValue(years[0]?.revenue || 0)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">CAGR</p>
          <p className="text-sm font-bold text-amber-400">{(analysis.baseCase.cagr.revenue * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">End</p>
          <p className="text-sm font-bold text-white">{formatValue(years[years.length - 1]?.revenue || 0)}</p>
        </div>
      </div>
    </GlassPanel>
  );
}

// =============================================================================
// AI INSIGHTS WIDGET
// =============================================================================

export function AIInsights({ analysis, companyName }: { analysis: AnalysisResult; companyName: string }) {
  const [currentInsight, setCurrentInsight] = useState(0);
  const lastYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1];

  const insights = useMemo(() => {
    const items: { title: string; content: string; type: "opportunity" | "risk" | "insight" }[] = [];

    // Growth insight
    if (analysis.baseCase.cagr.revenue > 0.15) {
      items.push({
        title: "Strong Growth Trajectory",
        content: `${companyName} is projected to grow at ${(analysis.baseCase.cagr.revenue * 100).toFixed(1)}% CAGR, outpacing typical industry growth. Consider strategic investments to sustain momentum.`,
        type: "opportunity",
      });
    }

    // Margin insight
    if (lastYear.ebitdaMargin > 0.2) {
      items.push({
        title: "Healthy Margin Profile",
        content: `EBITDA margin of ${(lastYear.ebitdaMargin * 100).toFixed(1)}% indicates strong operational efficiency. Focus on maintaining this through scale.`,
        type: "insight",
      });
    } else if (lastYear.ebitdaMargin < 0.1) {
      items.push({
        title: "Margin Improvement Opportunity",
        content: `Current EBITDA margin of ${(lastYear.ebitdaMargin * 100).toFixed(1)}% suggests room for operational improvement. Consider cost optimization initiatives.`,
        type: "risk",
      });
    }

    // Cash flow insight
    if (lastYear.freeCashFlow > 0) {
      items.push({
        title: "Positive Cash Generation",
        content: `FCF margin of ${(lastYear.fcfMargin * 100).toFixed(1)}% provides flexibility for growth investments, debt reduction, or shareholder returns.`,
        type: "opportunity",
      });
    }

    // Valuation insight
    const evMultiple = analysis.baseCase.dcfValuation.enterpriseValue / lastYear.ebitda;
    items.push({
      title: "Valuation Context",
      content: `Implied EV/EBITDA of ${evMultiple.toFixed(1)}x. ${evMultiple > 15 ? "Premium valuation reflects growth expectations." : "Reasonable multiple with upside potential."}`,
      type: "insight",
    });

    return items;
  }, [analysis, companyName, lastYear]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [insights.length]);

  const insight = insights[currentInsight];
  if (!insight) return null;

  const colors = {
    opportunity: { bg: "bg-green-500/10", border: "border-green-500/30", icon: "💡", text: "text-green-400" },
    risk: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "⚠️", text: "text-red-400" },
    insight: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "🔍", text: "text-blue-400" },
  };

  const c = colors[insight.type];

  return (
    <GlassPanel padding="lg" className={`${c.bg} border ${c.border}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">{c.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold ${c.text}`}>{insight.title}</h3>
            <Badge variant="default">AI</Badge>
          </div>
          <p className="text-sm text-zinc-300">{insight.content}</p>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {insights.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentInsight(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              idx === currentInsight ? "w-4 bg-amber-500" : "bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </GlassPanel>
  );
}

// =============================================================================
// QUICK STATS MINI WIDGET
// =============================================================================

export function QuickStats({ analysis, currency }: { analysis: AnalysisResult; currency: string }) {
  const dcf = analysis.baseCase.dcfValuation;
  const lastYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1];

  const formatValue = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  const stats = [
    { label: "Share Price", value: `$${dcf.impliedSharePrice.toFixed(2)}`, icon: "📈" },
    { label: "EV/EBITDA", value: `${(dcf.enterpriseValue / lastYear.ebitda).toFixed(1)}x`, icon: "📊" },
    { label: "P/E Ratio", value: `${(dcf.equityValue / lastYear.netIncome).toFixed(1)}x`, icon: "💰" },
    { label: "FCF Yield", value: `${((lastYear.freeCashFlow / dcf.equityValue) * 100).toFixed(1)}%`, icon: "💵" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-center">
          <span className="text-lg">{stat.icon}</span>
          <p className="text-lg font-bold text-white mt-1">{stat.value}</p>
          <p className="text-[10px] text-zinc-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// SCENARIO COMPARISON MINI WIDGET
// =============================================================================

export function ScenarioComparison({ analysis, currency }: { analysis: AnalysisResult; currency: string }) {
  const scenarios = [
    { name: "Base", ev: analysis.baseCase.dcfValuation.enterpriseValue, color: "amber" },
    { name: "Upside", ev: analysis.baseCase.dcfValuation.enterpriseValue * 1.25, color: "green" },
    { name: "Downside", ev: analysis.baseCase.dcfValuation.enterpriseValue * 0.75, color: "red" },
  ];

  const maxEV = Math.max(...scenarios.map((s) => s.ev));

  const formatValue = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  return (
    <GlassPanel padding="lg">
      <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
        <span className="text-lg">🎲</span>
        Scenario Range
      </h3>

      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <div key={scenario.name} className="flex items-center gap-3">
            <span className="w-16 text-xs text-zinc-400">{scenario.name}</span>
            <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-${scenario.color}-500`}
                style={{ width: `${(scenario.ev / maxEV) * 100}%` }}
              />
            </div>
            <span className={`text-xs font-mono text-${scenario.color}-400 w-16 text-right`}>
              {formatValue(scenario.ev)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800 text-center">
        <span className="text-xs text-zinc-500">
          Range: {formatValue(scenarios[2].ev)} - {formatValue(scenarios[1].ev)}
        </span>
      </div>
    </GlassPanel>
  );
}
