"use client";

import { useState, useMemo } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface CapitalEngineProps {
  analysis: AnalysisResult;
  currency: string;
}

function fmt(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$" };
  const s = symbols[currency] || "$";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${s}${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${s}${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${s}${(value / 1e3).toFixed(0)}K`;
  return `${s}${value.toFixed(0)}`;
}

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

interface InvestmentProject {
  id: string;
  name: string;
  type: "expansion" | "maintenance" | "strategic" | "efficiency";
  initialInvestment: number;
  cashFlows: number[];
  npv: number;
  irr: number;
  paybackPeriod: number;
  riskLevel: "low" | "medium" | "high";
  status: "under_review" | "approved" | "rejected" | "active";
}

// NPV Calculator
function calculateNPV(initialInvestment: number, cashFlows: number[], discountRate: number): number {
  let npv = -initialInvestment;
  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + discountRate, i + 1);
  }
  return npv;
}

// IRR Calculator (Newton-Raphson method)
function calculateIRR(initialInvestment: number, cashFlows: number[]): number {
  let irr = 0.1; // Initial guess
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = -initialInvestment;
    let derivative = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + irr, t + 1);
      npv += cashFlows[t] / discountFactor;
      derivative -= (t + 1) * cashFlows[t] / Math.pow(1 + irr, t + 2);
    }

    if (Math.abs(npv) < tolerance) break;
    irr = irr - npv / derivative;
  }

  return Math.max(0, Math.min(irr, 2)); // Cap at 200%
}

// Payback Period Calculator
function calculatePayback(initialInvestment: number, cashFlows: number[]): number {
  let cumulative = -initialInvestment;

  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative >= 0) {
      // Interpolate within the year
      const prevCumulative = cumulative - cashFlows[i];
      return i + (Math.abs(prevCumulative) / cashFlows[i]);
    }
  }

  return cashFlows.length; // Doesn't pay back within projection
}

export function CapitalEngine({ analysis, currency }: CapitalEngineProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [customDiscountRate, setCustomDiscountRate] = useState<number>(
    analysis.baseCase.dcfValuation.wacc
  );

  const wacc = analysis.baseCase.dcfValuation.wacc / 100;

  // Generate sample investment projects based on company data
  const projects = useMemo<InvestmentProject[]>(() => {
    const baseRevenue = analysis.baseCase.yearlyFinancials[0]?.revenue || 10000000;

    const projectData = [
      {
        id: "proj-1",
        name: "Manufacturing Expansion",
        type: "expansion" as const,
        initialInvestment: baseRevenue * 0.15,
        annualReturn: 0.25,
        years: 5,
        riskLevel: "medium" as const,
      },
      {
        id: "proj-2",
        name: "Technology Upgrade",
        type: "efficiency" as const,
        initialInvestment: baseRevenue * 0.08,
        annualReturn: 0.35,
        years: 4,
        riskLevel: "low" as const,
      },
      {
        id: "proj-3",
        name: "Market Entry - APAC",
        type: "strategic" as const,
        initialInvestment: baseRevenue * 0.2,
        annualReturn: 0.18,
        years: 6,
        riskLevel: "high" as const,
      },
      {
        id: "proj-4",
        name: "Equipment Maintenance",
        type: "maintenance" as const,
        initialInvestment: baseRevenue * 0.05,
        annualReturn: 0.45,
        years: 3,
        riskLevel: "low" as const,
      },
    ];

    return projectData.map(p => {
      const cashFlows = Array(p.years).fill(0).map((_, i) =>
        p.initialInvestment * p.annualReturn * (1 + i * 0.05) // Growing cash flows
      );

      const npv = calculateNPV(p.initialInvestment, cashFlows, wacc);
      const irr = calculateIRR(p.initialInvestment, cashFlows);
      const paybackPeriod = calculatePayback(p.initialInvestment, cashFlows);

      return {
        ...p,
        cashFlows,
        npv,
        irr,
        paybackPeriod,
        status: npv > 0 ? "approved" as const : "under_review" as const,
      };
    });
  }, [analysis, wacc]);

  // Portfolio summary
  const portfolioSummary = useMemo(() => {
    const approved = projects.filter(p => p.npv > 0);
    const totalInvestment = approved.reduce((sum, p) => sum + p.initialInvestment, 0);
    const totalNPV = approved.reduce((sum, p) => sum + p.npv, 0);
    const weightedIRR = approved.reduce((sum, p) => sum + p.irr * p.initialInvestment, 0) / totalInvestment;
    const avgPayback = approved.reduce((sum, p) => sum + p.paybackPeriod, 0) / approved.length;

    return { approved, totalInvestment, totalNPV, weightedIRR, avgPayback };
  }, [projects]);

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Capital & Investment Engine</h2>
          <p className="text-sm text-zinc-500 mt-1">NPV, IRR, Payback analysis for strategic investments</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Discount Rate:</span>
            <input
              type="number"
              value={(customDiscountRate).toFixed(1)}
              onChange={(e) => setCustomDiscountRate(parseFloat(e.target.value))}
              step="0.5"
              min="0"
              max="30"
              className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white text-center focus:outline-none focus:border-amber-500"
            />
            <span className="text-xs text-zinc-500">%</span>
          </div>
          <span className="text-xs text-zinc-600">(WACC: {analysis.baseCase.dcfValuation.wacc.toFixed(1)}%)</span>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-5">
          <p className="text-xs text-amber-400/80 uppercase tracking-wider font-medium">Total Investment</p>
          <p className="text-2xl font-bold text-white mt-2">{fmt(portfolioSummary.totalInvestment, currency)}</p>
          <p className="text-xs text-amber-400/60 mt-1">{portfolioSummary.approved.length} approved projects</p>
        </div>

        <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 p-5">
          <p className="text-xs text-green-400/80 uppercase tracking-wider font-medium">Portfolio NPV</p>
          <p className="text-2xl font-bold text-green-400 mt-2">{fmt(portfolioSummary.totalNPV, currency)}</p>
          <p className="text-xs text-green-400/60 mt-1">at {customDiscountRate.toFixed(1)}% discount</p>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-5">
          <p className="text-xs text-blue-400/80 uppercase tracking-wider font-medium">Weighted IRR</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">{pct(portfolioSummary.weightedIRR)}</p>
          <p className="text-xs text-blue-400/60 mt-1">
            {portfolioSummary.weightedIRR > wacc ? "Above WACC ✓" : "Below WACC ✗"}
          </p>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-5">
          <p className="text-xs text-purple-400/80 uppercase tracking-wider font-medium">Avg Payback</p>
          <p className="text-2xl font-bold text-purple-400 mt-2">{portfolioSummary.avgPayback.toFixed(1)} yrs</p>
          <p className="text-xs text-purple-400/60 mt-1">simple payback period</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Value Created</p>
          <p className="text-2xl font-bold text-white mt-2">
            {((portfolioSummary.totalNPV / portfolioSummary.totalInvestment) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-zinc-500 mt-1">NPV / Investment</p>
        </div>
      </div>

      {/* Projects Table & Details */}
      <div className="grid grid-cols-12 gap-6">
        {/* Projects List */}
        <div className="col-span-7 rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Investment Projects</h3>
          </div>

          <div className="divide-y divide-zinc-800/50">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`w-full p-4 text-left transition-all hover:bg-zinc-800/30 ${
                  selectedProject === project.id ? "bg-zinc-800/50 border-l-2 border-amber-500" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      project.type === "expansion" ? "bg-blue-500/20 text-blue-400" :
                      project.type === "efficiency" ? "bg-green-500/20 text-green-400" :
                      project.type === "strategic" ? "bg-purple-500/20 text-purple-400" :
                      "bg-zinc-700 text-zinc-400"
                    }`}>
                      {project.type === "expansion" ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ) : project.type === "efficiency" ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ) : project.type === "strategic" ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{project.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 uppercase">
                          {project.type}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                          project.riskLevel === "low" ? "bg-green-500/20 text-green-400" :
                          project.riskLevel === "medium" ? "bg-amber-500/20 text-amber-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {project.riskLevel} risk
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-mono text-white">{fmt(project.initialInvestment, currency)}</p>
                    <p className={`text-xs font-mono mt-1 ${project.npv >= 0 ? "text-green-400" : "text-red-400"}`}>
                      NPV: {project.npv >= 0 ? "+" : ""}{fmt(project.npv, currency)}
                    </p>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800/50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500">IRR:</span>
                    <span className={`text-xs font-mono ${project.irr > wacc ? "text-green-400" : "text-red-400"}`}>
                      {pct(project.irr)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500">Payback:</span>
                    <span className="text-xs font-mono text-zinc-300">{project.paybackPeriod.toFixed(1)} yrs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500">Duration:</span>
                    <span className="text-xs font-mono text-zinc-300">{project.cashFlows.length} yrs</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Project Details */}
        <div className="col-span-5 space-y-4">
          {selectedProjectData ? (
            <>
              {/* NPV Chart */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <h3 className="text-sm font-semibold text-white mb-4">Cash Flow Projection</h3>

                <div className="flex items-end gap-2 h-40">
                  {/* Initial Investment */}
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[10px] text-red-400 mb-1">
                      -{fmt(selectedProjectData.initialInvestment, currency)}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t"
                      style={{ height: "80%" }}
                    />
                    <span className="text-[10px] text-zinc-500 mt-1">Y0</span>
                  </div>

                  {/* Cash Flows */}
                  {selectedProjectData.cashFlows.map((cf, idx) => {
                    const maxCF = Math.max(...selectedProjectData.cashFlows);
                    const height = (cf / maxCF) * 80;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-green-400 mb-1">
                          +{fmt(cf, currency)}
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t"
                          style={{ height: `${height}%`, minHeight: "20px" }}
                        />
                        <span className="text-[10px] text-zinc-500 mt-1">Y{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-lg p-3 ${
                  selectedProjectData.npv >= 0
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}>
                  <p className="text-[10px] text-zinc-400 uppercase">Net Present Value</p>
                  <p className={`text-lg font-bold ${
                    selectedProjectData.npv >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {selectedProjectData.npv >= 0 ? "+" : ""}{fmt(selectedProjectData.npv, currency)}
                  </p>
                </div>

                <div className={`rounded-lg p-3 ${
                  selectedProjectData.irr > wacc
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-amber-500/10 border border-amber-500/20"
                }`}>
                  <p className="text-[10px] text-zinc-400 uppercase">Internal Rate of Return</p>
                  <p className={`text-lg font-bold ${
                    selectedProjectData.irr > wacc ? "text-green-400" : "text-amber-400"
                  }`}>
                    {pct(selectedProjectData.irr)}
                  </p>
                  <p className="text-[10px] text-zinc-500">WACC: {pct(wacc)}</p>
                </div>

                <div className="rounded-lg p-3 bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-[10px] text-zinc-400 uppercase">Payback Period</p>
                  <p className="text-lg font-bold text-white">
                    {selectedProjectData.paybackPeriod.toFixed(1)} years
                  </p>
                </div>

                <div className="rounded-lg p-3 bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-[10px] text-zinc-400 uppercase">Profitability Index</p>
                  <p className="text-lg font-bold text-white">
                    {(1 + selectedProjectData.npv / selectedProjectData.initialInvestment).toFixed(2)}x
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`rounded-xl p-4 ${
                selectedProjectData.npv > 0 && selectedProjectData.irr > wacc
                  ? "bg-green-500/10 border border-green-500/30"
                  : selectedProjectData.npv > 0
                  ? "bg-amber-500/10 border border-amber-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Co-Pilot Recommendation</h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {selectedProjectData.npv > 0 && selectedProjectData.irr > wacc
                        ? `APPROVE: This ${selectedProjectData.type} project generates positive NPV of ${fmt(selectedProjectData.npv, currency)} with IRR of ${pct(selectedProjectData.irr)}, exceeding the hurdle rate. Recommend proceeding with investment.`
                        : selectedProjectData.npv > 0
                        ? `REVIEW: Positive NPV but IRR below WACC suggests marginal value creation. Consider negotiating better terms or exploring alternatives.`
                        : `REJECT: Negative NPV indicates value destruction at current assumptions. Recommend revisiting cost structure or revenue projections.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 p-8">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-zinc-500">Select a project to view detailed analysis</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Risk-Adjusted Returns Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Risk-Adjusted Return Analysis</h3>

        <div className="relative h-48">
          {/* Axes */}
          <div className="absolute left-12 top-0 bottom-6 w-px bg-zinc-700" />
          <div className="absolute left-12 right-0 bottom-6 h-px bg-zinc-700" />

          {/* Y-axis label */}
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-zinc-500 transform origin-center">
            IRR (%)
          </span>

          {/* X-axis label */}
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500">
            Investment Size
          </span>

          {/* Plot area */}
          <div className="absolute left-14 right-4 top-4 bottom-8">
            {projects.map((project) => {
              const maxInvestment = Math.max(...projects.map(p => p.initialInvestment));
              const x = (project.initialInvestment / maxInvestment) * 100;
              const y = 100 - (project.irr * 100 / 0.5) * 100; // Assume max IRR of 50%

              return (
                <div
                  key={project.id}
                  className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-150 ${
                    project.riskLevel === "low" ? "bg-green-500" :
                    project.riskLevel === "medium" ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{
                    left: `${Math.min(95, Math.max(5, x))}%`,
                    top: `${Math.min(90, Math.max(10, y))}%`,
                  }}
                  title={`${project.name}: IRR ${pct(project.irr)}, Investment ${fmt(project.initialInvestment, currency)}`}
                />
              );
            })}

            {/* WACC line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500/50"
              style={{ top: `${100 - (wacc * 100 / 0.5) * 100}%` }}
            >
              <span className="absolute right-0 -top-4 text-[10px] text-amber-400">WACC ({pct(wacc)})</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-[10px] text-zinc-400">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] text-zinc-400">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[10px] text-zinc-400">High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
