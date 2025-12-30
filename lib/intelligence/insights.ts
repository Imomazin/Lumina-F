/**
 * AI Insights Engine
 *
 * Generates intelligent narratives, executive summaries, and investment memos
 * from financial data using rule-based analysis and templated generation
 */

import { AnalysisSession } from '../schema';
import { ForecastResult, YearlyMetrics } from '../finance/forecast';
import { ValuationMetrics } from '../finance/valuation';
import { RiskScore } from './risk';
import { HealthScore } from './health';

// ============================================================================
// TYPES
// ============================================================================

export interface InsightCategory {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'neutral';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  metric?: string;
  value?: number | string;
  benchmark?: number | string;
  recommendation?: string;
}

export interface ExecutiveSummary {
  headline: string;
  keyFindings: string[];
  valuation: string;
  riskAssessment: string;
  recommendation: string;
  bottomLine: string;
}

export interface InvestmentMemo {
  companyOverview: string;
  investmentThesis: string;
  keyMetrics: { label: string; value: string; assessment: string }[];
  strengths: string[];
  risks: string[];
  valuation: {
    method: string;
    value: string;
    sensitivity: string;
  };
  recommendation: string;
  appendix: {
    assumptions: string[];
    limitations: string[];
  };
}

export interface NarrativeReport {
  executiveSummary: ExecutiveSummary;
  insights: Insight[];
  investmentMemo: InvestmentMemo;
  generatedAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCurrency(value: number, currency: string = 'USD'): string {
  const absValue = Math.abs(value);
  if (absValue >= 1e9) return `${currency} ${(value / 1e9).toFixed(1)}B`;
  if (absValue >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`;
  if (absValue >= 1e3) return `${currency} ${(value / 1e3).toFixed(1)}K`;
  return `${currency} ${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function getGrowthAssessment(growth: number): string {
  if (growth > 50) return 'hypergrowth';
  if (growth > 25) return 'high-growth';
  if (growth > 10) return 'solid growth';
  if (growth > 0) return 'modest growth';
  if (growth > -10) return 'slight decline';
  return 'significant contraction';
}

function getMarginAssessment(margin: number): string {
  if (margin > 30) return 'exceptional';
  if (margin > 20) return 'strong';
  if (margin > 10) return 'healthy';
  if (margin > 0) return 'thin';
  return 'negative';
}

function getValuationAssessment(multiple: number, type: 'revenue' | 'ebitda'): string {
  const thresholds = type === 'revenue'
    ? { low: 2, mid: 5, high: 10 }
    : { low: 8, mid: 12, high: 20 };

  if (multiple < thresholds.low) return 'potentially undervalued';
  if (multiple < thresholds.mid) return 'fairly valued';
  if (multiple < thresholds.high) return 'premium valuation';
  return 'aggressively valued';
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

export function generateInsights(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics,
  risk?: RiskScore,
  health?: HealthScore
): Insight[] {
  const insights: Insight[] = [];
  const currency = inputs.currency || 'USD';

  // =========================================================================
  // GROWTH INSIGHTS
  // =========================================================================
  const revenueGrowth = inputs.revenueGrowthAssumption;

  insights.push({
    id: 'growth-trajectory',
    title: 'Revenue Growth Trajectory',
    description: `The company is projecting ${getGrowthAssessment(revenueGrowth)} at ${formatPercent(revenueGrowth)} annually over the forecast period.`,
    category: {
      type: revenueGrowth > 15 ? 'strength' : revenueGrowth > 0 ? 'neutral' : 'weakness',
      priority: 'high',
    },
    metric: 'Revenue Growth',
    value: formatPercent(revenueGrowth),
    benchmark: '10-15% (industry avg)',
    recommendation: revenueGrowth > 30
      ? 'Validate growth assumptions against market size and competitive dynamics.'
      : revenueGrowth < 5
        ? 'Explore growth acceleration strategies or efficiency improvements.'
        : undefined,
  });

  // =========================================================================
  // MARGIN INSIGHTS
  // =========================================================================
  if (forecast.yearly.length > 0) {
    const lastYear = forecast.yearly[forecast.yearly.length - 1];
    const firstYear = forecast.yearly[0];

    const grossMargin = ((lastYear.revenue - lastYear.cogs) / lastYear.revenue) * 100;
    const operatingMargin = (lastYear.ebit / lastYear.revenue) * 100;
    const netMargin = (lastYear.netIncome / lastYear.revenue) * 100;

    insights.push({
      id: 'gross-margin',
      title: 'Gross Margin Profile',
      description: `Gross margin of ${grossMargin.toFixed(1)}% indicates ${getMarginAssessment(grossMargin)} pricing power and cost control.`,
      category: {
        type: grossMargin > 40 ? 'strength' : grossMargin > 20 ? 'neutral' : 'weakness',
        priority: 'high',
      },
      metric: 'Gross Margin',
      value: formatPercent(grossMargin),
      benchmark: '40%+ (software), 25%+ (manufacturing)',
    });

    insights.push({
      id: 'operating-leverage',
      title: 'Operating Leverage',
      description: `Operating margin of ${operatingMargin.toFixed(1)}% reflects ${operatingMargin > 15 ? 'efficient' : operatingMargin > 0 ? 'developing' : 'challenged'} operations.`,
      category: {
        type: operatingMargin > 15 ? 'strength' : operatingMargin > 0 ? 'neutral' : 'weakness',
        priority: 'high',
      },
      metric: 'Operating Margin',
      value: formatPercent(operatingMargin),
    });

    // Margin expansion/contraction
    const firstGrossMargin = ((firstYear.revenue - firstYear.cogs) / firstYear.revenue) * 100;
    const marginChange = grossMargin - firstGrossMargin;

    if (Math.abs(marginChange) > 2) {
      insights.push({
        id: 'margin-trend',
        title: 'Margin Trajectory',
        description: `Gross margins are projected to ${marginChange > 0 ? 'expand' : 'contract'} by ${Math.abs(marginChange).toFixed(1)}pp over the forecast period.`,
        category: {
          type: marginChange > 0 ? 'strength' : 'threat',
          priority: 'medium',
        },
        metric: 'Margin Change',
        value: `${marginChange > 0 ? '+' : ''}${marginChange.toFixed(1)}pp`,
      });
    }
  }

  // =========================================================================
  // VALUATION INSIGHTS
  // =========================================================================
  if (valuation?.dcf) {
    const ev = valuation.dcf.enterpriseValue;
    const equity = valuation.dcf.equityValue;

    insights.push({
      id: 'valuation-dcf',
      title: 'DCF Valuation',
      description: `The discounted cash flow analysis yields an enterprise value of ${formatCurrency(ev, currency)} and equity value of ${formatCurrency(equity, currency)}.`,
      category: {
        type: 'neutral',
        priority: 'critical',
      },
      metric: 'Enterprise Value',
      value: formatCurrency(ev, currency),
    });

    const evRevenue = valuation.dcf.impliedMultiples.evToRevenue;
    insights.push({
      id: 'valuation-multiple',
      title: 'Implied Valuation Multiple',
      description: `At ${evRevenue.toFixed(1)}x EV/Revenue, the company appears ${getValuationAssessment(evRevenue, 'revenue')}.`,
      category: {
        type: evRevenue < 3 ? 'opportunity' : evRevenue > 10 ? 'threat' : 'neutral',
        priority: 'high',
      },
      metric: 'EV/Revenue',
      value: `${evRevenue.toFixed(1)}x`,
      benchmark: '2-5x (typical), 8-15x (high-growth tech)',
    });
  }

  // =========================================================================
  // RISK INSIGHTS
  // =========================================================================
  if (risk) {
    insights.push({
      id: 'risk-overall',
      title: 'Overall Risk Assessment',
      description: `${risk.summary} The company receives a ${risk.grade} risk grade with ${risk.level} overall risk.`,
      category: {
        type: risk.overall < 40 ? 'strength' : risk.overall < 60 ? 'neutral' : 'weakness',
        priority: 'critical',
      },
      metric: 'Risk Score',
      value: risk.grade,
    });

    // Top risks
    risk.topRisks.forEach((topRisk, index) => {
      insights.push({
        id: `risk-${index}`,
        title: topRisk.name,
        description: topRisk.description,
        category: {
          type: 'threat',
          priority: topRisk.impact === 'critical' ? 'critical' : topRisk.impact === 'high' ? 'high' : 'medium',
        },
        metric: 'Risk Factor',
        value: `${topRisk.score}/100`,
      });
    });
  }

  // =========================================================================
  // FINANCIAL HEALTH INSIGHTS
  // =========================================================================
  if (health) {
    insights.push({
      id: 'health-overall',
      title: 'Financial Health Score',
      description: `Overall financial health score of ${health.overall}/100 indicates ${health.level} financial condition.`,
      category: {
        type: health.overall > 70 ? 'strength' : health.overall > 40 ? 'neutral' : 'weakness',
        priority: 'high',
      },
      metric: 'Health Score',
      value: `${health.overall}/100`,
    });

    if (health.altmanZ) {
      const zScore = health.altmanZ.score;
      insights.push({
        id: 'altman-z',
        title: 'Bankruptcy Risk (Altman Z-Score)',
        description: health.altmanZ.interpretation,
        category: {
          type: zScore > 2.99 ? 'strength' : zScore > 1.81 ? 'neutral' : 'threat',
          priority: zScore < 1.81 ? 'critical' : 'medium',
        },
        metric: 'Z-Score',
        value: zScore.toFixed(2),
        benchmark: '>2.99 (safe), 1.81-2.99 (gray zone), <1.81 (distress)',
      });
    }
  }

  // =========================================================================
  // CAPITAL STRUCTURE INSIGHTS
  // =========================================================================
  if (valuation?.leverage) {
    const leverage = valuation.leverage;

    insights.push({
      id: 'capital-structure',
      title: 'Capital Structure',
      description: `Debt-to-Equity of ${leverage.debtToEquity.toFixed(1)}x ${leverage.debtToEquity > 2 ? 'indicates aggressive leverage' : leverage.debtToEquity < 0.5 ? 'shows conservative financing' : 'is within normal range'}.`,
      category: {
        type: leverage.debtToEquity < 1 ? 'strength' : leverage.debtToEquity < 2 ? 'neutral' : 'weakness',
        priority: leverage.debtToEquity > 3 ? 'critical' : 'medium',
      },
      metric: 'Debt/Equity',
      value: `${leverage.debtToEquity.toFixed(1)}x`,
      benchmark: '<1x (conservative), 1-2x (moderate), >2x (aggressive)',
    });

    if (leverage.interestCoverage < 5) {
      insights.push({
        id: 'interest-coverage',
        title: 'Interest Coverage',
        description: `Interest coverage of ${leverage.interestCoverage.toFixed(1)}x ${leverage.interestCoverage < 2 ? 'raises debt service concerns' : 'provides adequate cushion'}.`,
        category: {
          type: leverage.interestCoverage > 4 ? 'strength' : leverage.interestCoverage > 2 ? 'neutral' : 'threat',
          priority: leverage.interestCoverage < 2 ? 'critical' : 'medium',
        },
        metric: 'Interest Coverage',
        value: `${leverage.interestCoverage.toFixed(1)}x`,
        benchmark: '>4x (comfortable), 2-4x (adequate), <2x (stressed)',
      });
    }
  }

  // =========================================================================
  // RETURN METRICS INSIGHTS
  // =========================================================================
  if (valuation?.returnMetrics) {
    const returns = valuation.returnMetrics;

    insights.push({
      id: 'return-metrics',
      title: 'Return on Invested Capital',
      description: `ROIC of ${returns.roic.toFixed(1)}% ${returns.roic > 15 ? 'exceeds typical cost of capital, creating value' : returns.roic > 10 ? 'is competitive' : 'may not cover cost of capital'}.`,
      category: {
        type: returns.roic > 15 ? 'strength' : returns.roic > 8 ? 'neutral' : 'weakness',
        priority: 'high',
      },
      metric: 'ROIC',
      value: formatPercent(returns.roic),
      benchmark: '>15% (value creation), 8-15% (adequate), <8% (value destruction)',
    });
  }

  // =========================================================================
  // EFFICIENCY INSIGHTS
  // =========================================================================
  if (valuation?.efficiency) {
    const efficiency = valuation.efficiency;

    if (efficiency.cashConversionCycle > 60) {
      insights.push({
        id: 'working-capital',
        title: 'Working Capital Efficiency',
        description: `Cash conversion cycle of ${efficiency.cashConversionCycle} days indicates ${efficiency.cashConversionCycle > 90 ? 'significant' : 'moderate'} working capital requirements.`,
        category: {
          type: efficiency.cashConversionCycle < 30 ? 'strength' : efficiency.cashConversionCycle < 60 ? 'neutral' : 'weakness',
          priority: 'medium',
        },
        metric: 'Cash Conversion Cycle',
        value: `${efficiency.cashConversionCycle} days`,
        recommendation: 'Review inventory management and collection practices.',
      });
    }
  }

  return insights;
}

// ============================================================================
// EXECUTIVE SUMMARY GENERATION
// ============================================================================

export function generateExecutiveSummary(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics,
  risk?: RiskScore,
  health?: HealthScore
): ExecutiveSummary {
  const currency = inputs.currency || 'USD';
  const companyName = inputs.companyName || 'The Company';
  const industry = inputs.industry || 'the industry';

  // Calculate key metrics
  const revenueGrowth = inputs.revenueGrowthAssumption;
  const years = inputs.yearsForward;
  const startingRevenue = inputs.currentRevenue;

  let endingRevenue = startingRevenue;
  let avgNetMargin = 0;

  if (forecast.yearly.length > 0) {
    endingRevenue = forecast.yearly[forecast.yearly.length - 1].revenue;
    avgNetMargin = forecast.yearly.reduce((sum, y) => sum + (y.netIncome / y.revenue), 0) / forecast.yearly.length * 100;
  }

  // Build headline
  const growthDescriptor = revenueGrowth > 25 ? 'high-growth' : revenueGrowth > 10 ? 'growth' : revenueGrowth > 0 ? 'stable' : 'challenged';
  const headline = `${companyName}: A ${growthDescriptor} ${industry} company projecting ${formatPercent(revenueGrowth)} annual revenue growth`;

  // Key findings
  const keyFindings: string[] = [];

  keyFindings.push(`Revenue projected to grow from ${formatCurrency(startingRevenue, currency)} to ${formatCurrency(endingRevenue, currency)} over ${years} years`);

  if (avgNetMargin > 0) {
    keyFindings.push(`Average net margin of ${avgNetMargin.toFixed(1)}% indicates ${avgNetMargin > 15 ? 'strong' : 'developing'} profitability`);
  }

  if (valuation?.dcf) {
    keyFindings.push(`DCF analysis yields enterprise value of ${formatCurrency(valuation.dcf.enterpriseValue, currency)}`);
  }

  if (risk) {
    keyFindings.push(`${risk.grade} risk grade with ${risk.mitigatingFactors.length} mitigating factors identified`);
  }

  if (health?.piotroski) {
    keyFindings.push(`Piotroski F-Score of ${health.piotroski.score}/9 indicates ${health.piotroski.score >= 7 ? 'strong' : health.piotroski.score >= 4 ? 'moderate' : 'weak'} fundamentals`);
  }

  // Valuation statement
  let valuationStatement = 'Valuation analysis pending additional data.';
  if (valuation?.dcf) {
    const ev = valuation.dcf.enterpriseValue;
    const evRevenue = valuation.dcf.impliedMultiples.evToRevenue;
    valuationStatement = `Enterprise value of ${formatCurrency(ev, currency)} (${evRevenue.toFixed(1)}x revenue) based on ${valuation.dcf.wacc}% WACC and projected free cash flows.`;
  }

  // Risk assessment
  let riskAssessment = 'Risk assessment requires additional inputs.';
  if (risk) {
    riskAssessment = `Overall risk score of ${risk.overall}/100 (${risk.grade}). ${risk.summary}`;
    if (risk.topRisks.length > 0) {
      riskAssessment += ` Key risks include ${risk.topRisks.slice(0, 2).map(r => r.name.toLowerCase()).join(' and ')}.`;
    }
  }

  // Recommendation
  let recommendation: string;
  const overallScore = (risk?.overall ?? 50) + (100 - (health?.overall ?? 50));

  if (overallScore < 60 && revenueGrowth > 15) {
    recommendation = 'ATTRACTIVE: Strong growth profile with manageable risks warrants further due diligence.';
  } else if (overallScore < 80 && revenueGrowth > 5) {
    recommendation = 'NEUTRAL: Balanced risk-return profile. Monitor key metrics and risk factors.';
  } else if (overallScore >= 80 || revenueGrowth < 0) {
    recommendation = 'CAUTIOUS: Elevated risks or weak fundamentals require deeper investigation before proceeding.';
  } else {
    recommendation = 'MONITOR: Continue tracking progress against projections and reassess periodically.';
  }

  // Bottom line
  const bottomLine = `${companyName} presents a ${growthDescriptor} opportunity in ${industry} with ${risk?.level ?? 'moderate'} risk profile. ${valuation?.dcf ? `At ${valuation.dcf.impliedMultiples.evToRevenue.toFixed(1)}x revenue, valuation appears ${getValuationAssessment(valuation.dcf.impliedMultiples.evToRevenue, 'revenue')}.` : ''} Key focus areas: ${risk?.topRisks.slice(0, 2).map(r => r.name.toLowerCase()).join(', ') || 'growth execution and margin expansion'}.`;

  return {
    headline,
    keyFindings,
    valuation: valuationStatement,
    riskAssessment,
    recommendation,
    bottomLine,
  };
}

// ============================================================================
// INVESTMENT MEMO GENERATION
// ============================================================================

export function generateInvestmentMemo(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics,
  risk?: RiskScore,
  health?: HealthScore
): InvestmentMemo {
  const currency = inputs.currency || 'USD';
  const companyName = inputs.companyName || 'Target Company';
  const industry = inputs.industry || 'Technology';

  // Company Overview
  const revenueGrowth = inputs.revenueGrowthAssumption;
  const currentRev = inputs.currentRevenue;

  const companyOverview = `${companyName} is a ${industry} company with current annual revenue of ${formatCurrency(currentRev, currency)}. The company is projecting ${getGrowthAssessment(revenueGrowth)} with ${formatPercent(revenueGrowth)} revenue growth over a ${inputs.yearsForward}-year forecast period.`;

  // Investment Thesis
  let investmentThesis: string;
  if (revenueGrowth > 20 && (risk?.overall ?? 50) < 60) {
    investmentThesis = `${companyName} represents a compelling growth opportunity in ${industry}. The company's ${formatPercent(revenueGrowth)} growth trajectory, combined with ${risk?.level ?? 'manageable'} risk profile, positions it well for value creation. Key thesis drivers include market expansion, operational leverage, and competitive positioning.`;
  } else if (revenueGrowth > 10) {
    investmentThesis = `${companyName} offers a balanced growth investment in ${industry}. With ${formatPercent(revenueGrowth)} projected growth and ${risk?.level ?? 'moderate'} risk, the company provides exposure to sector growth with reasonable downside protection.`;
  } else {
    investmentThesis = `${companyName} represents a value-oriented opportunity in ${industry}. While growth is modest at ${formatPercent(revenueGrowth)}, potential exists for margin expansion, operational improvements, or strategic alternatives.`;
  }

  // Key Metrics
  const keyMetrics: { label: string; value: string; assessment: string }[] = [];

  keyMetrics.push({
    label: 'Current Revenue',
    value: formatCurrency(currentRev, currency),
    assessment: 'Baseline',
  });

  keyMetrics.push({
    label: 'Revenue Growth',
    value: formatPercent(revenueGrowth),
    assessment: revenueGrowth > 20 ? 'Strong' : revenueGrowth > 10 ? 'Solid' : 'Modest',
  });

  if (forecast.yearly.length > 0) {
    const lastYear = forecast.yearly[forecast.yearly.length - 1];
    const netMargin = (lastYear.netIncome / lastYear.revenue) * 100;

    keyMetrics.push({
      label: 'Projected Net Margin',
      value: formatPercent(netMargin),
      assessment: netMargin > 15 ? 'Excellent' : netMargin > 5 ? 'Adequate' : 'Developing',
    });
  }

  if (valuation?.dcf) {
    keyMetrics.push({
      label: 'Enterprise Value',
      value: formatCurrency(valuation.dcf.enterpriseValue, currency),
      assessment: getValuationAssessment(valuation.dcf.impliedMultiples.evToRevenue, 'revenue'),
    });

    keyMetrics.push({
      label: 'EV/Revenue Multiple',
      value: `${valuation.dcf.impliedMultiples.evToRevenue.toFixed(1)}x`,
      assessment: valuation.dcf.impliedMultiples.evToRevenue < 3 ? 'Attractive' : valuation.dcf.impliedMultiples.evToRevenue < 8 ? 'Fair' : 'Premium',
    });
  }

  if (risk) {
    keyMetrics.push({
      label: 'Risk Grade',
      value: risk.grade,
      assessment: risk.level,
    });
  }

  if (health) {
    keyMetrics.push({
      label: 'Financial Health',
      value: `${health.overall}/100`,
      assessment: health.level,
    });
  }

  // Strengths
  const strengths: string[] = [];
  if (revenueGrowth > 15) strengths.push(`Strong revenue growth trajectory (${formatPercent(revenueGrowth)} annually)`);
  if (risk && risk.mitigatingFactors.length > 0) strengths.push(...risk.mitigatingFactors.slice(0, 3));
  if (health && health.overall > 60) strengths.push('Solid financial health metrics');
  if (valuation?.returnMetrics && valuation.returnMetrics.roic > 12) strengths.push(`Value-creating returns (${valuation.returnMetrics.roic.toFixed(1)}% ROIC)`);
  if (valuation?.leverage && valuation.leverage.debtToEquity < 1) strengths.push('Conservative capital structure');

  if (strengths.length === 0) {
    strengths.push('Established market position', 'Experienced management team', 'Scalable business model');
  }

  // Risks
  const risks: string[] = [];
  if (risk && risk.topRisks.length > 0) {
    risks.push(...risk.topRisks.slice(0, 4).map(r => r.description));
  }
  if (revenueGrowth > 40) risks.push('Aggressive growth assumptions may be difficult to achieve');
  if (valuation?.leverage && valuation.leverage.debtToEquity > 2) risks.push('Elevated leverage increases financial risk');

  if (risks.length === 0) {
    risks.push('Execution risk on growth projections', 'Competitive pressure', 'Market cyclicality');
  }

  // Valuation
  const valuationSection = {
    method: 'Discounted Cash Flow (DCF)',
    value: valuation?.dcf ? formatCurrency(valuation.dcf.enterpriseValue, currency) : 'Pending',
    sensitivity: valuation?.dcf
      ? `Terminal value of ${formatCurrency(valuation.dcf.terminalValue, currency)} represents ${((valuation.dcf.terminalValuePV / valuation.dcf.enterpriseValue) * 100).toFixed(0)}% of total value`
      : 'Sensitivity analysis pending',
  };

  // Recommendation
  let recommendation: string;
  const riskAdjustedScore = (100 - (risk?.overall ?? 50)) * (1 + revenueGrowth / 100);

  if (riskAdjustedScore > 80) {
    recommendation = `PROCEED WITH DUE DILIGENCE: ${companyName} presents a compelling investment opportunity. Recommend advancing to detailed due diligence and valuation negotiation.`;
  } else if (riskAdjustedScore > 50) {
    recommendation = `CONTINUE MONITORING: ${companyName} shows promise but requires additional validation. Monitor progress against projections and reassess in 3-6 months.`;
  } else {
    recommendation = `PASS OR RESTRUCTURE: Current risk-return profile is unattractive. Consider passing or pursuing with significant structural protections.`;
  }

  // Appendix
  const assumptions: string[] = [
    `Revenue growth: ${formatPercent(revenueGrowth)} annually for ${inputs.yearsForward} years`,
    `WACC: ${valuation?.dcf?.wacc ?? 10}%`,
    `Terminal growth rate: 2.5% (assumed)`,
    `Tax rate: ${inputs.taxRatePct}%`,
  ];

  const limitations: string[] = [
    'Projections based on management assumptions',
    'No independent verification of historical financials',
    'Limited competitive analysis',
    'Market conditions subject to change',
  ];

  return {
    companyOverview,
    investmentThesis,
    keyMetrics,
    strengths,
    risks,
    valuation: valuationSection,
    recommendation,
    appendix: { assumptions, limitations },
  };
}

// ============================================================================
// COMPLETE NARRATIVE REPORT
// ============================================================================

export function generateNarrativeReport(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics,
  risk?: RiskScore,
  health?: HealthScore
): NarrativeReport {
  return {
    executiveSummary: generateExecutiveSummary(inputs, forecast, valuation, risk, health),
    insights: generateInsights(inputs, forecast, valuation, risk, health),
    investmentMemo: generateInvestmentMemo(inputs, forecast, valuation, risk, health),
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// SMART COMMENTARY GENERATOR
// ============================================================================

export interface SmartComment {
  section: string;
  metric: string;
  comment: string;
  tone: 'positive' | 'neutral' | 'cautionary' | 'negative';
  suggestion?: string;
}

export function generateSmartComments(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics
): SmartComment[] {
  const comments: SmartComment[] = [];
  const growth = inputs.revenueGrowthAssumption;

  // Growth commentary
  if (growth > 50) {
    comments.push({
      section: 'Growth',
      metric: 'Revenue Growth',
      comment: `${growth}% annual growth is exceptional but may be aggressive. Only top-tier companies sustain this rate.`,
      tone: 'cautionary',
      suggestion: 'Consider modeling a more conservative base case.',
    });
  } else if (growth > 25) {
    comments.push({
      section: 'Growth',
      metric: 'Revenue Growth',
      comment: `${growth}% growth indicates a high-growth company. Ensure market size supports this trajectory.`,
      tone: 'neutral',
    });
  } else if (growth < 5) {
    comments.push({
      section: 'Growth',
      metric: 'Revenue Growth',
      comment: `${growth}% growth is below inflation-adjusted GDP. Consider growth initiatives or efficiency focus.`,
      tone: 'cautionary',
    });
  }

  // Margin commentary
  if (forecast.yearly.length > 0) {
    const lastYear = forecast.yearly[forecast.yearly.length - 1];
    const netMargin = (lastYear.netIncome / lastYear.revenue) * 100;

    if (netMargin < 0) {
      comments.push({
        section: 'Profitability',
        metric: 'Net Margin',
        comment: 'Negative net margin indicates the company is not yet profitable.',
        tone: 'negative',
        suggestion: 'Identify path to profitability and required milestones.',
      });
    } else if (netMargin > 20) {
      comments.push({
        section: 'Profitability',
        metric: 'Net Margin',
        comment: `${netMargin.toFixed(1)}% net margin is excellent, indicating strong pricing power and cost control.`,
        tone: 'positive',
      });
    }
  }

  // Valuation commentary
  if (valuation?.dcf) {
    const evRevenue = valuation.dcf.impliedMultiples.evToRevenue;

    if (evRevenue > 15) {
      comments.push({
        section: 'Valuation',
        metric: 'EV/Revenue',
        comment: `${evRevenue.toFixed(1)}x revenue multiple is very high. Ensure growth assumptions justify this valuation.`,
        tone: 'cautionary',
        suggestion: 'Stress test with lower growth scenarios.',
      });
    } else if (evRevenue < 2) {
      comments.push({
        section: 'Valuation',
        metric: 'EV/Revenue',
        comment: `${evRevenue.toFixed(1)}x revenue is relatively low. May indicate undervaluation or fundamental concerns.`,
        tone: 'neutral',
        suggestion: 'Investigate reasons for low multiple.',
      });
    }
  }

  return comments;
}
