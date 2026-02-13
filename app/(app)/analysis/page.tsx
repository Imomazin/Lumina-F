"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardShell, StatCard, DashboardGrid, Panel } from "@/components/DashboardShell";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { AIAssistant } from "@/components/AIAssistant";
import { useFinancialModel, formatLastSaved } from "@/lib/hooks/useFinancialModel";
import { runFinancialAnalysis } from "@/lib/analysis/financial-engine";
import { createDemoFinancialModel, DEMO_COMPANY_INFO } from "@/lib/demo-data";

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

export default function AnalysisPage() {
  const { model, lastSaved, isLoading, isModelValid, saveModel } = useFinancialModel();
  const [showAIChat, setShowAIChat] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const analysis = useMemo(() => {
    if (model && isModelValid(model)) {
      return runFinancialAnalysis(model);
    }
    return null;
  }, [model, isModelValid]);

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

  // Empty state - no model or invalid model
  if (!model || !isModelValid(model) || !analysis) {
    return (
      <DashboardShell
        companyName="Financial Analysis"
        subtitle="Advanced projections and valuation"
      >
        <div className="max-w-3xl mx-auto py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 mb-6">
              <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Analyze</h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Enter your financial inputs or try our demo to see comprehensive analysis with DCF valuation,
              scenario modeling, 50+ financial ratios, and AI-powered insights.
            </p>
          </div>

          {/* Demo Card */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">{DEMO_COMPANY_INFO.name}</h3>
                <p className="text-sm text-zinc-400">{DEMO_COMPANY_INFO.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {DEMO_COMPANY_INFO.highlights.slice(0, 4).map((h, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-zinc-800/50 rounded-full text-zinc-300">
                  {h}
                </span>
              ))}
            </div>
            <button
              onClick={loadDemo}
              disabled={isLoadingDemo}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoadingDemo ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading Demo Analysis...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  See Full Analysis Demo
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-zinc-500 text-sm">or</span>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/inputs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Enter Your Data
            </Link>
          </div>
        </div>

        {/* AI Chat */}
        <AIAssistant
          model={model}
          analysis={null}
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      companyName={model.profile.companyName}
      subtitle={`${model.profile.forecastYears}-Year Financial Analysis`}
      lastSaved={lastSaved ? formatLastSaved(lastSaved) : undefined}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIChat(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-medium rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ask AI
          </button>
          <Link
            href="/inputs"
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Edit Inputs
          </Link>
          <Link
            href="/reports"
            className="px-3 py-1.5 bg-zinc-800 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Export Report
          </Link>
        </div>
      }
    >
      {/* Full Analysis Dashboard */}
      <AnalysisDashboard analysis={analysis} currency={model.profile.currency} />

      {/* AI Assistant Modal */}
      <AIAssistant
        model={model}
        analysis={analysis}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />
    </DashboardShell>
  );
}
