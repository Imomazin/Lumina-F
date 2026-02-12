"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useFinancialModel, formatLastSaved } from "@/lib/hooks/useFinancialModel";
import { runFinancialAnalysis } from "@/lib/analysis/financial-engine";
import { createDemoFinancialModel } from "@/lib/demo-data";
import { KPIDashboard } from "@/components/dashboards/KPIDashboard";
import { ChartsDashboard } from "@/components/dashboards/ChartsDashboard";
import { RiskDashboard } from "@/components/dashboards/RiskDashboard";
import { FinanceDashboard } from "@/components/dashboards/FinanceDashboard";
import { AIAssistant, AIChatButton } from "@/components/AIAssistant";
import { LandingExperience } from "@/components/LandingExperience";
import { DemoBanner, FeatureBanner } from "@/components/Banners";
import { ParsedFinancialData } from "@/lib/utils/file-parser";

type DashboardTab = "overview" | "finance" | "kpis" | "charts" | "risk";

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

// Animated number component
function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useState(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + (end - start) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  });

  return <span>{format(displayValue)}</span>;
}

// Mini sparkline for quick metrics
function MiniSparkline({ data, color = "#f59e0b" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - ((v - min) / range) * 16;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="60" height="24" className="opacity-60">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const { model, lastSaved, isLoading, isModelValid, clearModel, saveModel } = useFinancialModel();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const hasValidModel = model && isModelValid(model);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "📊" },
    { id: "finance" as const, label: "Finance", icon: "💰" },
    { id: "kpis" as const, label: "KPIs", icon: "📈" },
    { id: "charts" as const, label: "Charts", icon: "📉" },
    { id: "risk" as const, label: "Risk", icon: "⚠️" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-amber-400">◆</span>
                <span className="text-amber-400">Lumina</span>
                <span className="text-white">F</span>
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {hasValidModel ? `${model.profile.companyName} • ${model.profile.forecastYears}-Year Analysis` : "Financial modeling and analysis platform"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-xs text-zinc-500">
                  Last saved: {formatLastSaved(lastSaved)}
                </span>
              )}
              {hasValidModel && (
                <button
                  onClick={() => setShowAIChat(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all text-sm"
                >
                  <span>✨</span>
                  Ask AI
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          {hasValidModel && (
            <div className="flex gap-1 mt-4 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-zinc-800 text-amber-400 border-t border-l border-r border-zinc-700"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Content */}
        {hasValidModel && analysis ? (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Hero Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-6">
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                      <svg viewBox="0 0 100 100"><circle cx="80" cy="20" r="60" fill="#f59e0b" /></svg>
                    </div>
                    <p className="text-xs text-amber-400/70 uppercase tracking-wider">Enterprise Value</p>
                    <p className="mt-2 text-3xl font-bold text-amber-400">
                      {formatCurrency(analysis.baseCase.dcfValuation.enterpriseValue, model.profile.currency)}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <MiniSparkline data={analysis.baseCase.yearlyFinancials.map(yf => yf.revenue)} />
                      <span className="text-xs text-amber-400/60">Revenue trend</span>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 p-6">
                    <p className="text-xs text-green-400/70 uppercase tracking-wider">Equity Value</p>
                    <p className="mt-2 text-3xl font-bold text-green-400">
                      {formatCurrency(analysis.baseCase.dcfValuation.equityValue, model.profile.currency)}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-sm ${analysis.baseCase.dcfValuation.equityValue > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        WACC: {formatPercent(analysis.baseCase.dcfValuation.wacc)}
                      </span>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-6">
                    <p className="text-xs text-blue-400/70 uppercase tracking-wider">Investment Rating</p>
                    <p className={`mt-2 text-3xl font-bold capitalize ${
                      analysis.executiveSummary.investmentRating.includes('buy') ? 'text-green-400' :
                      analysis.executiveSummary.investmentRating === 'hold' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {analysis.executiveSummary.investmentRating.replace('_', ' ')}
                    </p>
                    <div className="mt-3">
                      <span className="text-xs text-zinc-500">Confidence: {analysis.executiveSummary.confidenceLevel}</span>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-6">
                    <p className="text-xs text-purple-400/70 uppercase tracking-wider">Revenue CAGR</p>
                    <p className="mt-2 text-3xl font-bold text-purple-400">
                      {formatPercent(analysis.baseCase.cagr.revenue)}
                    </p>
                    <div className="mt-3">
                      <span className="text-xs text-zinc-500">
                        {model.profile.forecastYears}-year growth
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Highlights */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Strengths & Opportunities
                    </h3>
                    <ul className="space-y-3">
                      {analysis.executiveSummary.strengthsOpportunities.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-zinc-300 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Risks & Challenges
                    </h3>
                    <ul className="space-y-3">
                      {analysis.executiveSummary.risksThreats.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-red-500 mt-0.5">⚠</span>
                          <span className="text-zinc-300 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Scenario Preview */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Scenario Analysis Preview</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {analysis.scenarios.slice(0, 3).map((scenario, idx) => {
                      const colors = [
                        { border: "border-green-500/30", bg: "bg-green-500/10", text: "text-green-400" },
                        { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400" },
                        { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-400" },
                      ];
                      const c = colors[idx] || colors[1];

                      return (
                        <div key={scenario.scenarioId} className={`rounded-lg border ${c.border} ${c.bg} p-4`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-white">{scenario.scenarioName}</span>
                            <span className="text-xs text-zinc-500">{scenario.probability}%</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">EV</span>
                              <span className={`font-mono ${c.text}`}>
                                {formatCurrency(scenario.dcfValuation.enterpriseValue, model.profile.currency)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">IRR</span>
                              <span className={`font-mono ${c.text}`}>
                                {formatPercent(scenario.irr)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Link
                    href="/inputs"
                    className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-amber-500/50 hover:bg-zinc-800/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-2xl">📝</div>
                    <div>
                      <h3 className="font-medium text-white group-hover:text-amber-400">Edit Inputs</h3>
                      <p className="text-sm text-zinc-500">Modify financial data</p>
                    </div>
                  </Link>
                  <Link
                    href="/analysis"
                    className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-blue-500/50 hover:bg-zinc-800/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-2xl">📊</div>
                    <div>
                      <h3 className="font-medium text-white group-hover:text-blue-400">Full Analysis</h3>
                      <p className="text-sm text-zinc-500">Detailed breakdowns</p>
                    </div>
                  </Link>
                  <Link
                    href="/reports"
                    className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-green-500/50 hover:bg-zinc-800/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-2xl">📄</div>
                    <div>
                      <h3 className="font-medium text-white group-hover:text-green-400">Generate Report</h3>
                      <p className="text-sm text-zinc-500">Export PDF</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "kpis" && (
              <KPIDashboard analysis={analysis} currency={model.profile.currency} />
            )}

            {activeTab === "finance" && (
              <FinanceDashboard analysis={analysis} currency={model.profile.currency} />
            )}

            {activeTab === "charts" && (
              <ChartsDashboard analysis={analysis} currency={model.profile.currency} />
            )}

            {activeTab === "risk" && (
              <RiskDashboard analysis={analysis} currency={model.profile.currency} />
            )}
          </>
        ) : (
          /* No model state */
          <div className="space-y-8">
            {/* Demo Banner */}
            <DemoBanner onLoadDemo={loadDemo} isLoading={isLoadingDemo} />

            {/* Welcome Hero */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-amber-500/5 p-8 md:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                <svg viewBox="0 0 200 200">
                  <circle cx="150" cy="50" r="100" fill="#f59e0b" />
                  <circle cx="50" cy="150" r="80" fill="#3b82f6" />
                </svg>
              </div>
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Welcome to <span className="text-amber-400">Lumina F</span>
                </h2>
                <p className="text-lg text-zinc-400 max-w-2xl mb-8">
                  Professional financial modeling and analysis platform. Build DCF models,
                  analyze scenarios, and generate executive reports with AI-powered insights.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/inputs"
                    className="inline-flex items-center px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    Start Analysis
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setShowAIChat(true)}
                    className="inline-flex items-center px-6 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <span className="mr-2">✨</span>
                    Chat with AI
                  </button>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: "📊", title: "DCF Valuation", desc: "Comprehensive discounted cash flow analysis with sensitivity modeling", color: "amber" },
                { icon: "📈", title: "50+ Ratios", desc: "Profitability, liquidity, leverage, and efficiency metrics", color: "blue" },
                { icon: "🎯", title: "Scenario Analysis", desc: "Model best, base, and worst case scenarios with probabilities", color: "green" },
                { icon: "🤖", title: "AI Assistant", desc: "Get instant insights and answers about your financials", color: "purple" },
                { icon: "📄", title: "Executive Reports", desc: "Generate professional PDF reports for stakeholders", color: "rose" },
                { icon: "📁", title: "File Import", desc: "Upload Excel or CSV files to auto-populate your model", color: "cyan" },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-${feature.color}-500/50 transition-all`}
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Getting Started */}
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Getting Started</h2>
              <div className="grid gap-6 md:grid-cols-4">
                {[
                  { step: 1, title: "Enter Data", desc: "Input financial data or upload files", icon: "📝" },
                  { step: 2, title: "Configure", desc: "Set valuation assumptions", icon: "⚙️" },
                  { step: 3, title: "Analyze", desc: "Review metrics and scenarios", icon: "📊" },
                  { step: 4, title: "Report", desc: "Generate executive summary", icon: "📄" },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="relative inline-flex">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-2xl mb-3">
                        {item.icon}
                      </span>
                      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Button */}
      <AIChatButton onClick={() => setShowAIChat(true)} />

      {/* AI Assistant */}
      <AIAssistant
        model={model}
        analysis={analysis}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />
    </div>
  );
}
