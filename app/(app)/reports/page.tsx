"use client";

import { ExecutiveReport } from "@/components/ExecutiveReport";
import { useFinancialModel } from "@/lib/hooks/useFinancialModel";
import Link from "next/link";

export default function ReportsPage() {
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
              Executive <span className="text-amber-400">Report</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Professional financial report ready for export
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Report Data</h2>
            <p className="text-zinc-400 text-center max-w-md mb-8">
              Enter your financial inputs to generate a professional executive report
              with investment recommendations, DCF valuation, and scenario analysis.
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
    <div className="min-h-screen bg-[#0a0a0a] print:bg-white">
      {/* Header - hidden on print */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Executive <span className="text-amber-400">Report</span>
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {model.profile.companyName} • {model.horizon.years}-Year Financial Projection
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/analysis"
                className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
              >
                ← Back to Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Report */}
      <div className="max-w-5xl mx-auto px-6 py-8 print:px-0 print:py-0">
        <ExecutiveReport model={model} />
      </div>
    </div>
  );
}
