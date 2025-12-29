/**
 * Risk Scoring Engine
 *
 * Multi-dimensional risk assessment for financial analysis
 * Quantifies business, financial, and operational risks
 */

import { getIndustryById } from './industries';

// ============================================================================
// TYPES
// ============================================================================

export type RiskLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';

export interface RiskScore {
  overall: number;           // 0-100 (higher = more risky)
  level: RiskLevel;
  grade: string;             // AAA to D
  components: RiskComponent[];
  topRisks: RiskFactor[];
  mitigatingFactors: string[];
  summary: string;
}

export interface RiskComponent {
  name: string;
  category: 'business' | 'financial' | 'operational' | 'market' | 'execution';
  score: number;             // 0-100
  weight: number;
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  score: number;             // 0-100
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'unlikely' | 'possible' | 'likely' | 'very-likely';
}

export interface RiskInputs {
  // Company Characteristics
  industryId?: string;
  companyAge?: number;       // Years
  employeeCount?: number;
  isPublic?: boolean;

  // Financial Metrics
  revenue?: number;
  revenueGrowth?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;

  // Balance Sheet
  debtToEquity?: number;
  currentRatio?: number;
  cashToDebt?: number;
  interestCoverage?: number;

  // Cash Flow
  freeCashFlowMargin?: number;
  cashBurnRate?: number;     // Months of runway

  // Business Model
  customerConcentration?: number;  // % from top customer
  revenueRecurring?: number;       // % recurring revenue
  geographicConcentration?: number; // % from single geography

  // Projections
  projectedGrowth?: number;
  terminalGrowthRate?: number;
  discountRate?: number;
}

// ============================================================================
// RISK SCORING FUNCTIONS
// ============================================================================

function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'very-low';
  if (score <= 40) return 'low';
  if (score <= 60) return 'moderate';
  if (score <= 80) return 'high';
  return 'very-high';
}

function scoreToGrade(score: number): string {
  if (score <= 10) return 'AAA';
  if (score <= 20) return 'AA';
  if (score <= 30) return 'A';
  if (score <= 40) return 'BBB';
  if (score <= 50) return 'BB';
  if (score <= 60) return 'B';
  if (score <= 75) return 'CCC';
  if (score <= 85) return 'CC';
  if (score <= 95) return 'C';
  return 'D';
}

function calculateImpact(score: number): RiskFactor['impact'] {
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

function calculateLikelihood(score: number): RiskFactor['likelihood'] {
  if (score <= 25) return 'unlikely';
  if (score <= 50) return 'possible';
  if (score <= 75) return 'likely';
  return 'very-likely';
}

// ============================================================================
// RISK ASSESSMENT ENGINE
// ============================================================================

export function calculateRiskScore(inputs: RiskInputs): RiskScore {
  const components: RiskComponent[] = [];
  const mitigatingFactors: string[] = [];

  // =========================================================================
  // BUSINESS RISK (25%)
  // =========================================================================
  const businessFactors: RiskFactor[] = [];

  // Industry Risk
  if (inputs.industryId) {
    const industry = getIndustryById(inputs.industryId);
    if (industry) {
      // Cyclical industries are riskier
      const cyclicalIndustries = ['oil-integrated', 'oil-exploration', 'airlines', 'homebuilders', 'automotive-retail', 'hotels'];
      const isCyclical = cyclicalIndustries.includes(inputs.industryId);
      const industryRisk = isCyclical ? 65 : 35;

      businessFactors.push({
        name: 'Industry Cyclicality',
        score: industryRisk,
        description: isCyclical
          ? 'Operates in a cyclical industry with volatile demand'
          : 'Industry has relatively stable demand patterns',
        impact: calculateImpact(industryRisk),
        likelihood: calculateLikelihood(industryRisk),
      });

      if (!isCyclical) mitigatingFactors.push('Operates in non-cyclical industry');
    }
  }

  // Company Age Risk
  if (inputs.companyAge !== undefined) {
    let ageRisk: number;
    if (inputs.companyAge < 2) ageRisk = 85;
    else if (inputs.companyAge < 5) ageRisk = 65;
    else if (inputs.companyAge < 10) ageRisk = 40;
    else ageRisk = 25;

    businessFactors.push({
      name: 'Company Maturity',
      score: ageRisk,
      description: inputs.companyAge < 5
        ? 'Young company with limited operating history'
        : 'Established company with proven track record',
      impact: calculateImpact(ageRisk),
      likelihood: calculateLikelihood(ageRisk),
    });

    if (inputs.companyAge >= 10) mitigatingFactors.push('Long operating history (10+ years)');
  }

  // Customer Concentration Risk
  if (inputs.customerConcentration !== undefined) {
    let concRisk: number;
    if (inputs.customerConcentration > 50) concRisk = 90;
    else if (inputs.customerConcentration > 30) concRisk = 70;
    else if (inputs.customerConcentration > 15) concRisk = 45;
    else concRisk = 20;

    businessFactors.push({
      name: 'Customer Concentration',
      score: concRisk,
      description: inputs.customerConcentration > 30
        ? `High customer concentration (${inputs.customerConcentration}% from top customer)`
        : 'Diversified customer base',
      impact: calculateImpact(concRisk),
      likelihood: inputs.customerConcentration > 30 ? 'likely' : 'possible',
    });

    if (inputs.customerConcentration < 15) mitigatingFactors.push('Diversified customer base');
  }

  // Revenue Model Risk
  if (inputs.revenueRecurring !== undefined) {
    const recurringRisk = Math.max(0, 80 - inputs.revenueRecurring);

    businessFactors.push({
      name: 'Revenue Predictability',
      score: recurringRisk,
      description: inputs.revenueRecurring > 70
        ? 'High recurring revenue provides visibility'
        : 'Limited recurring revenue creates uncertainty',
      impact: calculateImpact(recurringRisk),
      likelihood: calculateLikelihood(recurringRisk),
    });

    if (inputs.revenueRecurring > 70) mitigatingFactors.push('Strong recurring revenue base');
  }

  const businessScore = businessFactors.length > 0
    ? businessFactors.reduce((sum, f) => sum + f.score, 0) / businessFactors.length
    : 50;

  components.push({
    name: 'Business Risk',
    category: 'business',
    score: businessScore,
    weight: 0.25,
    factors: businessFactors,
  });

  // =========================================================================
  // FINANCIAL RISK (30%)
  // =========================================================================
  const financialFactors: RiskFactor[] = [];

  // Leverage Risk
  if (inputs.debtToEquity !== undefined) {
    let leverageRisk: number;
    if (inputs.debtToEquity > 3) leverageRisk = 90;
    else if (inputs.debtToEquity > 2) leverageRisk = 75;
    else if (inputs.debtToEquity > 1) leverageRisk = 50;
    else if (inputs.debtToEquity > 0.5) leverageRisk = 30;
    else leverageRisk = 15;

    financialFactors.push({
      name: 'Leverage',
      score: leverageRisk,
      description: inputs.debtToEquity > 2
        ? `High leverage (${inputs.debtToEquity.toFixed(1)}x D/E) increases default risk`
        : 'Conservative capital structure',
      impact: calculateImpact(leverageRisk),
      likelihood: calculateLikelihood(leverageRisk),
    });

    if (inputs.debtToEquity < 0.5) mitigatingFactors.push('Low leverage');
  }

  // Liquidity Risk
  if (inputs.currentRatio !== undefined) {
    let liquidityRisk: number;
    if (inputs.currentRatio < 0.5) liquidityRisk = 95;
    else if (inputs.currentRatio < 1) liquidityRisk = 75;
    else if (inputs.currentRatio < 1.5) liquidityRisk = 45;
    else liquidityRisk = 20;

    financialFactors.push({
      name: 'Liquidity',
      score: liquidityRisk,
      description: inputs.currentRatio < 1
        ? 'Current ratio below 1x indicates liquidity stress'
        : 'Adequate liquidity position',
      impact: calculateImpact(liquidityRisk),
      likelihood: calculateLikelihood(liquidityRisk),
    });

    if (inputs.currentRatio >= 2) mitigatingFactors.push('Strong liquidity position');
  }

  // Interest Coverage Risk
  if (inputs.interestCoverage !== undefined) {
    let coverageRisk: number;
    if (inputs.interestCoverage < 1) coverageRisk = 95;
    else if (inputs.interestCoverage < 2) coverageRisk = 80;
    else if (inputs.interestCoverage < 4) coverageRisk = 50;
    else if (inputs.interestCoverage < 8) coverageRisk = 25;
    else coverageRisk = 10;

    financialFactors.push({
      name: 'Debt Service',
      score: coverageRisk,
      description: inputs.interestCoverage < 2
        ? 'Low interest coverage creates debt service risk'
        : 'Comfortable debt service capacity',
      impact: calculateImpact(coverageRisk),
      likelihood: calculateLikelihood(coverageRisk),
    });

    if (inputs.interestCoverage >= 8) mitigatingFactors.push('Strong interest coverage');
  }

  // Profitability Risk
  if (inputs.operatingMargin !== undefined) {
    let profitRisk: number;
    if (inputs.operatingMargin < -20) profitRisk = 90;
    else if (inputs.operatingMargin < 0) profitRisk = 70;
    else if (inputs.operatingMargin < 5) profitRisk = 50;
    else if (inputs.operatingMargin < 15) profitRisk = 30;
    else profitRisk = 15;

    financialFactors.push({
      name: 'Profitability',
      score: profitRisk,
      description: inputs.operatingMargin < 0
        ? 'Negative operating margin indicates unsustainable operations'
        : 'Profitable operations',
      impact: calculateImpact(profitRisk),
      likelihood: calculateLikelihood(profitRisk),
    });

    if (inputs.operatingMargin >= 15) mitigatingFactors.push('Strong operating margins');
  }

  // Cash Flow Risk
  if (inputs.freeCashFlowMargin !== undefined) {
    let fcfRisk: number;
    if (inputs.freeCashFlowMargin < -20) fcfRisk = 85;
    else if (inputs.freeCashFlowMargin < 0) fcfRisk = 65;
    else if (inputs.freeCashFlowMargin < 5) fcfRisk = 40;
    else fcfRisk = 20;

    financialFactors.push({
      name: 'Cash Generation',
      score: fcfRisk,
      description: inputs.freeCashFlowMargin < 0
        ? 'Negative free cash flow requires external funding'
        : 'Generating free cash flow',
      impact: calculateImpact(fcfRisk),
      likelihood: calculateLikelihood(fcfRisk),
    });

    if (inputs.freeCashFlowMargin >= 10) mitigatingFactors.push('Strong free cash flow generation');
  }

  // Cash Runway Risk
  if (inputs.cashBurnRate !== undefined && inputs.freeCashFlowMargin !== undefined && inputs.freeCashFlowMargin < 0) {
    let runwayRisk: number;
    if (inputs.cashBurnRate < 6) runwayRisk = 95;
    else if (inputs.cashBurnRate < 12) runwayRisk = 75;
    else if (inputs.cashBurnRate < 24) runwayRisk = 50;
    else runwayRisk = 25;

    financialFactors.push({
      name: 'Cash Runway',
      score: runwayRisk,
      description: inputs.cashBurnRate < 12
        ? `Limited runway (${inputs.cashBurnRate} months) creates funding risk`
        : 'Sufficient runway to reach milestones',
      impact: 'critical',
      likelihood: inputs.cashBurnRate < 12 ? 'very-likely' : 'possible',
    });

    if (inputs.cashBurnRate >= 24) mitigatingFactors.push('Extended cash runway (24+ months)');
  }

  const financialScore = financialFactors.length > 0
    ? financialFactors.reduce((sum, f) => sum + f.score, 0) / financialFactors.length
    : 50;

  components.push({
    name: 'Financial Risk',
    category: 'financial',
    score: financialScore,
    weight: 0.30,
    factors: financialFactors,
  });

  // =========================================================================
  // OPERATIONAL RISK (20%)
  // =========================================================================
  const operationalFactors: RiskFactor[] = [];

  // Scale Risk
  if (inputs.employeeCount !== undefined) {
    let scaleRisk: number;
    if (inputs.employeeCount < 10) scaleRisk = 75;
    else if (inputs.employeeCount < 50) scaleRisk = 55;
    else if (inputs.employeeCount < 200) scaleRisk = 35;
    else scaleRisk = 20;

    operationalFactors.push({
      name: 'Operational Scale',
      score: scaleRisk,
      description: inputs.employeeCount < 50
        ? 'Small team creates key person and capacity risk'
        : 'Sufficient scale for operational resilience',
      impact: calculateImpact(scaleRisk),
      likelihood: calculateLikelihood(scaleRisk),
    });

    if (inputs.employeeCount >= 200) mitigatingFactors.push('Scaled operations with depth');
  }

  // Geographic Risk
  if (inputs.geographicConcentration !== undefined) {
    let geoRisk: number;
    if (inputs.geographicConcentration > 90) geoRisk = 60;
    else if (inputs.geographicConcentration > 70) geoRisk = 40;
    else geoRisk = 20;

    operationalFactors.push({
      name: 'Geographic Concentration',
      score: geoRisk,
      description: inputs.geographicConcentration > 70
        ? 'Concentrated in single geography'
        : 'Geographic diversification',
      impact: calculateImpact(geoRisk),
      likelihood: 'possible',
    });

    if (inputs.geographicConcentration < 50) mitigatingFactors.push('Geographically diversified');
  }

  // Margin Stability
  if (inputs.grossMargin !== undefined) {
    let marginRisk: number;
    if (inputs.grossMargin < 20) marginRisk = 70;
    else if (inputs.grossMargin < 35) marginRisk = 50;
    else if (inputs.grossMargin < 50) marginRisk = 30;
    else marginRisk = 15;

    operationalFactors.push({
      name: 'Margin Vulnerability',
      score: marginRisk,
      description: inputs.grossMargin < 35
        ? 'Low margins leave little room for error'
        : 'Healthy margins provide buffer',
      impact: calculateImpact(marginRisk),
      likelihood: calculateLikelihood(marginRisk),
    });

    if (inputs.grossMargin >= 60) mitigatingFactors.push('High gross margins');
  }

  const operationalScore = operationalFactors.length > 0
    ? operationalFactors.reduce((sum, f) => sum + f.score, 0) / operationalFactors.length
    : 50;

  components.push({
    name: 'Operational Risk',
    category: 'operational',
    score: operationalScore,
    weight: 0.20,
    factors: operationalFactors,
  });

  // =========================================================================
  // EXECUTION RISK (25%)
  // =========================================================================
  const executionFactors: RiskFactor[] = [];

  // Growth Execution Risk
  if (inputs.projectedGrowth !== undefined) {
    let growthRisk: number;
    if (inputs.projectedGrowth > 100) growthRisk = 85;
    else if (inputs.projectedGrowth > 50) growthRisk = 65;
    else if (inputs.projectedGrowth > 25) growthRisk = 40;
    else growthRisk = 25;

    executionFactors.push({
      name: 'Growth Execution',
      score: growthRisk,
      description: inputs.projectedGrowth > 50
        ? `Aggressive growth targets (${inputs.projectedGrowth}%) carry execution risk`
        : 'Achievable growth targets',
      impact: calculateImpact(growthRisk),
      likelihood: inputs.projectedGrowth > 50 ? 'likely' : 'possible',
    });

    if (inputs.projectedGrowth < 20) mitigatingFactors.push('Conservative growth projections');
  }

  // Assumption Risk (Terminal Value)
  if (inputs.terminalGrowthRate !== undefined) {
    let terminalRisk: number;
    if (inputs.terminalGrowthRate > 4) terminalRisk = 75;
    else if (inputs.terminalGrowthRate > 3) terminalRisk = 50;
    else terminalRisk = 25;

    executionFactors.push({
      name: 'Terminal Value Assumptions',
      score: terminalRisk,
      description: inputs.terminalGrowthRate > 3
        ? 'Aggressive terminal growth assumptions'
        : 'Conservative long-term assumptions',
      impact: calculateImpact(terminalRisk),
      likelihood: 'possible',
    });

    if (inputs.terminalGrowthRate <= 2.5) mitigatingFactors.push('Conservative terminal growth rate');
  }

  // Discount Rate Adequacy
  if (inputs.discountRate !== undefined) {
    let discountRisk: number;
    if (inputs.discountRate < 8) discountRisk = 70;
    else if (inputs.discountRate < 10) discountRisk = 45;
    else if (inputs.discountRate < 15) discountRisk = 25;
    else discountRisk = 15;

    executionFactors.push({
      name: 'Risk Premium Adequacy',
      score: discountRisk,
      description: inputs.discountRate < 10
        ? 'Low discount rate may understate risk'
        : 'Discount rate reflects risk level',
      impact: calculateImpact(discountRisk),
      likelihood: 'possible',
    });

    if (inputs.discountRate >= 15) mitigatingFactors.push('Conservative discount rate used');
  }

  const executionScore = executionFactors.length > 0
    ? executionFactors.reduce((sum, f) => sum + f.score, 0) / executionFactors.length
    : 50;

  components.push({
    name: 'Execution Risk',
    category: 'execution',
    score: executionScore,
    weight: 0.25,
    factors: executionFactors,
  });

  // =========================================================================
  // CALCULATE OVERALL RISK
  // =========================================================================
  const overall = components.reduce((sum, c) => sum + c.score * c.weight, 0);
  const level = scoreToRiskLevel(overall);
  const grade = scoreToGrade(overall);

  // Get top risks
  const allFactors = components.flatMap(c => c.factors);
  const topRisks = allFactors
    .filter(f => f.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Generate summary
  let summary: string;
  if (overall <= 30) {
    summary = 'Low overall risk profile. Strong fundamentals across key dimensions.';
  } else if (overall <= 50) {
    summary = 'Moderate risk profile. Some areas require monitoring.';
  } else if (overall <= 70) {
    summary = 'Elevated risk profile. Multiple risk factors present.';
  } else {
    summary = 'High risk profile. Significant concerns across multiple dimensions.';
  }

  return {
    overall: Math.round(overall),
    level,
    grade,
    components,
    topRisks,
    mitigatingFactors,
    summary,
  };
}

// ============================================================================
// VALUE AT RISK (VaR) CALCULATION
// ============================================================================

export interface VaRResult {
  var95: number;             // 95% VaR
  var99: number;             // 99% VaR
  expectedShortfall: number; // CVaR / Expected Shortfall
  interpretation: string;
}

export function calculateValueAtRisk(
  baseValue: number,
  volatility: number,        // Annual volatility as decimal (e.g., 0.25 for 25%)
  confidenceLevels: number[] = [0.95, 0.99]
): VaRResult {
  // Z-scores for confidence levels
  const zScores: Record<number, number> = {
    0.90: 1.282,
    0.95: 1.645,
    0.99: 2.326,
  };

  const var95 = baseValue * volatility * (zScores[0.95] || 1.645);
  const var99 = baseValue * volatility * (zScores[0.99] || 2.326);

  // Expected Shortfall (CVaR) approximation
  const expectedShortfall = var95 * 1.25;

  return {
    var95,
    var99,
    expectedShortfall,
    interpretation: `At 95% confidence, maximum loss is $${var95.toLocaleString()}. At 99% confidence, maximum loss is $${var99.toLocaleString()}.`,
  };
}
