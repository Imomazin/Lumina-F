"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "./FileUpload";
import { ParsedFinancialData } from "@/lib/utils/file-parser";
import { useFinancialModel } from "@/lib/hooks/useFinancialModel";
import { createDemoFinancialModel } from "@/lib/demo-data";

interface LandingExperienceProps {
  onStartAnalyst: () => void;
  onFileImport: (data: ParsedFinancialData) => void;
}

export function LandingExperience({ onStartAnalyst, onFileImport }: LandingExperienceProps) {
  const router = useRouter();
  const { saveModel } = useFinancialModel();
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const loadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      const demoModel = createDemoFinancialModel();
      saveModel(demoModel);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to load demo:", error);
      setIsLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-amber-950/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl text-amber-400">◆</span>
            <h1 className="text-4xl font-bold">
              <span className="text-amber-400">Lumina</span>
              <span className="text-white">F</span>
            </h1>
          </div>
          <p className="text-xl text-zinc-400 max-w-2xl">
            Financial Intelligence & Forecasting Engine. Build professional financial models,
            run DCF valuations, stress test scenarios, and generate boardroom-ready analysis.
          </p>

          {/* Quick Stats */}
          <div className="flex gap-8 mt-8">
            {[
              { label: "Financial Ratios", value: "50+" },
              { label: "Valuation Methods", value: "4" },
              { label: "Stress Scenarios", value: "5+" },
              { label: "Export Formats", value: "PDF" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Split Screen - Main Entry Points */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT - AI Financial Analyst */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <svg viewBox="0 0 200 200">
                <circle cx="150" cy="50" r="80" fill="#f59e0b" />
              </svg>
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Financial Analyst</h2>
                  <p className="text-sm text-amber-400/70">Guided 8-Step Journey</p>
                </div>
              </div>

              <p className="text-zinc-400 mb-6">
                Our AI guides you through building a complete financial model step-by-step.
                Perfect for startups, growth companies, or detailed financial planning.
              </p>

              {/* Journey Steps Preview */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { step: 1, label: "Revenue Streams" },
                  { step: 2, label: "Cost Structure" },
                  { step: 3, label: "Working Capital" },
                  { step: 4, label: "Debt & Equity" },
                  { step: 5, label: "Tax & Policy" },
                  { step: 6, label: "Projections" },
                  { step: 7, label: "Valuation" },
                  { step: 8, label: "Stress Testing" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-medium">
                      {item.step}
                    </span>
                    <span className="text-zinc-400">{item.label}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onStartAnalyst}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start AI-Guided Analysis
              </button>

              <p className="text-xs text-zinc-500 text-center mt-3">
                ~15 minutes • No financial expertise required
              </p>
            </div>
          </div>

          {/* RIGHT - Upload Financial Statements */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-zinc-900 to-zinc-900 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <svg viewBox="0 0 200 200">
                <circle cx="150" cy="50" r="80" fill="#3b82f6" />
              </svg>
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Upload Financials</h2>
                  <p className="text-sm text-blue-400/70">Excel, CSV, or PDF</p>
                </div>
              </div>

              <p className="text-zinc-400 mb-6">
                Already have financial statements? Upload them and we'll auto-parse,
                map to our canonical model, and generate instant analysis.
              </p>

              {/* Supported formats */}
              <div className="flex gap-3 mb-6">
                {[
                  { format: "XLSX", icon: "📊" },
                  { format: "CSV", icon: "📄" },
                  { format: "PDF", icon: "📑" },
                ].map((f) => (
                  <div key={f.format} className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg">
                    <span>{f.icon}</span>
                    <span className="text-sm text-zinc-300">{f.format}</span>
                  </div>
                ))}
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                <FileUpload onDataImported={onFileImport} />
              </div>

              <p className="text-xs text-zinc-500 text-center mt-3">
                Supports Income Statement, Balance Sheet, Cash Flow
              </p>
            </div>
          </div>
        </div>

        {/* Demo Option */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <span className="text-zinc-400">Just exploring?</span>
            <button
              onClick={loadDemo}
              disabled={isLoadingDemo}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
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
                  <span>🚀</span>
                  Try Demo Company
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h3 className="text-2xl font-bold text-white text-center mb-12">
            Professional-Grade Financial Analysis
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                title: "Complete Financial Statements",
                description: "Auto-generate Income Statement, Balance Sheet, and Cash Flow with accounting identity enforcement.",
                gradient: "from-amber-500/20 to-amber-500/5",
              },
              {
                icon: "💰",
                title: "Multi-Method Valuation",
                description: "DCF with WACC, comparable multiples (EV/Revenue, EV/EBITDA, P/E), and precedent transactions.",
                gradient: "from-green-500/20 to-green-500/5",
              },
              {
                icon: "⚡",
                title: "Stress Testing & VaR",
                description: "Monte Carlo simulation, survival probability, covenant monitoring, and black swan scenarios.",
                gradient: "from-red-500/20 to-red-500/5",
              },
              {
                icon: "📈",
                title: "50+ Financial Ratios",
                description: "Profitability, liquidity, leverage, efficiency, growth, and valuation metrics with benchmarking.",
                gradient: "from-blue-500/20 to-blue-500/5",
              },
              {
                icon: "🎯",
                title: "Sensitivity Analysis",
                description: "Tornado charts, spider plots, and scenario comparison matrices for key value drivers.",
                gradient: "from-purple-500/20 to-purple-500/5",
              },
              {
                icon: "📋",
                title: "Executive Reports",
                description: "Generate boardroom-ready PDF reports with investment ratings and AI-powered insights.",
                gradient: "from-cyan-500/20 to-cyan-500/5",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`rounded-xl border border-zinc-800 bg-gradient-to-br ${feature.gradient} p-6 hover:border-zinc-700 transition-colors`}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-zinc-500">
            Built with accounting discipline. Ready for boardroom scrutiny.
          </p>
          <button
            onClick={onStartAnalyst}
            className="px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
          >
            Start Analysis →
          </button>
        </div>
      </div>
    </div>
  );
}
