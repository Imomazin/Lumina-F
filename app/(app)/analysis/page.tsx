"use client";

import { useRouter } from "next/navigation";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { useFinancialModel } from "@/lib/hooks/useFinancialModel";
import Link from "next/link";

export default function AnalysisPage() {
  const router = useRouter();
  const { model, isLoading, isModelValid } = useFinancialModel();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  // Empty state - no model or invalid model
  if (!model || !isModelValid(model)) {
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
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Analysis Data</h2>
            <p className="text-zinc-400 text-center max-w-md mb-8">
              Enter your financial inputs to generate comprehensive analysis with DCF valuation,
              scenario modeling, and 50+ financial metrics.
            </p>
            <div className="flex gap-4">
              <Link
                href="/inputs"
                className="px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
              >
                Enter Inputs
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
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
                {model.profile.companyName} • {model.horizon.years}-Year Projection
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/inputs"
                className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
              >
                Edit Inputs
              </Link>
              <Link
                href="/reports"
                className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors text-sm"
              >
                Generate Report →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnalysisDashboard model={model} />
      </div>
    </div>
  );
}
