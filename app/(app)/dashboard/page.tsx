"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFinancialModel, formatLastSaved } from "@/lib/hooks/useFinancialModel";
import { runFinancialAnalysis } from "@/lib/analysis/financial-engine";
import { createDemoFinancialModel } from "@/lib/demo-data";
import { FinanceDashboard } from "@/components/dashboards/FinanceDashboard";
import { KPIDashboard } from "@/components/dashboards/KPIDashboard";
import { ChartsDashboard } from "@/components/dashboards/ChartsDashboard";
import { RiskDashboard } from "@/components/dashboards/RiskDashboard";
import { AIAssistant } from "@/components/AIAssistant";
import { CommandCentre } from "@/components/modules/CommandCentre";
import { VarianceAnalytics } from "@/components/modules/VarianceAnalytics";
import { CapitalEngine } from "@/components/modules/CapitalEngine";
import { DecisionLayer } from "@/components/modules/DecisionLayer";
import { FinancialCoPilot } from "@/components/modules/FinancialCoPilot";
import { ModelVersioning } from "@/components/modules/ModelVersioning";
import { UnitEconomics } from "@/components/modules/UnitEconomics";
import { CommentsPanel } from "@/components/modules/CommentsPanel";
import { AuditTrail } from "@/components/modules/AuditTrail";
import { MandAModule } from "@/components/modules/MandAModule";
import { ExportPanel, useExportPanel } from "@/components/ui/ExportPanel";
import { GlossaryPanel } from "@/components/ui/HelpTooltip";
import {
  ActivityFeed,
  IndustryBenchmark,
  KeyDrivers,
  DataQuality,
  ForecastTimeline,
  AIInsights,
  QuickStats,
  ScenarioComparison,
} from "@/components/widgets/DashboardWidgets";
import {
  GlassPanel,
  PremiumButton,
  MetricCard,
  Badge,
  EmptyState,
  Skeleton,
  SkeletonCard,
  ProgressRing,
  AnimatedCounter,
} from "@/components/ui/design-system";

type DashboardView = "command" | "overview" | "finance" | "variance" | "capital" | "decisions" | "kpis" | "charts" | "risk" | "versions" | "unit-econ" | "comments" | "audit" | "manda";

function formatCurrency(value: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$",
  };
  const symbol = symbols[currency] || "$";
  const absValue = Math.abs(value);
  if (absValue >= 1e9) return `${symbol}${(value / 1e9).toFixed(1)}B`;
  if (absValue >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
  if (absValue >= 1e3) return `${symbol}${(value / 1e3).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// Loading fallback for Suspense
function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} width={80} height={36} className="rounded-lg flex-shrink-0" />
        ))}
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton height={300} className="rounded-2xl" />
        <Skeleton height={300} className="rounded-2xl" />
      </div>
    </div>
  );
}

// Main dashboard content (separated for Suspense)
function DashboardContent() {
  const searchParams = useSearchParams();
  const { model, lastSaved, isLoading, isModelValid, saveModel } = useFinancialModel();
  const [activeView, setActiveView] = useState<DashboardView>("command");
  const [showAIChat, setShowAIChat] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  // Handle view from URL params
  useEffect(() => {
    const view = searchParams.get("view") as DashboardView;
    if (view && ["command", "overview", "finance", "variance", "capital", "decisions", "kpis", "charts", "risk", "versions", "unit-econ", "comments", "audit", "manda"].includes(view)) {
      setActiveView(view);
    }
  }, [searchParams]);

  // Listen for custom events
  useEffect(() => {
    const handleOpenAI = () => setShowAIChat(true);
    const handleLoadDemo = () => loadDemo();

    document.addEventListener("open-ai-chat", handleOpenAI);
    document.addEventListener("load-demo", handleLoadDemo);

    return () => {
      document.removeEventListener("open-ai-chat", handleOpenAI);
      document.removeEventListener("load-demo", handleLoadDemo);
    };
  }, []);

  const loadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      const demoModel = createDemoFinancialModel();
      saveModel(demoModel);
      window.location.reload();
    } catch (error) {
      console.error("Failed to load demo:", error);
      setIsLoadingDemo(false);
    }
  };

  const analysis = useMemo(() => {
    if (model && isModelValid(model)) {
      return runFinancialAnalysis(model);
    }
    return null;
  }, [model, isModelValid]);

  const hasValidModel = model && isModelValid(model);

  const viewTabs = [
    { id: "command", label: "Command", icon: "🎯" },
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "finance", label: "Finance", icon: "💰" },
    { id: "variance", label: "Variance", icon: "📈" },
    { id: "capital", label: "Capital", icon: "🏦" },
    { id: "decisions", label: "Decisions", icon: "✓" },
    { id: "kpis", label: "KPIs", icon: "🎯" },
    { id: "charts", label: "Charts", icon: "📉" },
    { id: "risk", label: "Risk", icon: "⚠️" },
    { id: "unit-econ", label: "Unit Economics", icon: "💵" },
    { id: "manda", label: "M&A", icon: "🤝" },
    { id: "versions", label: "Versions", icon: "📜" },
    { id: "comments", label: "Comments", icon: "💬" },
    { id: "audit", label: "Audit Trail", icon: "📋" },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} width={80} height={36} className="rounded-lg flex-shrink-0" />
          ))}
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton height={300} className="rounded-2xl" />
          <Skeleton height={300} className="rounded-2xl" />
        </div>
      </div>
    );
  }

  // Empty state - No model
  if (!hasValidModel || !analysis) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-3xl mx-auto">
          <GlassPanel variant="brand" padding="xl" glow="amber" animate>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/30 mb-6">
                <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Welcome to Lumina F
              </h1>
              <p className="text-lg text-zinc-400 max-w-lg mx-auto">
                Build professional financial models with DCF valuation, scenario analysis, and AI-powered insights.
              </p>
            </div>

            {/* Quick Start Options */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={loadDemo}
                disabled={isLoadingDemo}
                className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 text-left transition-all hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 hover:scale-[1.02] disabled:opacity-50"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Try Demo</h3>
                      <p className="text-xs text-amber-400/70">TechVentures Inc.</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">
                    Explore a complete 5-year financial model with DCF valuation and scenario analysis.
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 group-hover:gap-3 transition-all">
                    {isLoadingDemo ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load Demo
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                </div>
              </button>

              <Link
                href="/inputs"
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">Create New Model</h3>
                    <p className="text-xs text-zinc-500">Start from scratch</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Build a custom financial model with your own data and assumptions.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 group-hover:gap-3 transition-all">
                  Get Started
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: "📊", label: "DCF Valuation", color: "amber" },
                { icon: "📈", label: "50+ Ratios", color: "green" },
                { icon: "🎯", label: "Scenarios", color: "blue" },
                { icon: "⚡", label: "AI Insights", color: "purple" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
                >
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-sm text-zinc-300 font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    );
  }

  // Main Dashboard with Model
  const currency = model.profile.currency;
  const lastYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {model.profile.companyName}
            <Badge variant="success" dot pulse>Active</Badge>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {model.profile.forecastYears}-Year Financial Model
            {lastSaved && <span className="mx-2">·</span>}
            {lastSaved && <span>Last saved {formatLastSaved(lastSaved)}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PremiumButton variant="ghost" onClick={() => setShowGlossary(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Glossary
          </PremiumButton>
          <PremiumButton variant="ghost" onClick={() => setShowAIChat(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ask AI
          </PremiumButton>
          <PremiumButton variant="secondary" onClick={() => setShowExportPanel(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </PremiumButton>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {viewTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as DashboardView)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${activeView === tab.id
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-white border border-amber-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent"
              }
            `}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* View Content */}
      <div className="animate-[fadeInUp_0.3s_ease-out]">
        {/* Command Centre View */}
        {activeView === "command" && (
          <CommandCentre
            analysis={analysis}
            currency={currency}
            companyName={model.profile.companyName}
            onStartPlanning={() => setActiveView("overview")}
          />
        )}

        {/* Overview View */}
        {activeView === "overview" && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-5 gap-4">
              <MetricCard
                label="Enterprise Value"
                value={formatCurrency(analysis.baseCase.dcfValuation.enterpriseValue, currency)}
                variant="brand"
                size="lg"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <MetricCard
                label="Equity Value"
                value={formatCurrency(analysis.baseCase.dcfValuation.equityValue, currency)}
                change={analysis.baseCase.cagr.revenue * 100}
                changeLabel="Rev CAGR"
                variant="success"
              />
              <MetricCard
                label="Revenue (Final)"
                value={formatCurrency(lastYear.revenue, currency)}
                change={analysis.baseCase.cagr.revenue * 100}
                trend="up"
              />
              <MetricCard
                label="EBITDA Margin"
                value={formatPercent(lastYear.ebitdaMargin)}
                variant={lastYear.ebitdaMargin > 0.2 ? "success" : "warning"}
                trend={lastYear.ebitdaMargin > 0.15 ? "up" : "neutral"}
              />
              <MetricCard
                label="WACC"
                value={`${analysis.baseCase.dcfValuation.wacc.toFixed(1)}%`}
                variant="info"
              />
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Scenario Comparison */}
              <GlassPanel padding="lg">
                <h3 className="text-lg font-semibold text-white mb-4">Scenario Analysis</h3>
                <div className="grid grid-cols-3 gap-4">
                  {analysis.scenarios.slice(0, 3).map((scenario, idx) => {
                    const colors = [
                      { ring: "green", label: "Best Case" },
                      { ring: "amber", label: "Base Case" },
                      { ring: "red", label: "Worst Case" },
                    ];
                    const c = colors[idx] || colors[1];

                    return (
                      <div key={scenario.scenarioId} className="text-center">
                        <ProgressRing
                          progress={scenario.probability}
                          size={70}
                          color={c.ring as "green" | "amber" | "red"}
                          label={`${scenario.probability}%`}
                        />
                        <p className="text-sm font-medium text-white mt-3">
                          {formatCurrency(scenario.dcfValuation.enterpriseValue, currency)}
                        </p>
                        <p className="text-xs text-zinc-500">{scenario.scenarioName}</p>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>

              {/* Revenue Trend */}
              <GlassPanel padding="lg">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue Trajectory</h3>
                <div className="h-48 flex items-end gap-3">
                  {analysis.baseCase.yearlyFinancials.map((yf, idx) => {
                    const maxRevenue = Math.max(...analysis.baseCase.yearlyFinancials.map(y => y.revenue));
                    const height = (yf.revenue / maxRevenue) * 100;

                    return (
                      <div key={yf.year} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatCurrency(yf.revenue, currency)}
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all hover:from-amber-500 hover:to-amber-300 group-hover:shadow-lg group-hover:shadow-amber-500/20"
                          style={{
                            height: `${height}%`,
                            minHeight: "20px",
                            animationDelay: `${idx * 100}ms`,
                          }}
                        />
                        <span className="text-xs text-zinc-500">{yf.year}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            </div>

            {/* AI Insights Banner */}
            <AIInsights analysis={analysis} companyName={model.profile.companyName} />

            {/* Quick Stats Row */}
            <QuickStats analysis={analysis} currency={currency} />

            {/* Insights Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <GlassPanel padding="lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.executiveSummary.strengthsOpportunities.slice(0, 4).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassPanel>

              <GlassPanel padding="lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-red-400">!</span>
                  Risks
                </h3>
                <ul className="space-y-2">
                  {analysis.executiveSummary.risksThreats.slice(0, 4).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            </div>

            {/* Third Row - Activity, Benchmarks, Drivers */}
            <div className="grid lg:grid-cols-3 gap-6">
              <ActivityFeed companyName={model.profile.companyName} />
              <IndustryBenchmark analysis={analysis} industry={model.profile.industry} />
              <KeyDrivers analysis={analysis} currency={currency} />
            </div>

            {/* Fourth Row - Timeline, Quality, Scenarios */}
            <div className="grid lg:grid-cols-3 gap-6">
              <ForecastTimeline analysis={analysis} currency={currency} />
              <DataQuality model={model} />
              <ScenarioComparison analysis={analysis} currency={currency} />
            </div>
          </div>
        )}

        {/* Finance View */}
        {activeView === "finance" && (
          <FinanceDashboard analysis={analysis} currency={currency} />
        )}

        {/* Variance Analytics View */}
        {activeView === "variance" && (
          <VarianceAnalytics analysis={analysis} currency={currency} />
        )}

        {/* Capital Engine View */}
        {activeView === "capital" && (
          <CapitalEngine analysis={analysis} currency={currency} />
        )}

        {/* Decision Layer View */}
        {activeView === "decisions" && (
          <DecisionLayer analysis={analysis} currency={currency} />
        )}

        {/* KPIs View */}
        {activeView === "kpis" && (
          <KPIDashboard analysis={analysis} currency={currency} />
        )}

        {/* Charts View */}
        {activeView === "charts" && (
          <ChartsDashboard analysis={analysis} currency={currency} />
        )}

        {/* Risk View */}
        {activeView === "risk" && (
          <RiskDashboard analysis={analysis} currency={currency} />
        )}

        {/* Versions View */}
        {activeView === "versions" && (
          <ModelVersioning
            currentModel={model}
            currency={currency}
            onRestoreVersion={(restoredModel) => {
              saveModel(restoredModel);
              window.location.reload();
            }}
          />
        )}

        {/* Unit Economics View */}
        {activeView === "unit-econ" && (
          <UnitEconomics
            analysis={analysis}
            currency={currency}
          />
        )}

        {/* Comments View */}
        {activeView === "comments" && (
          <CommentsPanel
            isOpen={true}
            onClose={() => setActiveView("overview")}
          />
        )}

        {/* Audit Trail View */}
        {activeView === "audit" && (
          <AuditTrail
            isOpen={true}
            onClose={() => setActiveView("overview")}
          />
        )}

        {/* M&A Module View */}
        {activeView === "manda" && (
          <MandAModule
            acquirerRevenue={analysis.baseCase.yearlyFinancials[0].revenue}
            acquirerEbitda={analysis.baseCase.yearlyFinancials[0].ebitda}
            acquirerShares={100000000}
            acquirerSharePrice={analysis.baseCase.dcfValuation.equityValue / 100000000}
            currency={currency}
          />
        )}
      </div>

      {/* AI Chat */}
      <AIAssistant
        model={model}
        analysis={analysis}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />

      {/* Financial Co-Pilot */}
      <FinancialCoPilot
        analysis={analysis}
        currentContext={activeView === "capital" ? "capital" : activeView === "variance" ? "analysis" : "dashboard"}
        isExpanded={showCoPilot}
        onToggle={() => setShowCoPilot(!showCoPilot)}
      />

      {/* Export Panel */}
      <ExportPanel
        model={model}
        analysis={analysis}
        currency={currency}
        isOpen={showExportPanel}
        onClose={() => setShowExportPanel(false)}
      />

      {/* Glossary Panel */}
      <GlossaryPanel
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
      />
    </div>
  );
}

// Default export with Suspense boundary for useSearchParams
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
