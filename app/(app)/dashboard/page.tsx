"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useFinancialModel, formatLastSaved } from "@/lib/hooks/useFinancialModel";
import { runFinancialAnalysis } from "@/lib/analysis/financial-engine";
import { createDemoFinancialModel } from "@/lib/demo-data";
import { DashboardShell, StatCard, DashboardGrid, Panel } from "@/components/DashboardShell";
import { FinanceDashboard } from "@/components/dashboards/FinanceDashboard";
import { KPIDashboard } from "@/components/dashboards/KPIDashboard";
import { ChartsDashboard } from "@/components/dashboards/ChartsDashboard";
import { RiskDashboard } from "@/components/dashboards/RiskDashboard";
import { AIAssistant, AIChatButton } from "@/components/AIAssistant";

type DashboardView = "overview" | "finance" | "kpis" | "charts" | "risk";

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

export default function DashboardPage() {
  const { model, lastSaved, isLoading, isModelValid, saveModel } = useFinancialModel();
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [showAIChat, setShowAIChat] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

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
    {
      id: "overview",
      label: "Overview",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    },
    {
      id: "finance",
      label: "Finance",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      id: "kpis",
      label: "KPIs",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
    {
      id: "charts",
      label: "Charts",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>,
    },
    {
      id: "risk",
      label: "Risk",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Empty State - No Model
  if (!hasValidModel || !analysis) {
    return (
      <DashboardShell
        companyName="Welcome to Lumina F"
        subtitle="Financial Intelligence Platform"
      >
        <div className="max-w-4xl mx-auto py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 mb-6">
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Build Professional Financial Models
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              DCF valuation, scenario analysis, 50+ financial ratios, and AI-powered insights.
            </p>
          </div>

          {/* Quick Start Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Load Demo */}
            <button
              onClick={loadDemo}
              disabled={isLoadingDemo}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 text-left transition-all hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 disabled:opacity-50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <span className="text-xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Try Demo</h3>
                    <p className="text-xs text-amber-400/70">TechVentures Inc.</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Explore a complete 5-year financial model with DCF valuation and scenario analysis.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 group-hover:gap-3 transition-all">
                  {isLoadingDemo ? "Loading..." : "Load Demo"}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </button>

            {/* Create New */}
            <Link
              href="/inputs"
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-all hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Create New Model</h3>
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

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "📊", label: "DCF Valuation" },
              { icon: "📈", label: "50+ Ratios" },
              { icon: "🎯", label: "Scenarios" },
              { icon: "⚡", label: "AI Insights" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm text-zinc-400">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Main Dashboard with Model
  const currency = model.profile.currency;
  const lastYear = analysis.baseCase.yearlyFinancials[analysis.baseCase.yearlyFinancials.length - 1];

  return (
    <DashboardShell
      companyName={model.profile.companyName}
      subtitle={`${model.profile.forecastYears}-Year Analysis`}
      lastSaved={lastSaved ? formatLastSaved(lastSaved) : undefined}
      tabs={viewTabs}
      activeTab={activeView}
      onTabChange={(id) => setActiveView(id as DashboardView)}
      actions={
        <button
          onClick={() => setShowAIChat(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-medium rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Ask AI
        </button>
      }
    >
      {/* Overview View */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <DashboardGrid cols={5} gap={4}>
            <StatCard
              label="Enterprise Value"
              value={formatCurrency(analysis.baseCase.dcfValuation.enterpriseValue, currency)}
              variant="primary"
              size="large"
            />
            <StatCard
              label="Equity Value"
              value={formatCurrency(analysis.baseCase.dcfValuation.equityValue, currency)}
              change={analysis.baseCase.cagr.revenue * 100}
              changeLabel="Rev CAGR"
              variant="success"
            />
            <StatCard
              label="Revenue (Final Year)"
              value={formatCurrency(lastYear.revenue, currency)}
              change={analysis.baseCase.cagr.revenue * 100}
              changeLabel="CAGR"
            />
            <StatCard
              label="EBITDA Margin"
              value={formatPercent(lastYear.ebitdaMargin)}
              variant={lastYear.ebitdaMargin > 0.2 ? "success" : "warning"}
            />
            <StatCard
              label="WACC"
              value={`${analysis.baseCase.dcfValuation.wacc.toFixed(1)}%`}
            />
          </DashboardGrid>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - 8 cols */}
            <div className="col-span-12 xl:col-span-8 space-y-6">
              {/* Scenario Comparison */}
              <Panel title="Scenario Comparison" subtitle="Enterprise Value by Case">
                <div className="grid grid-cols-3 gap-4">
                  {analysis.scenarios.slice(0, 3).map((scenario, idx) => {
                    const colors = [
                      { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400" },
                      { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
                      { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
                    ];
                    const c = colors[idx] || colors[1];

                    return (
                      <div key={scenario.scenarioId} className={`rounded-xl ${c.bg} border ${c.border} p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-white text-sm">{scenario.scenarioName}</span>
                          <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                            {scenario.probability}%
                          </span>
                        </div>
                        <p className={`text-2xl font-bold ${c.text} mb-2`}>
                          {formatCurrency(scenario.dcfValuation.enterpriseValue, currency)}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">IRR</span>
                          <span className={`font-mono ${c.text}`}>
                            {scenario.irr === Infinity ? "∞" : formatPercent(scenario.irr)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              {/* Revenue Trend Chart */}
              <Panel title="Revenue & Profitability" subtitle="Annual performance">
                <div className="h-64 flex items-end gap-3">
                  {analysis.baseCase.yearlyFinancials.map((yf, idx) => {
                    const maxRevenue = Math.max(...analysis.baseCase.yearlyFinancials.map(y => y.revenue));
                    const height = (yf.revenue / maxRevenue) * 100;
                    const prevRevenue = idx > 0 ? analysis.baseCase.yearlyFinancials[idx - 1].revenue : yf.revenue;
                    const growth = ((yf.revenue - prevRevenue) / prevRevenue) * 100;

                    return (
                      <div key={yf.year} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center">
                          <span className="text-xs text-zinc-400 mb-1">
                            {formatCurrency(yf.revenue, currency)}
                          </span>
                          {idx > 0 && (
                            <span className={`text-[10px] mb-1 ${growth >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {growth >= 0 ? "+" : ""}{growth.toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div
                          className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all hover:from-amber-500 hover:to-amber-300"
                          style={{ height: `${height}%`, minHeight: "20px" }}
                        />
                        <span className="text-xs text-zinc-500">{yf.year}</span>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>

            {/* Right Column - 4 cols */}
            <div className="col-span-12 xl:col-span-4 space-y-6">
              {/* Strengths */}
              <Panel title="Strengths & Opportunities">
                <ul className="space-y-2">
                  {analysis.executiveSummary.strengthsOpportunities.slice(0, 4).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-zinc-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </Panel>

              {/* Risks */}
              <Panel title="Risks & Challenges">
                <ul className="space-y-2">
                  {analysis.executiveSummary.risksThreats.slice(0, 4).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-zinc-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </Panel>

              {/* Quick Actions */}
              <Panel title="Quick Actions">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/inputs"
                    className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-sm text-zinc-300"
                  >
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Inputs
                  </Link>
                  <Link
                    href="/analysis"
                    className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-sm text-zinc-300"
                  >
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Full Analysis
                  </Link>
                  <Link
                    href="/reports"
                    className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-sm text-zinc-300"
                  >
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </Link>
                  <button
                    onClick={() => setShowAIChat(true)}
                    className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-sm text-zinc-300"
                  >
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Ask AI
                  </button>
                </div>
              </Panel>
            </div>
          </div>

          {/* Bottom Row - Key Ratios */}
          <Panel title="Key Financial Metrics">
            <DashboardGrid cols={6} gap={4}>
              <div className="text-center p-3 rounded-lg bg-zinc-800/30">
                <p className="text-xs text-zinc-500 mb-1">Gross Margin</p>
                <p className="text-lg font-bold text-white">{formatPercent(lastYear.grossMargin)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-800/30">
                <p className="text-xs text-zinc-500 mb-1">EBITDA Margin</p>
                <p className="text-lg font-bold text-white">{formatPercent(lastYear.ebitdaMargin)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-800/30">
                <p className="text-xs text-zinc-500 mb-1">Net Margin</p>
                <p className="text-lg font-bold text-white">{formatPercent(lastYear.netMargin)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-800/30">
                <p className="text-xs text-zinc-500 mb-1">FCF Margin</p>
                <p className="text-lg font-bold text-white">{formatPercent(lastYear.fcfMargin)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-800/30">
                <p className="text-xs text-zinc-500 mb-1">Rev CAGR</p>
                <p className="text-lg font-bold text-green-400">{formatPercent(analysis.baseCase.cagr.revenue)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-800/30">
                <p className="text-xs text-zinc-500 mb-1">EPS</p>
                <p className="text-lg font-bold text-white">{formatCurrency(lastYear.eps, currency)}</p>
              </div>
            </DashboardGrid>
          </Panel>
        </div>
      )}

      {/* Finance View */}
      {activeView === "finance" && (
        <FinanceDashboard analysis={analysis} currency={currency} />
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

      {/* AI Chat */}
      <AIAssistant
        model={model}
        analysis={analysis}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />
    </DashboardShell>
  );
}
