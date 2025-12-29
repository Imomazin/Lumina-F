/**
 * Intelligent Auto-Fill System
 *
 * Smart defaults based on industry, company stage, and patterns
 * Machine learning-inspired heuristics for financial inputs
 */

import { getIndustryById, IndustryBenchmark, INDUSTRY_BENCHMARKS } from './industries';

// ============================================================================
// TYPES
// ============================================================================

export type CompanyStage = 'startup' | 'growth' | 'mature' | 'declining';
export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

export interface CompanyProfile {
  industryId: string;
  stage: CompanyStage;
  size: CompanySize;
  revenue?: number;
  age?: number; // Years in business
  isPublic?: boolean;
  geography?: 'us' | 'europe' | 'asia' | 'emerging' | 'global';
}

export interface AutoFillResult {
  field: string;
  value: number;
  confidence: number; // 0-1
  source: string;
  reasoning: string;
  range: { low: number; high: number };
}

export interface CompleteProjection {
  revenue: number[];
  revenueGrowth: number[];
  grossMargin: number[];
  operatingExpenses: number[];
  ebitda: number[];
  ebitdaMargin: number[];
  capex: number[];
  depreciation: number[];
  workingCapital: number[];
  taxes: number[];
  netIncome: number[];
  freeCashFlow: number[];
}

// ============================================================================
// STAGE & SIZE ADJUSTMENTS
// ============================================================================

const stageAdjustments: Record<CompanyStage, Record<string, number>> = {
  startup: {
    revenueGrowthMultiplier: 2.5,
    marginDiscount: 0.4,      // Lower margins
    volatilityMultiplier: 2.0,
    capexMultiplier: 1.5,
    workingCapitalMultiplier: 1.3,
  },
  growth: {
    revenueGrowthMultiplier: 1.5,
    marginDiscount: 0.8,
    volatilityMultiplier: 1.3,
    capexMultiplier: 1.2,
    workingCapitalMultiplier: 1.1,
  },
  mature: {
    revenueGrowthMultiplier: 0.8,
    marginDiscount: 1.0,
    volatilityMultiplier: 0.8,
    capexMultiplier: 1.0,
    workingCapitalMultiplier: 1.0,
  },
  declining: {
    revenueGrowthMultiplier: 0.3,
    marginDiscount: 0.9,
    volatilityMultiplier: 1.2,
    capexMultiplier: 0.6,
    workingCapitalMultiplier: 0.9,
  },
};

const sizeAdjustments: Record<CompanySize, Record<string, number>> = {
  micro: {     // < $1M revenue
    marginDiscount: 0.7,
    efficiencyMultiplier: 0.8,
    leverageLimit: 0.5,
  },
  small: {     // $1M - $10M revenue
    marginDiscount: 0.85,
    efficiencyMultiplier: 0.9,
    leverageLimit: 0.7,
  },
  medium: {    // $10M - $100M revenue
    marginDiscount: 0.95,
    efficiencyMultiplier: 0.95,
    leverageLimit: 1.0,
  },
  large: {     // $100M - $1B revenue
    marginDiscount: 1.0,
    efficiencyMultiplier: 1.0,
    leverageLimit: 1.2,
  },
  enterprise: { // > $1B revenue
    marginDiscount: 1.05,
    efficiencyMultiplier: 1.1,
    leverageLimit: 1.5,
  },
};

// ============================================================================
// AUTO-FILL ENGINE
// ============================================================================

export function autoFillFinancials(profile: CompanyProfile): AutoFillResult[] {
  const industry = getIndustryById(profile.industryId);
  if (!industry) return [];

  const stageAdj = stageAdjustments[profile.stage];
  const sizeAdj = sizeAdjustments[profile.size];
  const results: AutoFillResult[] = [];

  // Revenue Growth
  const baseGrowth = industry.revenueGrowth.p50;
  const adjustedGrowth = baseGrowth * stageAdj.revenueGrowthMultiplier;
  results.push({
    field: 'revenueGrowth',
    value: Math.round(adjustedGrowth * 10) / 10,
    confidence: 0.7,
    source: 'Industry + Stage Adjustment',
    reasoning: `${industry.name} median growth (${baseGrowth}%) adjusted for ${profile.stage} stage`,
    range: {
      low: industry.revenueGrowth.p25 * stageAdj.revenueGrowthMultiplier,
      high: industry.revenueGrowth.p75 * stageAdj.revenueGrowthMultiplier,
    },
  });

  // Gross Margin
  const baseGrossMargin = industry.grossMargin.p50;
  const adjustedGrossMargin = baseGrossMargin * stageAdj.marginDiscount * sizeAdj.marginDiscount;
  results.push({
    field: 'grossMargin',
    value: Math.round(adjustedGrossMargin * 10) / 10,
    confidence: 0.75,
    source: 'Industry + Size Adjustment',
    reasoning: `${industry.name} median (${baseGrossMargin}%) adjusted for company profile`,
    range: {
      low: industry.grossMargin.p25 * stageAdj.marginDiscount,
      high: industry.grossMargin.p75,
    },
  });

  // EBITDA Margin
  const baseEbitdaMargin = industry.ebitdaMargin.p50;
  const adjustedEbitdaMargin = baseEbitdaMargin * stageAdj.marginDiscount * sizeAdj.marginDiscount;
  results.push({
    field: 'ebitdaMargin',
    value: Math.round(adjustedEbitdaMargin * 10) / 10,
    confidence: 0.65,
    source: 'Industry + Stage Adjustment',
    reasoning: `${industry.name} median (${baseEbitdaMargin}%) adjusted for ${profile.stage} stage`,
    range: {
      low: Math.max(-50, industry.ebitdaMargin.p25 * stageAdj.marginDiscount),
      high: industry.ebitdaMargin.p75,
    },
  });

  // Operating Expense Ratio (derived from margins)
  const opexRatio = adjustedGrossMargin - adjustedEbitdaMargin;
  results.push({
    field: 'operatingExpenseRatio',
    value: Math.round(opexRatio * 10) / 10,
    confidence: 0.6,
    source: 'Derived from Margins',
    reasoning: 'Calculated as Gross Margin - EBITDA Margin',
    range: {
      low: (industry.grossMargin.p25 - industry.ebitdaMargin.p75) * stageAdj.marginDiscount,
      high: (industry.grossMargin.p75 - industry.ebitdaMargin.p25),
    },
  });

  // CapEx to Revenue
  const baseCapex = industry.capexToRevenue.p50;
  const adjustedCapex = baseCapex * stageAdj.capexMultiplier;
  results.push({
    field: 'capexToRevenue',
    value: Math.round(adjustedCapex * 10) / 10,
    confidence: 0.6,
    source: 'Industry + Stage Adjustment',
    reasoning: `${industry.name} typical CapEx adjusted for ${profile.stage} stage investment needs`,
    range: {
      low: industry.capexToRevenue.p25,
      high: industry.capexToRevenue.p75 * stageAdj.capexMultiplier,
    },
  });

  // Depreciation (typically 70-90% of CapEx for steady state)
  const depreciationRatio = adjustedCapex * 0.8;
  results.push({
    field: 'depreciationToRevenue',
    value: Math.round(depreciationRatio * 10) / 10,
    confidence: 0.55,
    source: 'Derived from CapEx',
    reasoning: 'Estimated at 80% of CapEx ratio for steady state',
    range: {
      low: adjustedCapex * 0.6,
      high: adjustedCapex * 1.0,
    },
  });

  // Tax Rate
  const taxRate = profile.geography === 'europe' ? 25 : profile.geography === 'asia' ? 22 : 26;
  results.push({
    field: 'effectiveTaxRate',
    value: taxRate,
    confidence: 0.7,
    source: 'Geography-Based',
    reasoning: `Typical effective tax rate for ${profile.geography || 'US'} companies`,
    range: {
      low: taxRate - 5,
      high: taxRate + 8,
    },
  });

  // Working Capital as % of Revenue
  const workingCapitalRatio = 10 * stageAdj.workingCapitalMultiplier; // 10% base
  results.push({
    field: 'workingCapitalRatio',
    value: Math.round(workingCapitalRatio * 10) / 10,
    confidence: 0.5,
    source: 'Stage-Adjusted Default',
    reasoning: `Base 10% adjusted for ${profile.stage} stage cash needs`,
    range: {
      low: 5,
      high: 20 * stageAdj.workingCapitalMultiplier,
    },
  });

  // Terminal Growth Rate
  const terminalGrowth = profile.geography === 'emerging' ? 4 : 2.5;
  results.push({
    field: 'terminalGrowthRate',
    value: terminalGrowth,
    confidence: 0.8,
    source: 'Economic Standard',
    reasoning: `Long-term GDP growth assumption for ${profile.geography || 'developed'} markets`,
    range: {
      low: 1.5,
      high: profile.geography === 'emerging' ? 5 : 3.5,
    },
  });

  // Discount Rate (WACC proxy)
  let discountRate = 10; // Base
  if (profile.stage === 'startup') discountRate = 25;
  else if (profile.stage === 'growth') discountRate = 15;
  else if (profile.size === 'micro' || profile.size === 'small') discountRate += 3;

  results.push({
    field: 'discountRate',
    value: discountRate,
    confidence: 0.6,
    source: 'Risk-Adjusted',
    reasoning: `Base rate adjusted for ${profile.stage} stage and ${profile.size} size risk`,
    range: {
      low: discountRate - 3,
      high: discountRate + 5,
    },
  });

  return results;
}

// ============================================================================
// COMPLETE PROJECTION GENERATOR
// ============================================================================

export function generateCompleteProjection(
  profile: CompanyProfile,
  baseRevenue: number,
  years: number = 5
): CompleteProjection {
  const autoFilled = autoFillFinancials(profile);
  const getValue = (field: string): number => {
    const result = autoFilled.find(r => r.field === field);
    return result?.value ?? 0;
  };

  const revenueGrowth = getValue('revenueGrowth');
  const grossMargin = getValue('grossMargin');
  const ebitdaMargin = getValue('ebitdaMargin');
  const capexRatio = getValue('capexToRevenue');
  const depreciationRatio = getValue('depreciationToRevenue');
  const taxRate = getValue('effectiveTaxRate');
  const wcRatio = getValue('workingCapitalRatio');

  const projection: CompleteProjection = {
    revenue: [],
    revenueGrowth: [],
    grossMargin: [],
    operatingExpenses: [],
    ebitda: [],
    ebitdaMargin: [],
    capex: [],
    depreciation: [],
    workingCapital: [],
    taxes: [],
    netIncome: [],
    freeCashFlow: [],
  };

  let currentRevenue = baseRevenue;
  let previousWC = baseRevenue * (wcRatio / 100);

  // Decay growth rate over time for growth/startup companies
  const growthDecay = profile.stage === 'startup' ? 0.85 : profile.stage === 'growth' ? 0.92 : 1;

  for (let year = 0; year < years; year++) {
    // Revenue with decaying growth
    const yearGrowth = revenueGrowth * Math.pow(growthDecay, year);
    currentRevenue = year === 0 ? baseRevenue : currentRevenue * (1 + yearGrowth / 100);
    projection.revenue.push(currentRevenue);
    projection.revenueGrowth.push(year === 0 ? revenueGrowth : yearGrowth);

    // Margins improve slightly for growth companies
    const marginImprovement = profile.stage === 'startup' || profile.stage === 'growth'
      ? Math.min(year * 1.5, 8) : 0;

    const yearGrossMargin = Math.min(95, grossMargin + marginImprovement * 0.3);
    const yearEbitdaMargin = ebitdaMargin + marginImprovement;

    projection.grossMargin.push(yearGrossMargin);
    projection.ebitdaMargin.push(yearEbitdaMargin);

    // Calculate values
    const grossProfit = currentRevenue * (yearGrossMargin / 100);
    const ebitda = currentRevenue * (yearEbitdaMargin / 100);
    const opex = grossProfit - ebitda;

    projection.operatingExpenses.push(opex);
    projection.ebitda.push(ebitda);

    // Depreciation and CapEx
    const depreciation = currentRevenue * (depreciationRatio / 100);
    const capex = currentRevenue * (capexRatio / 100);
    projection.depreciation.push(depreciation);
    projection.capex.push(capex);

    // EBIT and Net Income
    const ebit = ebitda - depreciation;
    const taxes = Math.max(0, ebit * (taxRate / 100));
    const netIncome = ebit - taxes;
    projection.taxes.push(taxes);
    projection.netIncome.push(netIncome);

    // Working Capital
    const currentWC = currentRevenue * (wcRatio / 100);
    const wcChange = currentWC - previousWC;
    projection.workingCapital.push(wcChange);
    previousWC = currentWC;

    // Free Cash Flow
    const fcf = netIncome + depreciation - capex - wcChange;
    projection.freeCashFlow.push(fcf);
  }

  return projection;
}

// ============================================================================
// SIMILAR COMPANY FINDER
// ============================================================================

export interface SimilarCompany {
  industryId: string;
  industryName: string;
  similarityScore: number;
  keyMetrics: Record<string, number>;
}

export function findSimilarIndustries(
  metrics: { grossMargin?: number; revenueGrowth?: number; ebitdaMargin?: number },
  limit: number = 5
): SimilarCompany[] {
  const scores: { industry: IndustryBenchmark; score: number }[] = [];

  for (const industry of INDUSTRY_BENCHMARKS) {
    let score = 0;
    let factors = 0;

    if (metrics.grossMargin !== undefined) {
      const diff = Math.abs(metrics.grossMargin - industry.grossMargin.p50);
      score += Math.max(0, 100 - diff * 2);
      factors++;
    }

    if (metrics.revenueGrowth !== undefined) {
      const diff = Math.abs(metrics.revenueGrowth - industry.revenueGrowth.p50);
      score += Math.max(0, 100 - diff * 3);
      factors++;
    }

    if (metrics.ebitdaMargin !== undefined) {
      const diff = Math.abs(metrics.ebitdaMargin - industry.ebitdaMargin.p50);
      score += Math.max(0, 100 - diff * 2.5);
      factors++;
    }

    if (factors > 0) {
      scores.push({ industry, score: score / factors });
    }
  }

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => ({
      industryId: s.industry.id,
      industryName: s.industry.name,
      similarityScore: Math.round(s.score),
      keyMetrics: {
        grossMargin: s.industry.grossMargin.p50,
        revenueGrowth: s.industry.revenueGrowth.p50,
        ebitdaMargin: s.industry.ebitdaMargin.p50,
        netMargin: s.industry.netMargin.p50,
      },
    }));
}

// ============================================================================
// QUICK FILL PRESETS
// ============================================================================

export interface QuickFillPreset {
  id: string;
  name: string;
  description: string;
  profile: CompanyProfile;
}

export const QUICK_FILL_PRESETS: QuickFillPreset[] = [
  {
    id: 'high-growth-saas',
    name: 'High-Growth SaaS',
    description: 'Fast-growing B2B software company',
    profile: {
      industryId: 'software-saas',
      stage: 'growth',
      size: 'small',
      geography: 'us',
    },
  },
  {
    id: 'early-stage-fintech',
    name: 'Early-Stage Fintech',
    description: 'Pre-profit fintech startup',
    profile: {
      industryId: 'fintech',
      stage: 'startup',
      size: 'micro',
      geography: 'us',
    },
  },
  {
    id: 'mature-manufacturing',
    name: 'Mature Manufacturing',
    description: 'Established industrial company',
    profile: {
      industryId: 'machinery',
      stage: 'mature',
      size: 'medium',
      geography: 'us',
    },
  },
  {
    id: 'growth-healthcare',
    name: 'Growth Healthcare Services',
    description: 'Expanding healthcare provider',
    profile: {
      industryId: 'healthcare-services',
      stage: 'growth',
      size: 'medium',
      geography: 'us',
    },
  },
  {
    id: 'enterprise-tech',
    name: 'Enterprise Technology',
    description: 'Large-cap enterprise software',
    profile: {
      industryId: 'software-enterprise',
      stage: 'mature',
      size: 'enterprise',
      geography: 'global',
    },
  },
  {
    id: 'emerging-ecommerce',
    name: 'E-commerce Growth',
    description: 'Online retail in growth phase',
    profile: {
      industryId: 'retail-ecommerce',
      stage: 'growth',
      size: 'small',
      geography: 'us',
    },
  },
  {
    id: 'biotech-clinical',
    name: 'Clinical-Stage Biotech',
    description: 'Pre-revenue biotech in trials',
    profile: {
      industryId: 'biotechnology',
      stage: 'startup',
      size: 'small',
      geography: 'us',
    },
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    description: 'Solar/wind energy company',
    profile: {
      industryId: 'renewable-solar',
      stage: 'growth',
      size: 'medium',
      geography: 'us',
    },
  },
];

export function applyQuickFillPreset(presetId: string, baseRevenue: number): {
  profile: CompanyProfile;
  autoFill: AutoFillResult[];
  projection: CompleteProjection;
} | null {
  const preset = QUICK_FILL_PRESETS.find(p => p.id === presetId);
  if (!preset) return null;

  const autoFill = autoFillFinancials(preset.profile);
  const projection = generateCompleteProjection(preset.profile, baseRevenue);

  return {
    profile: preset.profile,
    autoFill,
    projection,
  };
}
