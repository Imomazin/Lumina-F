"use client";

import { useState } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface DecisionLayerProps {
  analysis: AnalysisResult;
  currency: string;
  onActionComplete?: (actionId: string) => void;
}

interface StrategicRecommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "growth" | "efficiency" | "risk" | "capital" | "operations";
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
  timeline: string;
  kpiAlignment: string[];
  status: "pending" | "in_progress" | "completed" | "deferred";
}

interface KPITarget {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  progress: number;
  linkedActions: string[];
}

function generateRecommendations(analysis: AnalysisResult): StrategicRecommendation[] {
  const recommendations: StrategicRecommendation[] = [];
  const ratios = analysis.baseCase.averageRatios;
  const yearlyFinancials = analysis.baseCase.yearlyFinancials;

  // Profitability recommendations
  if (ratios.netMargin < 10) {
    recommendations.push({
      id: "rec_1",
      priority: "high",
      category: "efficiency",
      title: "Improve Profit Margins",
      description: "Net profit margin is below industry benchmark. Focus on cost optimization and pricing strategy.",
      impact: `+${(10 - ratios.netMargin).toFixed(1)}% margin improvement potential`,
      effort: "medium",
      timeline: "6-12 months",
      kpiAlignment: ["Net Profit Margin", "EBITDA", "Operating Efficiency"],
      status: "pending",
    });
  }

  // Liquidity recommendations
  if (ratios.currentRatio < 1.5) {
    recommendations.push({
      id: "rec_2",
      priority: "critical",
      category: "risk",
      title: "Strengthen Liquidity Position",
      description: "Current ratio indicates potential short-term liquidity risk. Consider working capital optimization.",
      impact: "Reduce liquidity risk, improve vendor relationships",
      effort: "medium",
      timeline: "3-6 months",
      kpiAlignment: ["Current Ratio", "Quick Ratio", "Working Capital"],
      status: "pending",
    });
  }

  // Growth recommendations
  if (ratios.revenueGrowth < 15) {
    recommendations.push({
      id: "rec_3",
      priority: "high",
      category: "growth",
      title: "Accelerate Revenue Growth",
      description: "Revenue growth is below target. Explore new market segments or product expansion.",
      impact: `Target ${Math.max(15, ratios.revenueGrowth + 10).toFixed(0)}% YoY growth`,
      effort: "high",
      timeline: "12-18 months",
      kpiAlignment: ["Revenue Growth", "Market Share", "Customer Acquisition"],
      status: "pending",
    });
  }

  // Capital efficiency recommendations
  if (ratios.returnOnEquity < 15) {
    recommendations.push({
      id: "rec_4",
      priority: "medium",
      category: "capital",
      title: "Optimize Capital Allocation",
      description: "ROE below target suggests capital could be deployed more efficiently.",
      impact: "Improve shareholder returns and capital efficiency",
      effort: "medium",
      timeline: "6-12 months",
      kpiAlignment: ["ROE", "ROIC", "Capital Turnover"],
      status: "pending",
    });
  }

  // Cash flow recommendations
  const latestCashFlow = yearlyFinancials[yearlyFinancials.length - 1];
  if (latestCashFlow && latestCashFlow.freeCashFlow < 0) {
    recommendations.push({
      id: "rec_5",
      priority: "critical",
      category: "operations",
      title: "Achieve Positive Free Cash Flow",
      description: "Negative FCF requires immediate attention. Review capex timing and working capital management.",
      impact: "Improve financial sustainability and reduce funding needs",
      effort: "high",
      timeline: "3-6 months",
      kpiAlignment: ["Free Cash Flow", "Cash Conversion", "Operating Cash Flow"],
      status: "pending",
    });
  }

  // Debt management
  if (ratios.debtToEquity > 1.5) {
    recommendations.push({
      id: "rec_6",
      priority: "high",
      category: "risk",
      title: "Reduce Leverage",
      description: "High debt-to-equity ratio increases financial risk. Consider debt paydown or equity raise.",
      impact: "Lower interest costs, improved credit profile",
      effort: "medium",
      timeline: "12-24 months",
      kpiAlignment: ["Debt/Equity", "Interest Coverage", "Credit Rating"],
      status: "pending",
    });
  }

  return recommendations;
}

function generateKPITargets(analysis: AnalysisResult): KPITarget[] {
  const ratios = analysis.baseCase.averageRatios;

  return [
    {
      name: "Revenue Growth",
      current: ratios.revenueGrowth,
      target: 20,
      unit: "%",
      trend: ratios.revenueGrowth > 15 ? "up" : ratios.revenueGrowth > 10 ? "stable" : "down",
      progress: Math.min(100, (ratios.revenueGrowth / 20) * 100),
      linkedActions: ["rec_3"],
    },
    {
      name: "EBITDA Margin",
      current: ratios.ebitdaMargin,
      target: 25,
      unit: "%",
      trend: ratios.ebitdaMargin > 20 ? "up" : "stable",
      progress: Math.min(100, (ratios.ebitdaMargin / 25) * 100),
      linkedActions: ["rec_1"],
    },
    {
      name: "Net Profit Margin",
      current: ratios.netMargin,
      target: 15,
      unit: "%",
      trend: ratios.netMargin > 12 ? "up" : "down",
      progress: Math.min(100, (ratios.netMargin / 15) * 100),
      linkedActions: ["rec_1"],
    },
    {
      name: "Current Ratio",
      current: ratios.currentRatio,
      target: 2.0,
      unit: "x",
      trend: ratios.currentRatio > 1.5 ? "up" : "down",
      progress: Math.min(100, (ratios.currentRatio / 2.0) * 100),
      linkedActions: ["rec_2"],
    },
    {
      name: "Return on Equity",
      current: ratios.returnOnEquity,
      target: 18,
      unit: "%",
      trend: ratios.returnOnEquity > 15 ? "up" : "stable",
      progress: Math.min(100, (ratios.returnOnEquity / 18) * 100),
      linkedActions: ["rec_4"],
    },
    {
      name: "Debt/Equity",
      current: ratios.debtToEquity,
      target: 1.0,
      unit: "x",
      trend: ratios.debtToEquity < 1.2 ? "up" : "down",
      progress: Math.min(100, ((2 - ratios.debtToEquity) / 1.0) * 100),
      linkedActions: ["rec_6"],
    },
  ];
}

const priorityColors = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const categoryIcons: Record<string, React.ReactNode> = {
  growth: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  efficiency: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  risk: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  capital: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  operations: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export function DecisionLayer({ analysis, currency, onActionComplete }: DecisionLayerProps) {
  const [recommendations, setRecommendations] = useState<StrategicRecommendation[]>(() =>
    generateRecommendations(analysis)
  );
  const [kpiTargets] = useState<KPITarget[]>(() => generateKPITargets(analysis));
  const [activeView, setActiveView] = useState<"recommendations" | "kpi_matrix" | "action_tracker" | "monitoring">("recommendations");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const updateActionStatus = (id: string, status: StrategicRecommendation["status"]) => {
    setRecommendations(prev =>
      prev.map(rec => rec.id === id ? { ...rec, status } : rec)
    );
    if (status === "completed") {
      onActionComplete?.(id);
    }
  };

  const filteredRecommendations = selectedPriority === "all"
    ? recommendations
    : recommendations.filter(r => r.priority === selectedPriority);

  const completedCount = recommendations.filter(r => r.status === "completed").length;
  const inProgressCount = recommendations.filter(r => r.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Decision Execution Layer
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Strategic recommendations aligned with KPIs and tracked execution
          </p>
        </div>

        {/* Progress Summary */}
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-zinc-800/50 rounded-lg">
            <div className="text-lg font-bold text-green-400">{completedCount}</div>
            <div className="text-xs text-zinc-500">Completed</div>
          </div>
          <div className="text-center px-4 py-2 bg-zinc-800/50 rounded-lg">
            <div className="text-lg font-bold text-amber-400">{inProgressCount}</div>
            <div className="text-xs text-zinc-500">In Progress</div>
          </div>
          <div className="text-center px-4 py-2 bg-zinc-800/50 rounded-lg">
            <div className="text-lg font-bold text-zinc-400">{recommendations.length - completedCount - inProgressCount}</div>
            <div className="text-xs text-zinc-500">Pending</div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {[
          { id: "recommendations", label: "Strategic Recommendations", icon: "🎯" },
          { id: "kpi_matrix", label: "KPI Alignment Matrix", icon: "📊" },
          { id: "action_tracker", label: "Action Tracker", icon: "✓" },
          { id: "monitoring", label: "Monitoring Dashboard", icon: "📡" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as typeof activeView)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
              activeView === tab.id
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Strategic Recommendations View */}
      {activeView === "recommendations" && (
        <div className="space-y-4">
          {/* Priority Filter */}
          <div className="flex gap-2">
            {["all", "critical", "high", "medium", "low"].map((priority) => (
              <button
                key={priority}
                onClick={() => setSelectedPriority(priority)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                  selectedPriority === priority
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {priority}
              </button>
            ))}
          </div>

          {/* Recommendations Grid */}
          <div className="grid gap-4">
            {filteredRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${priorityColors[rec.priority]}`}>
                      {categoryIcons[rec.category]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-white">{rec.title}</h3>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-medium rounded border ${priorityColors[rec.priority]}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">{rec.description}</p>

                      <div className="flex flex-wrap gap-4 text-xs">
                        <div>
                          <span className="text-zinc-500">Impact:</span>
                          <span className="text-green-400 ml-1">{rec.impact}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Effort:</span>
                          <span className="text-zinc-300 ml-1 capitalize">{rec.effort}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Timeline:</span>
                          <span className="text-zinc-300 ml-1">{rec.timeline}</span>
                        </div>
                      </div>

                      {/* KPI Alignment */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {rec.kpiAlignment.map((kpi, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded">
                            {kpi}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-col gap-2">
                    <select
                      value={rec.status}
                      onChange={(e) => updateActionStatus(rec.id, e.target.value as StrategicRecommendation["status"])}
                      className="px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="deferred">Deferred</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Alignment Matrix View */}
      {activeView === "kpi_matrix" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpiTargets.map((kpi, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">{kpi.name}</h4>
                  <div className={`flex items-center gap-1 text-xs ${
                    kpi.trend === "up" ? "text-green-400" : kpi.trend === "down" ? "text-red-400" : "text-zinc-400"
                  }`}>
                    {kpi.trend === "up" && "↑"}
                    {kpi.trend === "down" && "↓"}
                    {kpi.trend === "stable" && "→"}
                    {kpi.trend}
                  </div>
                </div>

                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-white">
                    {kpi.current.toFixed(1)}{kpi.unit}
                  </span>
                  <span className="text-sm text-zinc-500 mb-1">
                    / {kpi.target}{kpi.unit} target
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      kpi.progress >= 100 ? "bg-green-500" : kpi.progress >= 70 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, kpi.progress)}%` }}
                  />
                </div>

                {/* Linked Actions */}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>Linked actions:</span>
                  {kpi.linkedActions.map((actionId) => {
                    const action = recommendations.find(r => r.id === actionId);
                    return action ? (
                      <span
                        key={actionId}
                        className={`px-2 py-0.5 rounded ${
                          action.status === "completed" ? "bg-green-500/20 text-green-400" :
                          action.status === "in_progress" ? "bg-amber-500/20 text-amber-400" :
                          "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {action.title.substring(0, 20)}...
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Tracker View */}
      {activeView === "action_tracker" && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase">Priority</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase">Timeline</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="py-3 px-4">
                      <span className="text-sm text-white">{rec.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-zinc-400 capitalize">{rec.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-medium rounded border ${priorityColors[rec.priority]}`}>
                        {rec.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-zinc-400">{rec.timeline}</span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={rec.status}
                        onChange={(e) => updateActionStatus(rec.id, e.target.value as StrategicRecommendation["status"])}
                        className={`px-2 py-1 text-xs rounded-lg border ${
                          rec.status === "completed" ? "bg-green-500/20 border-green-500/30 text-green-400" :
                          rec.status === "in_progress" ? "bg-amber-500/20 border-amber-500/30 text-amber-400" :
                          rec.status === "deferred" ? "bg-zinc-800 border-zinc-700 text-zinc-400" :
                          "bg-zinc-800 border-zinc-700 text-zinc-300"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="deferred">Deferred</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monitoring Dashboard View */}
      {activeView === "monitoring" && (
        <div className="space-y-6">
          {/* Execution Progress */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Execution Progress</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                <div className="text-3xl font-bold text-white">{recommendations.length}</div>
                <div className="text-xs text-zinc-500 mt-1">Total Actions</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-3xl font-bold text-green-400">{completedCount}</div>
                <div className="text-xs text-zinc-500 mt-1">Completed</div>
              </div>
              <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="text-3xl font-bold text-amber-400">{inProgressCount}</div>
                <div className="text-xs text-zinc-500 mt-1">In Progress</div>
              </div>
              <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                <div className="text-3xl font-bold text-zinc-400">
                  {recommendations.length - completedCount - inProgressCount}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Pending</div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Overall Progress</span>
                <span>{Math.round((completedCount / recommendations.length) * 100)}%</span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-green-500 rounded-full transition-all"
                  style={{ width: `${(completedCount / recommendations.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Actions by Category</h3>
            <div className="grid md:grid-cols-5 gap-4">
              {["growth", "efficiency", "risk", "capital", "operations"].map((category) => {
                const categoryRecs = recommendations.filter(r => r.category === category);
                const completed = categoryRecs.filter(r => r.status === "completed").length;
                return (
                  <div key={category} className="p-3 bg-zinc-800/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {categoryIcons[category]}
                      <span className="text-xs text-zinc-400 capitalize">{category}</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {completed}/{categoryRecs.length}
                    </div>
                    <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: categoryRecs.length > 0 ? `${(completed / categoryRecs.length) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Co-Pilot Insight */}
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-zinc-900 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400">🤖</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-1">Financial Co-Pilot</h4>
                <p className="text-sm text-zinc-300">
                  {completedCount === 0 && "Start with critical priority items to address immediate financial risks. Focus on liquidity and cash flow first."}
                  {completedCount > 0 && completedCount < recommendations.length / 2 && "Good progress! Consider tackling high-priority growth initiatives next to build momentum."}
                  {completedCount >= recommendations.length / 2 && completedCount < recommendations.length && "Excellent execution! You're past the halfway point. Keep monitoring KPI impacts as you complete remaining actions."}
                  {completedCount === recommendations.length && "All strategic actions completed! Continue monitoring KPIs and consider refreshing your strategic priorities."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
