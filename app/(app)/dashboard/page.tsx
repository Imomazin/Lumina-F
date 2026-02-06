"use client";

import Link from "next/link";
import { useFinancialModel, formatLastSaved } from "@/lib/hooks/useFinancialModel";
import { runFinancialAnalysis } from "@/lib/analysis/financial-engine";
import { useMemo } from "react";

function formatCurrency(value: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$",
    CHF: "CHF", CNY: "¥", INR: "₹", BRL: "R$", MXN: "$", KRW: "₩",
    SGD: "S$", HKD: "HK$"
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
  const { model, lastSaved, isLoading, isModelValid, clearModel } = useFinancialModel();

  const analysis = useMemo(() => {
    if (model && isModelValid(model)) {
      return runFinancialAnalysis(model);
    }
    return null;
  }, [model, isModelValid]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  const hasValidModel = model && isModelValid(model);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                <span className="text-amber-400">Lumina</span> F Dashboard
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Financial modeling and analysis platform
              </p>
            </div>
            {lastSaved && (
              <span className="text-xs text-zinc-500">
                Last saved: {formatLastSaved(lastSaved)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Status</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {hasValidModel ? "Ready" : "Not Started"}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {hasValidModel ? "Data entered and valid" : "Enter financial data to begin"}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasValidModel
                  ? "bg-green-500/20 text-green-400"
                  : "bg-zinc-800 text-zinc-400"
              }`}>
                {hasValidModel ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-sm text-zinc-400">Company</p>
            <p className="mt-1 text-xl font-semibold text-white truncate">
              {model?.profile.companyName || "—"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {model?.profile.industry || "No industry set"}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-sm text-zinc-400">Projection</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {model ? `${model.horizon.years} Years` : "—"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {model ? `Starting ${model.horizon.startYear}` : "No forecast configured"}
            </p>
          </div>
        </div>

        {/* Quick Metrics (if model exists) */}
        {hasValidModel && analysis && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-xs text-amber-400/70 uppercase tracking-wider">Enterprise Value</p>
              <p className="mt-2 text-2xl font-bold text-amber-400">
                {formatCurrency(analysis.dcfValuation.enterpriseValue, model.profile.currency)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Investment Rating</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {analysis.executiveSummary.investmentRating}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">WACC</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatPercent(analysis.dcfValuation.wacc)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">IRR</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatPercent(analysis.dcfValuation.irr)}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/inputs"
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-amber-500/50 hover:bg-zinc-800/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-medium text-white group-hover:text-amber-400 transition-colors">
                {hasValidModel ? "Edit Inputs" : "Start Analysis"}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {hasValidModel ? "Modify your financial data" : "Enter comprehensive financial data"}
              </p>
            </Link>

            <Link
              href="/analysis"
              className={`group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all ${
                hasValidModel
                  ? "hover:border-amber-500/50 hover:bg-zinc-800/50"
                  : "opacity-60 cursor-not-allowed"
              }`}
              onClick={(e) => !hasValidModel && e.preventDefault()}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-medium text-white group-hover:text-amber-400 transition-colors">
                View Analysis
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                DCF valuation, ratios, and scenarios
              </p>
            </Link>

            <Link
              href="/reports"
              className={`group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all ${
                hasValidModel
                  ? "hover:border-amber-500/50 hover:bg-zinc-800/50"
                  : "opacity-60 cursor-not-allowed"
              }`}
              onClick={(e) => !hasValidModel && e.preventDefault()}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-400 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-white group-hover:text-amber-400 transition-colors">
                Executive Report
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Generate professional PDF report
              </p>
            </Link>
          </div>
        </div>

        {/* Getting Started (if no model) */}
        {!hasValidModel && (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-8">
            <h2 className="text-lg font-semibold text-white mb-4">Getting Started</h2>
            <ol className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Enter Financial Data",
                  desc: "Input your company profile, revenue streams, costs, and balance sheet"
                },
                {
                  step: 2,
                  title: "Configure Valuation",
                  desc: "Set WACC, terminal growth rate, and DCF assumptions"
                },
                {
                  step: 3,
                  title: "Review Analysis",
                  desc: "Explore 50+ financial ratios, DCF valuation, and scenario modeling"
                },
                {
                  step: 4,
                  title: "Generate Report",
                  desc: "Export professional executive report with investment recommendations"
                }
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-medium text-black">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6">
              <Link
                href="/inputs"
                className="inline-flex items-center px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
              >
                Start Financial Analysis
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Current Session Details (if model exists) */}
        {hasValidModel && model && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Current Session</h2>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear this session? This cannot be undone.")) {
                    clearModel();
                  }
                }}
                className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear Session
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Industry</p>
                <p className="mt-1 font-medium text-white">{model.profile.industry}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Currency</p>
                <p className="mt-1 font-medium text-white">{model.profile.currency}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Revenue Streams</p>
                <p className="mt-1 font-medium text-white">{model.revenue.streams.length}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Scenarios</p>
                <p className="mt-1 font-medium text-white">{model.scenarios.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
