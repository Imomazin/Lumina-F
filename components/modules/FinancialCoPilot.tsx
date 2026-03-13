"use client";

import { useState, useEffect } from "react";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface FinancialCoPilotProps {
  analysis: AnalysisResult;
  currentContext: "dashboard" | "inputs" | "analysis" | "reports" | "scenarios" | "capital";
  isExpanded?: boolean;
  onToggle?: () => void;
}

interface NudgeMessage {
  id: string;
  type: "tip" | "warning" | "insight" | "education";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  learnMore?: string;
}

interface EducationalContent {
  term: string;
  definition: string;
  example: string;
  relevance: string;
}

const educationalContent: Record<string, EducationalContent> = {
  wacc: {
    term: "Weighted Average Cost of Capital (WACC)",
    definition: "The average rate a company pays to finance its assets, weighted by the proportion of debt and equity.",
    example: "If a company has 60% equity at 10% cost and 40% debt at 5% cost, WACC = (0.6 × 10%) + (0.4 × 5%) = 8%",
    relevance: "WACC is used as the discount rate in DCF valuations. A lower WACC increases company valuation.",
  },
  dcf: {
    term: "Discounted Cash Flow (DCF)",
    definition: "A valuation method that estimates the value of an investment based on its expected future cash flows.",
    example: "Future cash flow of $100 in 3 years, discounted at 10%, is worth $100 / (1.10)³ = $75.13 today.",
    relevance: "DCF is considered the most rigorous valuation method as it focuses on cash-generating ability.",
  },
  ebitda: {
    term: "EBITDA",
    definition: "Earnings Before Interest, Taxes, Depreciation, and Amortization - a measure of operating profitability.",
    example: "Revenue $1M - COGS $400K - OpEx $200K = EBITDA of $400K (40% margin)",
    relevance: "EBITDA helps compare profitability across companies by removing financing and accounting effects.",
  },
  currentRatio: {
    term: "Current Ratio",
    definition: "Current Assets divided by Current Liabilities - measures short-term liquidity.",
    example: "Current Assets of $500K / Current Liabilities of $250K = Current Ratio of 2.0x",
    relevance: "A ratio above 1.5x generally indicates healthy short-term liquidity. Below 1.0x is a red flag.",
  },
  burnRate: {
    term: "Burn Rate",
    definition: "The rate at which a company spends its cash reserves, typically measured monthly.",
    example: "If a startup has $1M cash and loses $100K/month, burn rate is $100K with 10 months runway.",
    relevance: "Critical for startups and growth companies to monitor funding needs and survival timeline.",
  },
  irr: {
    term: "Internal Rate of Return (IRR)",
    definition: "The discount rate that makes the NPV of an investment equal to zero.",
    example: "An investment of $100 returning $121 after 2 years has an IRR of 10%.",
    relevance: "IRR helps compare investment opportunities. Higher IRR typically means better investment.",
  },
};

function generateContextualNudges(analysis: AnalysisResult, context: string): NudgeMessage[] {
  const nudges: NudgeMessage[] = [];
  const ratios = analysis.baseCase.averageRatios;

  // Context-specific nudges
  if (context === "dashboard") {
    if (ratios.netMargin < 5) {
      nudges.push({
        id: "margin_warning",
        type: "warning",
        title: "Margin Alert",
        message: `Net profit margin of ${ratios.netMargin.toFixed(1)}% is below healthy thresholds. Consider reviewing cost structure.`,
        learnMore: "ebitda",
      });
    }

    if (ratios.currentRatio < 1.2) {
      nudges.push({
        id: "liquidity_tip",
        type: "tip",
        title: "Liquidity Check",
        message: "Your current ratio suggests tight liquidity. Explore working capital optimization strategies.",
        learnMore: "currentRatio",
      });
    }
  }

  if (context === "scenarios") {
    nudges.push({
      id: "scenario_education",
      type: "education",
      title: "Scenario Best Practice",
      message: "Always test at least 3 scenarios: Base Case (most likely), Bull Case (optimistic), and Bear Case (pessimistic). This helps identify decision boundaries.",
    });
  }

  if (context === "capital") {
    nudges.push({
      id: "irr_insight",
      type: "insight",
      title: "Investment Decision Rule",
      message: "Accept projects where IRR exceeds your WACC. This ensures the investment creates value for shareholders.",
      learnMore: "irr",
    });
  }

  if (context === "analysis") {
    if (ratios.revenueGrowth > 30) {
      nudges.push({
        id: "growth_insight",
        type: "insight",
        title: "High Growth Phase",
        message: "Revenue growth above 30% indicates hypergrowth. Ensure operational capacity and working capital can support this pace.",
      });
    }

    nudges.push({
      id: "dcf_education",
      type: "education",
      title: "Valuation Context",
      message: "DCF valuations are highly sensitive to terminal growth rate and discount rate assumptions. Small changes can significantly impact value.",
      learnMore: "dcf",
    });
  }

  // Always include a helpful tip
  if (nudges.length === 0) {
    nudges.push({
      id: "general_tip",
      type: "tip",
      title: "Pro Tip",
      message: "Regularly stress test your assumptions. What happens if revenue drops 20%? If costs increase 15%? Understanding sensitivities helps make robust decisions.",
    });
  }

  return nudges;
}

const typeIcons = {
  tip: "💡",
  warning: "⚠️",
  insight: "🔍",
  education: "📚",
};

const typeColors = {
  tip: "border-blue-500/30 bg-blue-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  insight: "border-purple-500/30 bg-purple-500/10",
  education: "border-green-500/30 bg-green-500/10",
};

export function FinancialCoPilot({ analysis, currentContext, isExpanded = false, onToggle }: FinancialCoPilotProps) {
  const [nudges, setNudges] = useState<NudgeMessage[]>([]);
  const [expandedNudge, setExpandedNudge] = useState<string | null>(null);
  const [showEducation, setShowEducation] = useState<string | null>(null);
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  useEffect(() => {
    setNudges(generateContextualNudges(analysis, currentContext));
  }, [analysis, currentContext]);

  const visibleNudges = nudges.filter(n => !dismissedNudges.has(n.id));

  const dismissNudge = (id: string) => {
    setDismissedNudges(prev => new Set([...prev, id]));
  };

  if (!isExpanded) {
    // Collapsed mode - floating button
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/20 flex items-center justify-center hover:scale-105 transition-all z-50"
      >
        <span className="text-2xl">🤖</span>
        {visibleNudges.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {visibleNudges.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[70vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Financial Co-Pilot</h3>
            <p className="text-[10px] text-zinc-400">Contextual insights & education</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-4 space-y-3">
        {showEducation ? (
          // Educational Content View
          <div className="space-y-4">
            <button
              onClick={() => setShowEducation(null)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to nudges
            </button>

            {educationalContent[showEducation] && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-white">
                    {educationalContent[showEducation].term}
                  </h4>
                </div>

                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Definition</p>
                  <p className="text-sm text-zinc-300">{educationalContent[showEducation].definition}</p>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400 uppercase mb-1">Example</p>
                  <p className="text-sm text-zinc-300">{educationalContent[showEducation].example}</p>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-400 uppercase mb-1">Why It Matters</p>
                  <p className="text-sm text-zinc-300">{educationalContent[showEducation].relevance}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Nudges List
          <>
            {visibleNudges.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-3xl">✨</span>
                <p className="text-sm text-zinc-400 mt-2">All caught up!</p>
                <p className="text-xs text-zinc-500">No new insights right now.</p>
              </div>
            ) : (
              visibleNudges.map((nudge) => (
                <div
                  key={nudge.id}
                  className={`rounded-lg border p-3 ${typeColors[nudge.type]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{typeIcons[nudge.type]}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{nudge.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1">{nudge.message}</p>

                        {nudge.learnMore && educationalContent[nudge.learnMore] && (
                          <button
                            onClick={() => setShowEducation(nudge.learnMore!)}
                            className="mt-2 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            Learn about {educationalContent[nudge.learnMore].term}
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNudge(nudge.id)}
                      className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                      <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Quick Education Links */}
            <div className="pt-3 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase mb-2">Quick Learn</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(educationalContent).map((key) => (
                  <button
                    key={key}
                    onClick={() => setShowEducation(key)}
                    className="px-2 py-1 text-[10px] bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Inline Co-Pilot component for embedding in pages
export function CoPilotInline({ message, type = "tip", learnMoreKey }: {
  message: string;
  type?: "tip" | "warning" | "insight" | "education";
  learnMoreKey?: string;
}) {
  const [showEducation, setShowEducation] = useState(false);

  return (
    <div className={`rounded-lg border p-3 ${typeColors[type]}`}>
      <div className="flex items-start gap-2">
        <span>{typeIcons[type]}</span>
        <div className="flex-1">
          <p className="text-xs text-zinc-300">{message}</p>
          {learnMoreKey && educationalContent[learnMoreKey] && (
            <>
              <button
                onClick={() => setShowEducation(!showEducation)}
                className="mt-1.5 text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                {showEducation ? "Hide" : "Learn more"}
                <svg className={`w-3 h-3 transition-transform ${showEducation ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {showEducation && (
                <div className="mt-2 p-2 bg-zinc-900/50 rounded text-xs space-y-2">
                  <p className="text-zinc-400">{educationalContent[learnMoreKey].definition}</p>
                  <p className="text-zinc-500 italic">{educationalContent[learnMoreKey].example}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
