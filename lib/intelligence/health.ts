/**
 * Financial Health Scoring System
 *
 * Comprehensive scoring algorithms for assessing company health
 * Inspired by Altman Z-Score, Piotroski F-Score, and more
 */

// ============================================================================
// TYPES
// ============================================================================

export interface HealthScore {
  overall: number;           // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  components: HealthComponent[];
  summary: string;
  risks: string[];
  strengths: string[];
}

export interface HealthComponent {
  name: string;
  category: 'profitability' | 'liquidity' | 'solvency' | 'efficiency' | 'growth';
  score: number;             // 0-100
  weight: number;            // Weight in overall score
  metrics: HealthMetric[];
  interpretation: string;
}

export interface HealthMetric {
  name: string;
  value: number;
  score: number;             // 0-100
  benchmark?: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

export interface FinancialData {
  // Income Statement
  revenue: number;
  revenueGrowth?: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  ebitda: number;

  // Balance Sheet
  totalAssets: number;
  currentAssets: number;
  cash: number;
  receivables?: number;
  inventory?: number;
  totalLiabilities: number;
  currentLiabilities: number;
  longTermDebt: number;
  totalEquity: number;
  retainedEarnings?: number;

  // Cash Flow
  operatingCashFlow?: number;
  capex?: number;
  freeCashFlow?: number;

  // Market Data (optional)
  marketCap?: number;

  // Prior Year (for trend analysis)
  priorYear?: Partial<FinancialData>;
}

// ============================================================================
// ALTMAN Z-SCORE
// ============================================================================

export interface ZScoreResult {
  score: number;
  zone: 'safe' | 'grey' | 'distress';
  interpretation: string;
  components: {
    workingCapitalToAssets: number;
    retainedEarningsToAssets: number;
    ebitToAssets: number;
    equityToLiabilities: number;
    salesToAssets: number;
  };
}

export function calculateZScore(data: FinancialData): ZScoreResult {
  const workingCapital = data.currentAssets - data.currentLiabilities;
  const retainedEarnings = data.retainedEarnings ?? data.totalEquity * 0.5;
  const ebit = data.operatingIncome;
  const marketEquity = data.marketCap ?? data.totalEquity * 1.5; // Estimate if not provided

  // Z-Score components
  const A = workingCapital / data.totalAssets;
  const B = retainedEarnings / data.totalAssets;
  const C = ebit / data.totalAssets;
  const D = marketEquity / data.totalLiabilities;
  const E = data.revenue / data.totalAssets;

  // Z = 1.2A + 1.4B + 3.3C + 0.6D + 1.0E
  const zScore = 1.2 * A + 1.4 * B + 3.3 * C + 0.6 * D + 1.0 * E;

  let zone: 'safe' | 'grey' | 'distress';
  let interpretation: string;

  if (zScore > 2.99) {
    zone = 'safe';
    interpretation = 'Company is in the safe zone with low bankruptcy risk.';
  } else if (zScore > 1.81) {
    zone = 'grey';
    interpretation = 'Company is in the grey zone. Monitor financial health closely.';
  } else {
    zone = 'distress';
    interpretation = 'Company is in the distress zone with elevated bankruptcy risk.';
  }

  return {
    score: Math.round(zScore * 100) / 100,
    zone,
    interpretation,
    components: {
      workingCapitalToAssets: A,
      retainedEarningsToAssets: B,
      ebitToAssets: C,
      equityToLiabilities: D,
      salesToAssets: E,
    },
  };
}

// ============================================================================
// PIOTROSKI F-SCORE
// ============================================================================

export interface FScoreResult {
  score: number;             // 0-9
  interpretation: string;
  signals: {
    name: string;
    passed: boolean;
    description: string;
  }[];
}

export function calculateFScore(data: FinancialData): FScoreResult {
  const signals: { name: string; passed: boolean; description: string }[] = [];
  let score = 0;

  const prior = data.priorYear ?? {};

  // Profitability Signals (4 points)
  // 1. Positive ROA
  const roa = data.netIncome / data.totalAssets;
  const positiveRoa = roa > 0;
  signals.push({ name: 'Positive ROA', passed: positiveRoa, description: 'Return on assets is positive' });
  if (positiveRoa) score++;

  // 2. Positive Operating Cash Flow
  const positiveCfo = (data.operatingCashFlow ?? data.netIncome * 1.2) > 0;
  signals.push({ name: 'Positive Cash Flow', passed: positiveCfo, description: 'Operating cash flow is positive' });
  if (positiveCfo) score++;

  // 3. ROA Improvement
  const priorRoa = prior.netIncome && prior.totalAssets ? prior.netIncome / prior.totalAssets : roa - 0.01;
  const roaImproved = roa > priorRoa;
  signals.push({ name: 'ROA Improvement', passed: roaImproved, description: 'ROA improved year-over-year' });
  if (roaImproved) score++;

  // 4. Accruals (CFO > Net Income)
  const cfo = data.operatingCashFlow ?? data.netIncome * 1.1;
  const qualityEarnings = cfo > data.netIncome;
  signals.push({ name: 'Earnings Quality', passed: qualityEarnings, description: 'Cash flow exceeds net income' });
  if (qualityEarnings) score++;

  // Leverage/Liquidity Signals (3 points)
  // 5. Decreasing Leverage
  const currentLeverage = data.longTermDebt / data.totalAssets;
  const priorLeverage = prior.longTermDebt && prior.totalAssets
    ? prior.longTermDebt / prior.totalAssets : currentLeverage + 0.01;
  const decrLeverage = currentLeverage < priorLeverage;
  signals.push({ name: 'Decreasing Leverage', passed: decrLeverage, description: 'Long-term debt ratio decreased' });
  if (decrLeverage) score++;

  // 6. Improving Current Ratio
  const currentRatio = data.currentAssets / data.currentLiabilities;
  const priorCurrentRatio = prior.currentAssets && prior.currentLiabilities
    ? prior.currentAssets / prior.currentLiabilities : currentRatio - 0.1;
  const imprLiquidity = currentRatio > priorCurrentRatio;
  signals.push({ name: 'Improving Liquidity', passed: imprLiquidity, description: 'Current ratio improved' });
  if (imprLiquidity) score++;

  // 7. No New Shares Issued (simplified: equity didn't grow faster than earnings)
  const noShareIssue = !prior.totalEquity || data.totalEquity <= prior.totalEquity * 1.1;
  signals.push({ name: 'No Dilution', passed: noShareIssue, description: 'No significant equity dilution' });
  if (noShareIssue) score++;

  // Operating Efficiency Signals (2 points)
  // 8. Improving Gross Margin
  const grossMargin = data.grossProfit / data.revenue;
  const priorGrossMargin = prior.grossProfit && prior.revenue
    ? prior.grossProfit / prior.revenue : grossMargin - 0.01;
  const imprMargin = grossMargin > priorGrossMargin;
  signals.push({ name: 'Improving Margin', passed: imprMargin, description: 'Gross margin improved' });
  if (imprMargin) score++;

  // 9. Improving Asset Turnover
  const assetTurnover = data.revenue / data.totalAssets;
  const priorTurnover = prior.revenue && prior.totalAssets
    ? prior.revenue / prior.totalAssets : assetTurnover - 0.05;
  const imprTurnover = assetTurnover > priorTurnover;
  signals.push({ name: 'Improving Efficiency', passed: imprTurnover, description: 'Asset turnover improved' });
  if (imprTurnover) score++;

  let interpretation: string;
  if (score >= 8) {
    interpretation = 'Strong fundamentals. Historically, high F-Score companies outperform.';
  } else if (score >= 6) {
    interpretation = 'Good fundamentals with some areas for improvement.';
  } else if (score >= 4) {
    interpretation = 'Mixed fundamentals. Several metrics need attention.';
  } else {
    interpretation = 'Weak fundamentals. Significant concerns across multiple metrics.';
  }

  return { score, interpretation, signals };
}

// ============================================================================
// COMPREHENSIVE HEALTH SCORE
// ============================================================================

function scoreMetric(value: number, thresholds: { excellent: number; good: number; fair: number; poor: number }, higherIsBetter: boolean = true): HealthMetric['status'] {
  if (higherIsBetter) {
    if (value >= thresholds.excellent) return 'excellent';
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.fair) return 'fair';
    if (value >= thresholds.poor) return 'poor';
    return 'critical';
  } else {
    if (value <= thresholds.excellent) return 'excellent';
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.fair) return 'fair';
    if (value <= thresholds.poor) return 'poor';
    return 'critical';
  }
}

function statusToScore(status: HealthMetric['status']): number {
  switch (status) {
    case 'excellent': return 100;
    case 'good': return 80;
    case 'fair': return 60;
    case 'poor': return 40;
    case 'critical': return 20;
  }
}

export function calculateHealthScore(data: FinancialData): HealthScore {
  const components: HealthComponent[] = [];
  const risks: string[] = [];
  const strengths: string[] = [];

  // =========================================================================
  // PROFITABILITY (25% weight)
  // =========================================================================
  const profitabilityMetrics: HealthMetric[] = [];

  // Gross Margin
  const grossMargin = (data.grossProfit / data.revenue) * 100;
  const gmStatus = scoreMetric(grossMargin, { excellent: 50, good: 35, fair: 20, poor: 10 });
  profitabilityMetrics.push({
    name: 'Gross Margin',
    value: grossMargin,
    score: statusToScore(gmStatus),
    benchmark: 40,
    status: gmStatus,
  });

  // Operating Margin
  const opMargin = (data.operatingIncome / data.revenue) * 100;
  const omStatus = scoreMetric(opMargin, { excellent: 20, good: 12, fair: 5, poor: 0 });
  profitabilityMetrics.push({
    name: 'Operating Margin',
    value: opMargin,
    score: statusToScore(omStatus),
    benchmark: 15,
    status: omStatus,
  });

  // Net Margin
  const netMargin = (data.netIncome / data.revenue) * 100;
  const nmStatus = scoreMetric(netMargin, { excellent: 15, good: 8, fair: 3, poor: 0 });
  profitabilityMetrics.push({
    name: 'Net Margin',
    value: netMargin,
    score: statusToScore(nmStatus),
    benchmark: 10,
    status: nmStatus,
  });

  // ROA
  const roa = (data.netIncome / data.totalAssets) * 100;
  const roaStatus = scoreMetric(roa, { excellent: 12, good: 7, fair: 3, poor: 0 });
  profitabilityMetrics.push({
    name: 'Return on Assets',
    value: roa,
    score: statusToScore(roaStatus),
    benchmark: 8,
    status: roaStatus,
  });

  // ROE
  const roe = data.totalEquity > 0 ? (data.netIncome / data.totalEquity) * 100 : 0;
  const roeStatus = scoreMetric(roe, { excellent: 20, good: 12, fair: 5, poor: 0 });
  profitabilityMetrics.push({
    name: 'Return on Equity',
    value: roe,
    score: statusToScore(roeStatus),
    benchmark: 15,
    status: roeStatus,
  });

  const profitabilityScore = profitabilityMetrics.reduce((sum, m) => sum + m.score, 0) / profitabilityMetrics.length;
  components.push({
    name: 'Profitability',
    category: 'profitability',
    score: profitabilityScore,
    weight: 0.25,
    metrics: profitabilityMetrics,
    interpretation: profitabilityScore >= 70 ? 'Strong profit generation' :
      profitabilityScore >= 50 ? 'Adequate profitability' : 'Profitability concerns',
  });

  if (profitabilityScore >= 80) strengths.push('Strong profitability metrics');
  if (profitabilityScore < 40) risks.push('Weak profitability threatens long-term viability');

  // =========================================================================
  // LIQUIDITY (20% weight)
  // =========================================================================
  const liquidityMetrics: HealthMetric[] = [];

  // Current Ratio
  const currentRatio = data.currentAssets / data.currentLiabilities;
  const crStatus = scoreMetric(currentRatio, { excellent: 2.0, good: 1.5, fair: 1.0, poor: 0.8 });
  liquidityMetrics.push({
    name: 'Current Ratio',
    value: currentRatio,
    score: statusToScore(crStatus),
    benchmark: 1.5,
    status: crStatus,
  });

  // Quick Ratio
  const quickAssets = data.currentAssets - (data.inventory ?? 0);
  const quickRatio = quickAssets / data.currentLiabilities;
  const qrStatus = scoreMetric(quickRatio, { excellent: 1.5, good: 1.0, fair: 0.7, poor: 0.5 });
  liquidityMetrics.push({
    name: 'Quick Ratio',
    value: quickRatio,
    score: statusToScore(qrStatus),
    benchmark: 1.0,
    status: qrStatus,
  });

  // Cash Ratio
  const cashRatio = data.cash / data.currentLiabilities;
  const cashStatus = scoreMetric(cashRatio, { excellent: 0.5, good: 0.3, fair: 0.15, poor: 0.05 });
  liquidityMetrics.push({
    name: 'Cash Ratio',
    value: cashRatio,
    score: statusToScore(cashStatus),
    benchmark: 0.25,
    status: cashStatus,
  });

  const liquidityScore = liquidityMetrics.reduce((sum, m) => sum + m.score, 0) / liquidityMetrics.length;
  components.push({
    name: 'Liquidity',
    category: 'liquidity',
    score: liquidityScore,
    weight: 0.20,
    metrics: liquidityMetrics,
    interpretation: liquidityScore >= 70 ? 'Strong short-term financial position' :
      liquidityScore >= 50 ? 'Adequate liquidity' : 'Liquidity risk present',
  });

  if (liquidityScore >= 80) strengths.push('Strong liquidity position');
  if (liquidityScore < 40) risks.push('Liquidity risk - may struggle with short-term obligations');

  // =========================================================================
  // SOLVENCY (25% weight)
  // =========================================================================
  const solvencyMetrics: HealthMetric[] = [];

  // Debt to Equity
  const debtToEquity = data.totalEquity > 0 ? data.totalLiabilities / data.totalEquity : 10;
  const deStatus = scoreMetric(debtToEquity, { excellent: 0.5, good: 1.0, fair: 2.0, poor: 3.0 }, false);
  solvencyMetrics.push({
    name: 'Debt to Equity',
    value: debtToEquity,
    score: statusToScore(deStatus),
    benchmark: 1.0,
    status: deStatus,
  });

  // Debt to Assets
  const debtToAssets = data.totalLiabilities / data.totalAssets;
  const daStatus = scoreMetric(debtToAssets, { excellent: 0.3, good: 0.5, fair: 0.65, poor: 0.8 }, false);
  solvencyMetrics.push({
    name: 'Debt to Assets',
    value: debtToAssets,
    score: statusToScore(daStatus),
    benchmark: 0.5,
    status: daStatus,
  });

  // Interest Coverage (using EBITDA)
  const interestCoverage = data.ebitda / Math.max(1, data.longTermDebt * 0.05); // Assume 5% interest
  const icStatus = scoreMetric(interestCoverage, { excellent: 10, good: 5, fair: 2.5, poor: 1.5 });
  solvencyMetrics.push({
    name: 'Interest Coverage',
    value: interestCoverage,
    score: statusToScore(icStatus),
    benchmark: 5,
    status: icStatus,
  });

  // Equity Ratio
  const equityRatio = data.totalEquity / data.totalAssets;
  const erStatus = scoreMetric(equityRatio, { excellent: 0.5, good: 0.35, fair: 0.25, poor: 0.15 });
  solvencyMetrics.push({
    name: 'Equity Ratio',
    value: equityRatio,
    score: statusToScore(erStatus),
    benchmark: 0.4,
    status: erStatus,
  });

  const solvencyScore = solvencyMetrics.reduce((sum, m) => sum + m.score, 0) / solvencyMetrics.length;
  components.push({
    name: 'Solvency',
    category: 'solvency',
    score: solvencyScore,
    weight: 0.25,
    metrics: solvencyMetrics,
    interpretation: solvencyScore >= 70 ? 'Strong long-term financial stability' :
      solvencyScore >= 50 ? 'Moderate leverage levels' : 'High leverage concerns',
  });

  if (solvencyScore >= 80) strengths.push('Conservative capital structure');
  if (solvencyScore < 40) risks.push('High leverage increases financial risk');

  // =========================================================================
  // EFFICIENCY (15% weight)
  // =========================================================================
  const efficiencyMetrics: HealthMetric[] = [];

  // Asset Turnover
  const assetTurnover = data.revenue / data.totalAssets;
  const atStatus = scoreMetric(assetTurnover, { excellent: 1.5, good: 1.0, fair: 0.6, poor: 0.3 });
  efficiencyMetrics.push({
    name: 'Asset Turnover',
    value: assetTurnover,
    score: statusToScore(atStatus),
    benchmark: 1.0,
    status: atStatus,
  });

  // Receivables Turnover (if available)
  if (data.receivables && data.receivables > 0) {
    const recTurnover = data.revenue / data.receivables;
    const rtStatus = scoreMetric(recTurnover, { excellent: 12, good: 8, fair: 5, poor: 3 });
    efficiencyMetrics.push({
      name: 'Receivables Turnover',
      value: recTurnover,
      score: statusToScore(rtStatus),
      benchmark: 8,
      status: rtStatus,
    });
  }

  // Inventory Turnover (if available)
  if (data.inventory && data.inventory > 0) {
    const cogs = data.revenue - data.grossProfit;
    const invTurnover = cogs / data.inventory;
    const itStatus = scoreMetric(invTurnover, { excellent: 10, good: 6, fair: 4, poor: 2 });
    efficiencyMetrics.push({
      name: 'Inventory Turnover',
      value: invTurnover,
      score: statusToScore(itStatus),
      benchmark: 6,
      status: itStatus,
    });
  }

  const efficiencyScore = efficiencyMetrics.reduce((sum, m) => sum + m.score, 0) / efficiencyMetrics.length;
  components.push({
    name: 'Efficiency',
    category: 'efficiency',
    score: efficiencyScore,
    weight: 0.15,
    metrics: efficiencyMetrics,
    interpretation: efficiencyScore >= 70 ? 'Efficient use of assets' :
      efficiencyScore >= 50 ? 'Adequate operational efficiency' : 'Efficiency improvements needed',
  });

  if (efficiencyScore >= 80) strengths.push('Efficient asset utilization');
  if (efficiencyScore < 40) risks.push('Poor operational efficiency');

  // =========================================================================
  // GROWTH (15% weight)
  // =========================================================================
  const growthMetrics: HealthMetric[] = [];

  if (data.revenueGrowth !== undefined) {
    const rgStatus = scoreMetric(data.revenueGrowth, { excellent: 20, good: 10, fair: 3, poor: -5 });
    growthMetrics.push({
      name: 'Revenue Growth',
      value: data.revenueGrowth,
      score: statusToScore(rgStatus),
      benchmark: 10,
      status: rgStatus,
    });
  }

  // Cash Flow Growth (proxy)
  const cfoMargin = (data.operatingCashFlow ?? data.ebitda * 0.8) / data.revenue * 100;
  const cfoStatus = scoreMetric(cfoMargin, { excellent: 20, good: 12, fair: 5, poor: 0 });
  growthMetrics.push({
    name: 'Cash Flow Margin',
    value: cfoMargin,
    score: statusToScore(cfoStatus),
    benchmark: 15,
    status: cfoStatus,
  });

  const growthScore = growthMetrics.length > 0
    ? growthMetrics.reduce((sum, m) => sum + m.score, 0) / growthMetrics.length
    : 50;

  components.push({
    name: 'Growth',
    category: 'growth',
    score: growthScore,
    weight: 0.15,
    metrics: growthMetrics,
    interpretation: growthScore >= 70 ? 'Strong growth trajectory' :
      growthScore >= 50 ? 'Moderate growth' : 'Growth challenges',
  });

  if (growthScore >= 80) strengths.push('Strong growth momentum');
  if (growthScore < 40) risks.push('Declining or stagnant growth');

  // =========================================================================
  // CALCULATE OVERALL SCORE
  // =========================================================================
  const overall = components.reduce((sum, c) => sum + c.score * c.weight, 0);

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overall >= 85) grade = 'A';
  else if (overall >= 70) grade = 'B';
  else if (overall >= 55) grade = 'C';
  else if (overall >= 40) grade = 'D';
  else grade = 'F';

  let summary: string;
  if (grade === 'A') {
    summary = 'Excellent financial health across all dimensions. Strong fundamentals.';
  } else if (grade === 'B') {
    summary = 'Good financial health with minor areas for improvement.';
  } else if (grade === 'C') {
    summary = 'Fair financial health. Several metrics need attention.';
  } else if (grade === 'D') {
    summary = 'Below average financial health. Multiple concerns present.';
  } else {
    summary = 'Poor financial health. Significant risks across multiple dimensions.';
  }

  return {
    overall: Math.round(overall),
    grade,
    components,
    summary,
    risks,
    strengths,
  };
}
