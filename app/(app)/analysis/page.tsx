"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { AIAssistant } from "@/components/AIAssistant";
import { useFinancialModel, formatLastSaved } from "@/lib/hooks/useFinancialModel";
import { runFinancialAnalysis } from "@/lib/analysis/financial-engine";
import { createDemoFinancialModel, DEMO_COMPANY_INFO } from "@/lib/demo-data";
import {
  GlassPanel,
  PremiumButton,
  Badge,
  Skeleton,
  SkeletonCard,
} from "@/components/ui/design-system";

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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} width={80} height={36} className="rounded-lg" />
          ))}
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no model
  if (!model || !isModelValid(model) || !analysis) {
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
                Financial Analysis
              </h1>
              <p className="text-lg text-zinc-400 max-w-lg mx-auto">
                DCF valuation, 50+ ratios, scenario modeling, Monte Carlo simulation, and AI-powered insights.
              </p>
            </div>

            {/* Demo Card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <span className="text-3xl">🚀</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xl">{DEMO_COMPANY_INFO.name}</h3>
                  <p className="text-sm text-zinc-400">{DEMO_COMPANY_INFO.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {DEMO_COMPANY_INFO.highlights.map((h, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-zinc-800/50 rounded-full text-zinc-300">
                    {h}
                  </span>
                ))}
              </div>
              <PremiumButton variant="primary" fullWidth loading={isLoadingDemo} onClick={loadDemo}>
                {isLoadingDemo ? "Loading Demo..." : "Launch Full Analysis Demo"}
              </PremiumButton>
            </div>

            <div className="text-center">
              <span className="text-zinc-500 text-sm">or</span>
            </div>

            <div className="mt-4 text-center">
              <Link href="/inputs">
                <PremiumButton variant="secondary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Enter Your Own Data
                </PremiumButton>
              </Link>
            </div>
          </GlassPanel>
        </div>
      </div>
    );
  }

  // Main analysis view
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {model.profile.companyName}
            <Badge variant="info">Analysis</Badge>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {model.profile.forecastYears}-Year Financial Projections & Valuation
            {lastSaved && <span className="mx-2">·</span>}
            {lastSaved && <span>Saved {formatLastSaved(lastSaved)}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PremiumButton variant="ghost" onClick={() => setShowAIChat(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ask AI
          </PremiumButton>
          <Link href="/inputs">
            <PremiumButton variant="ghost">Edit Inputs</PremiumButton>
          </Link>
          <Link href="/reports">
            <PremiumButton variant="secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </PremiumButton>
          </Link>
        </div>
      </div>

      {/* Analysis Dashboard - Full Feature Set */}
      <AnalysisDashboard analysis={analysis} currency={model.profile.currency} />

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
