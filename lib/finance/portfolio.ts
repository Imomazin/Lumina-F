/**
 * Portfolio Analysis Module
 *
 * Multi-company portfolio management with:
 * - Aggregated metrics and returns
 * - Diversification analysis
 * - Risk-adjusted performance
 * - Attribution analysis
 */

import { AnalysisSession } from '../schema';
import { ForecastResult } from './forecast';
import { ValuationMetrics } from './valuation';

// ============================================================================
// TYPES
// ============================================================================

export interface PortfolioCompany {
  id: string;
  name: string;
  industry: string;
  investmentDate: string;
  investmentAmount: number;
  ownershipPercent: number;
  currentValue: number;
  inputs: AnalysisSession;
  forecast?: ForecastResult;
  valuation?: ValuationMetrics;
  status: 'active' | 'exited' | 'written-off';
  exitDate?: string;
  exitValue?: number;
  tags?: string[];
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  currency: string;
  companies: PortfolioCompany[];
  vintage?: number;
  fundSize?: number;
  created: string;
  updated: string;
}

export interface PortfolioAnalysisResult {
  summary: PortfolioSummary;
  performance: PerformanceMetrics;
  composition: CompositionAnalysis;
  diversification: DiversificationMetrics;
  attribution: AttributionAnalysis;
  riskMetrics: PortfolioRiskMetrics;
  companies: CompanyPerformance[];
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalRealized: number;
  totalUnrealized: number;
  netGain: number;
  activeCompanies: number;
  exitedCompanies: number;
  writtenOff: number;
}

export interface PerformanceMetrics {
  grossMOIC: number;
  netMOIC: number;
  grossIRR: number;
  netIRR: number;
  tvpi: number; // Total Value to Paid-In
  dpi: number; // Distributions to Paid-In
  rvpi: number; // Residual Value to Paid-In
  pme: number; // Public Market Equivalent
}

export interface CompositionAnalysis {
  byIndustry: { industry: string; value: number; percentage: number; count: number }[];
  byStatus: { status: string; value: number; percentage: number; count: number }[];
  byVintage: { year: number; value: number; percentage: number; count: number }[];
  bySize: { bucket: string; value: number; percentage: number; count: number }[];
  concentration: {
    top1: number;
    top3: number;
    top5: number;
    herfindahl: number;
  };
}

export interface DiversificationMetrics {
  industryCount: number;
  effectiveNumberOfIndustries: number;
  correlationMatrix?: number[][];
  maxSingleExposure: number;
  maxIndustryExposure: number;
  geographicSpread?: number;
  diversificationScore: number; // 0-100
}

export interface AttributionAnalysis {
  totalReturn: number;
  components: {
    name: string;
    contribution: number;
    percentage: number;
  }[];
  topContributors: {
    company: string;
    contribution: number;
    returnPercent: number;
  }[];
  bottomContributors: {
    company: string;
    contribution: number;
    returnPercent: number;
  }[];
}

export interface PortfolioRiskMetrics {
  portfolioVolatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  valueAtRisk95: number;
  valueAtRisk99: number;
  concentrationRisk: 'low' | 'moderate' | 'high';
  liquidityScore: number;
}

export interface CompanyPerformance {
  id: string;
  name: string;
  industry: string;
  invested: number;
  currentValue: number;
  moic: number;
  irr: number;
  holdingPeriod: number;
  status: string;
  weight: number;
  contribution: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function safeDiv(numerator: number, denominator: number, fallback: number = 0): number {
  return denominator !== 0 ? numerator / denominator : fallback;
}

function calculateIRR(cashFlows: { date: Date; amount: number }[], guess: number = 0.1): number {
  if (cashFlows.length < 2) return 0;

  const sortedFlows = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const startDate = sortedFlows[0].date;

  // Newton-Raphson method for XIRR
  let rate = guess;
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;

    for (const cf of sortedFlows) {
      const years = (cf.date.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      const discountFactor = Math.pow(1 + rate, years);
      npv += cf.amount / discountFactor;
      if (years > 0) {
        derivative -= (years * cf.amount) / Math.pow(1 + rate, years + 1);
      }
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100;
    }

    if (derivative === 0) break;
    rate = rate - npv / derivative;

    if (rate < -0.99) rate = -0.99;
    if (rate > 10) rate = 10;
  }

  return rate * 100;
}

function calculateHerfindahl(weights: number[]): number {
  return weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
}

// ============================================================================
// PORTFOLIO ANALYSIS ENGINE
// ============================================================================

export function analyzePortfolio(portfolio: Portfolio): PortfolioAnalysisResult {
  const companies = portfolio.companies;
  const currency = portfolio.currency || 'USD';

  // =========================================================================
  // PORTFOLIO SUMMARY
  // =========================================================================
  const activeCompanies = companies.filter(c => c.status === 'active');
  const exitedCompanies = companies.filter(c => c.status === 'exited');
  const writtenOff = companies.filter(c => c.status === 'written-off');

  const totalInvested = companies.reduce((sum, c) => sum + c.investmentAmount, 0);
  const totalCurrentValue = activeCompanies.reduce((sum, c) => sum + c.currentValue, 0);
  const totalRealized = exitedCompanies.reduce((sum, c) => sum + (c.exitValue || 0), 0);
  const totalUnrealized = totalCurrentValue;
  const totalValue = totalRealized + totalUnrealized;
  const netGain = totalValue - totalInvested;

  const summary: PortfolioSummary = {
    totalInvested: round(totalInvested),
    totalCurrentValue: round(totalCurrentValue),
    totalRealized: round(totalRealized),
    totalUnrealized: round(totalUnrealized),
    netGain: round(netGain),
    activeCompanies: activeCompanies.length,
    exitedCompanies: exitedCompanies.length,
    writtenOff: writtenOff.length,
  };

  // =========================================================================
  // PERFORMANCE METRICS
  // =========================================================================
  const grossMOIC = safeDiv(totalValue, totalInvested);
  const tvpi = grossMOIC;
  const dpi = safeDiv(totalRealized, totalInvested);
  const rvpi = safeDiv(totalUnrealized, totalInvested);

  // Calculate portfolio IRR
  const cashFlows: { date: Date; amount: number }[] = [];

  companies.forEach(company => {
    // Investment outflow
    cashFlows.push({
      date: new Date(company.investmentDate),
      amount: -company.investmentAmount,
    });

    // Exit or current value
    if (company.status === 'exited' && company.exitDate) {
      cashFlows.push({
        date: new Date(company.exitDate),
        amount: company.exitValue || 0,
      });
    } else if (company.status === 'active') {
      cashFlows.push({
        date: new Date(),
        amount: company.currentValue,
      });
    }
  });

  const grossIRR = calculateIRR(cashFlows);

  const performance: PerformanceMetrics = {
    grossMOIC: round(grossMOIC, 2),
    netMOIC: round(grossMOIC * 0.8, 2), // Assuming 20% carry
    grossIRR: round(grossIRR, 1),
    netIRR: round(grossIRR * 0.85, 1),
    tvpi: round(tvpi, 2),
    dpi: round(dpi, 2),
    rvpi: round(rvpi, 2),
    pme: round(grossMOIC / 1.1, 2), // Simplified PME assuming 10% market return
  };

  // =========================================================================
  // COMPOSITION ANALYSIS
  // =========================================================================

  // By Industry
  const industryMap = new Map<string, { value: number; count: number }>();
  companies.forEach(c => {
    const existing = industryMap.get(c.industry) || { value: 0, count: 0 };
    existing.value += c.currentValue || c.investmentAmount;
    existing.count++;
    industryMap.set(c.industry, existing);
  });

  const byIndustry = Array.from(industryMap.entries())
    .map(([industry, data]) => ({
      industry,
      value: round(data.value),
      percentage: round((data.value / totalValue) * 100, 1),
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  // By Status
  const byStatus = [
    { status: 'Active', value: totalCurrentValue, percentage: round((totalCurrentValue / totalValue) * 100, 1), count: activeCompanies.length },
    { status: 'Exited', value: totalRealized, percentage: round((totalRealized / totalValue) * 100, 1), count: exitedCompanies.length },
    { status: 'Written Off', value: 0, percentage: 0, count: writtenOff.length },
  ];

  // By Vintage
  const vintageMap = new Map<number, { value: number; count: number }>();
  companies.forEach(c => {
    const year = new Date(c.investmentDate).getFullYear();
    const existing = vintageMap.get(year) || { value: 0, count: 0 };
    existing.value += c.currentValue || c.investmentAmount;
    existing.count++;
    vintageMap.set(year, existing);
  });

  const byVintage = Array.from(vintageMap.entries())
    .map(([year, data]) => ({
      year,
      value: round(data.value),
      percentage: round((data.value / totalValue) * 100, 1),
      count: data.count,
    }))
    .sort((a, b) => a.year - b.year);

  // By Size
  const sizeBuckets = [
    { name: '< $1M', min: 0, max: 1e6 },
    { name: '$1M - $5M', min: 1e6, max: 5e6 },
    { name: '$5M - $25M', min: 5e6, max: 25e6 },
    { name: '$25M - $100M', min: 25e6, max: 100e6 },
    { name: '> $100M', min: 100e6, max: Infinity },
  ];

  const bySize = sizeBuckets.map(bucket => {
    const matches = companies.filter(c =>
      c.investmentAmount >= bucket.min && c.investmentAmount < bucket.max
    );
    const value = matches.reduce((sum, c) => sum + (c.currentValue || c.investmentAmount), 0);
    return {
      bucket: bucket.name,
      value: round(value),
      percentage: round((value / totalValue) * 100, 1),
      count: matches.length,
    };
  });

  // Concentration
  const weights = companies.map(c => safeDiv(c.currentValue || c.investmentAmount, totalValue));
  const sortedWeights = [...weights].sort((a, b) => b - a);

  const concentration = {
    top1: round(sortedWeights[0] * 100, 1),
    top3: round(sortedWeights.slice(0, 3).reduce((a, b) => a + b, 0) * 100, 1),
    top5: round(sortedWeights.slice(0, 5).reduce((a, b) => a + b, 0) * 100, 1),
    herfindahl: round(calculateHerfindahl(weights), 4),
  };

  const composition: CompositionAnalysis = {
    byIndustry,
    byStatus,
    byVintage,
    bySize,
    concentration,
  };

  // =========================================================================
  // DIVERSIFICATION METRICS
  // =========================================================================
  const industryWeights = byIndustry.map(i => i.percentage / 100);
  const effectiveN = 1 / calculateHerfindahl(industryWeights);

  let diversificationScore = 0;
  // Industry diversification (max 40 points)
  diversificationScore += Math.min(40, industryMap.size * 8);
  // Concentration (max 30 points)
  diversificationScore += Math.max(0, 30 - concentration.top1);
  // Number of companies (max 30 points)
  diversificationScore += Math.min(30, companies.length * 3);

  const diversification: DiversificationMetrics = {
    industryCount: industryMap.size,
    effectiveNumberOfIndustries: round(effectiveN, 1),
    maxSingleExposure: round(concentration.top1, 1),
    maxIndustryExposure: round(byIndustry[0]?.percentage || 0, 1),
    diversificationScore: Math.min(100, Math.round(diversificationScore)),
  };

  // =========================================================================
  // ATTRIBUTION ANALYSIS
  // =========================================================================
  const totalReturn = netGain;

  const companyContributions = companies.map(c => {
    const gain = (c.status === 'exited' ? (c.exitValue || 0) : c.currentValue) - c.investmentAmount;
    const returnPct = safeDiv(gain, c.investmentAmount) * 100;
    return {
      company: c.name,
      contribution: gain,
      returnPercent: round(returnPct, 1),
    };
  }).sort((a, b) => b.contribution - a.contribution);

  const attribution: AttributionAnalysis = {
    totalReturn: round(totalReturn),
    components: [
      { name: 'Realized Gains', contribution: round(totalRealized - exitedCompanies.reduce((s, c) => s + c.investmentAmount, 0)), percentage: 0 },
      { name: 'Unrealized Gains', contribution: round(totalUnrealized - activeCompanies.reduce((s, c) => s + c.investmentAmount, 0)), percentage: 0 },
    ].map(c => ({ ...c, percentage: round(safeDiv(c.contribution, totalReturn) * 100, 1) })),
    topContributors: companyContributions.slice(0, 5),
    bottomContributors: companyContributions.slice(-5).reverse(),
  };

  // =========================================================================
  // RISK METRICS
  // =========================================================================
  const volatility = 25; // Simplified assumption
  const riskFreeRate = 4;
  const expectedReturn = grossIRR;

  const sharpeRatio = safeDiv(expectedReturn - riskFreeRate, volatility);

  let concentrationRisk: PortfolioRiskMetrics['concentrationRisk'] = 'low';
  if (concentration.top1 > 30) concentrationRisk = 'high';
  else if (concentration.top1 > 20) concentrationRisk = 'moderate';

  const riskMetrics: PortfolioRiskMetrics = {
    portfolioVolatility: volatility,
    sharpeRatio: round(sharpeRatio, 2),
    sortinoRatio: round(sharpeRatio * 1.2, 2), // Simplified
    maxDrawdown: round(volatility * 2, 1),
    valueAtRisk95: round(totalValue * volatility / 100 * 1.645),
    valueAtRisk99: round(totalValue * volatility / 100 * 2.326),
    concentrationRisk,
    liquidityScore: round(Math.min(100, activeCompanies.length * 10 + 50)),
  };

  // =========================================================================
  // COMPANY PERFORMANCE
  // =========================================================================
  const companyPerformance: CompanyPerformance[] = companies.map(c => {
    const value = c.status === 'exited' ? (c.exitValue || 0) : c.currentValue;
    const moic = safeDiv(value, c.investmentAmount);
    const holdingPeriod = (new Date().getTime() - new Date(c.investmentDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    // Simplified IRR
    const irr = holdingPeriod > 0 ? (Math.pow(moic, 1 / holdingPeriod) - 1) * 100 : 0;

    return {
      id: c.id,
      name: c.name,
      industry: c.industry,
      invested: round(c.investmentAmount),
      currentValue: round(value),
      moic: round(moic, 2),
      irr: round(irr, 1),
      holdingPeriod: round(holdingPeriod, 1),
      status: c.status,
      weight: round(safeDiv(value, totalValue) * 100, 1),
      contribution: round(value - c.investmentAmount),
    };
  }).sort((a, b) => b.currentValue - a.currentValue);

  return {
    summary,
    performance,
    composition,
    diversification,
    attribution,
    riskMetrics,
    companies: companyPerformance,
  };
}

// ============================================================================
// PORTFOLIO OPTIMIZATION
// ============================================================================

export interface OptimizationConstraints {
  maxSinglePosition: number; // As percentage
  maxIndustryExposure: number;
  minPositions: number;
  maxPositions: number;
  targetReturn?: number;
  maxVolatility?: number;
}

export interface OptimizationResult {
  optimalWeights: { company: string; weight: number }[];
  expectedReturn: number;
  expectedVolatility: number;
  sharpeRatio: number;
  changes: { company: string; currentWeight: number; optimalWeight: number; change: number }[];
}

export function optimizePortfolio(
  portfolio: Portfolio,
  constraints: OptimizationConstraints
): OptimizationResult {
  const companies = portfolio.companies.filter(c => c.status === 'active');
  const n = companies.length;

  // Get current weights
  const totalValue = companies.reduce((sum, c) => sum + c.currentValue, 0);
  const currentWeights = companies.map(c => ({
    company: c.name,
    weight: safeDiv(c.currentValue, totalValue) * 100,
  }));

  // Simplified optimization: equal weight with constraints
  let targetWeight = 100 / n;
  targetWeight = Math.min(targetWeight, constraints.maxSinglePosition);

  const optimalWeights = companies.map(c => ({
    company: c.name,
    weight: round(targetWeight, 1),
  }));

  // Normalize weights
  const totalWeight = optimalWeights.reduce((sum, w) => sum + w.weight, 0);
  optimalWeights.forEach(w => w.weight = round((w.weight / totalWeight) * 100, 1));

  // Calculate changes
  const changes = currentWeights.map((cw, i) => ({
    company: cw.company,
    currentWeight: round(cw.weight, 1),
    optimalWeight: optimalWeights[i].weight,
    change: round(optimalWeights[i].weight - cw.weight, 1),
  }));

  // Expected metrics (simplified)
  const expectedReturn = 15; // Assumed
  const expectedVolatility = 25;
  const sharpeRatio = (expectedReturn - 4) / expectedVolatility;

  return {
    optimalWeights,
    expectedReturn,
    expectedVolatility,
    sharpeRatio: round(sharpeRatio, 2),
    changes: changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)),
  };
}

// ============================================================================
// PORTFOLIO FORMATTING
// ============================================================================

export function formatPortfolioSummary(result: PortfolioAnalysisResult): string {
  const lines: string[] = [];

  lines.push('=== PORTFOLIO SUMMARY ===');
  lines.push('');
  lines.push(`Total Invested: $${(result.summary.totalInvested / 1e6).toFixed(1)}M`);
  lines.push(`Total Value: $${((result.summary.totalRealized + result.summary.totalUnrealized) / 1e6).toFixed(1)}M`);
  lines.push(`Net Gain: $${(result.summary.netGain / 1e6).toFixed(1)}M`);
  lines.push('');
  lines.push('--- PERFORMANCE ---');
  lines.push(`Gross MOIC: ${result.performance.grossMOIC}x`);
  lines.push(`Gross IRR: ${result.performance.grossIRR}%`);
  lines.push(`TVPI: ${result.performance.tvpi}x`);
  lines.push(`DPI: ${result.performance.dpi}x`);
  lines.push('');
  lines.push('--- COMPOSITION ---');
  lines.push(`Active Companies: ${result.summary.activeCompanies}`);
  lines.push(`Exited: ${result.summary.exitedCompanies}`);
  lines.push(`Industries: ${result.diversification.industryCount}`);
  lines.push(`Top Concentration: ${result.composition.concentration.top1}%`);
  lines.push('');
  lines.push('--- RISK ---');
  lines.push(`Sharpe Ratio: ${result.riskMetrics.sharpeRatio}`);
  lines.push(`VaR (95%): $${(result.riskMetrics.valueAtRisk95 / 1e6).toFixed(1)}M`);
  lines.push(`Concentration Risk: ${result.riskMetrics.concentrationRisk}`);

  return lines.join('\n');
}
