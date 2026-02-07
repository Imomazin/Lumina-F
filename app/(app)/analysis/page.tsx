"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { AIAssistant, AIChatButton } from "@/components/AIAssistant";
import { useFinancialModel } from "@/lib/hooks/useFinancialModel";
import { runFinancialAnalysis } from "@/lib/analysis/financial-engine";
import { createDemoFinancialModel, DEMO_COMPANY_INFO } from "@/lib/demo-data";
import Link from "next/link";

const STORAGE_KEY = "lumina-f-financial-model";

export default function AnalysisPage() {
  const { model, isLoading, isModelValid, saveModel } = useFinancialModel();
  const [showAIChat, setShowAIChat] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const router = useRouter();

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
      // Force a page reload to re-render with new data
      window.location.reload();
    } catch (error) {
      console.error("Failed to load demo:", error);
      setIsLoadingDemo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  // Empty state - no model or invalid model
  if (!model || !isModelValid(model) || !analysis) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="border-b border-zinc-800 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-white">
              Financial <span className="text-amber-400">Analysis</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Advanced financial projections and valuation
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Analyze</h2>
            <p className="text-zinc-400 text-center max-w-lg mb-8">
              Enter your financial inputs or try our demo to see comprehensive analysis with DCF valuation,
              scenario modeling, 50+ financial ratios, risk analysis, and AI-powered insights.
            </p>

            {/* Demo Card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{DEMO_COMPANY_INFO.name}</h3>
                  <p className="text-xs text-zinc-400">{DEMO_COMPANY_INFO.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {DEMO_COMPANY_INFO.highlights.slice(0, 3).map((h, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-300">
                    {h}
                  </span>
                ))}
              </div>
              <button
                onClick={loadDemo}
                disabled={isLoadingDemo}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>or</span>
            </div>

            <div className="flex gap-4 mt-4">
              <Link
                href="/inputs"
                className="px-6 py-3 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Enter Your Data
              </Link>
            </div>
          </div>
        </div>

        {/* AI Chat Button even in empty state */}
        <AIChatButton onClick={() => setShowAIChat(true)} />
        <AIAssistant
          model={model}
          analysis={null}
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Financial <span className="text-amber-400">Analysis</span>
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {model.profile.companyName} • {model.profile.forecastYears}-Year Projection
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* AI Assistant Quick Access */}
              <button
                onClick={() => setShowAIChat(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all text-sm"
              >
                <span className="text-lg">✨</span>
                Ask AI
              </button>
              <Link
                href="/inputs"
                className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
              >
                Edit Inputs
              </Link>
              <Link
                href="/reports"
                className="px-4 py-2 bg-zinc-700 text-white font-medium rounded-lg hover:bg-zinc-600 transition-colors text-sm"
              >
                Generate Report →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnalysisDashboard analysis={analysis} currency={model.profile.currency} />
      </div>

      {/* AI Chat Button */}
      <AIChatButton onClick={() => setShowAIChat(true)} />

      {/* AI Assistant Modal - with full analysis context */}
      <AIAssistant
        model={model}
        analysis={analysis}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />
    </div>
  );
}
