/**
 * Leveraged Buyout (LBO) Modeling Module
 *
 * Professional-grade LBO analysis with:
 * - Purchase price analysis
 * - Debt structure optimization
 * - Returns analysis (IRR, MOIC)
 * - Exit scenario modeling
 * - Credit metrics tracking
 */

import { AnalysisSession } from '../schema';
import { ForecastResult, YearlyMetrics } from './forecast';

// ============================================================================
// TYPES
// ============================================================================

export interface LBOInputs {
  // Transaction
  purchasePrice: number;
  transactionFees: number; // % of purchase price
  managementRollover: number; // % of equity
  minimumCash: number;

  // Sources of Funds
  sources: DebtTranche[];
  sponsorEquity: number;

  // Exit
  exitYear: number;
  exitMultiple: number; // EV/EBITDA multiple

  // Operational Assumptions
  synergies?: {
    costSynergies: number;
    revenueSynergies: number;
    realizationYears: number;
  };
}

export interface DebtTranche {
  name: string;
  type: 'senior' | 'subordinated' | 'mezzanine' | 'revolving' | 'term_loan_a' | 'term_loan_b';
  amount: number;
  interestRate: number; // As percentage
  isFloating: boolean;
  spread?: number; // Spread over base rate for floating
  amortization: number; // Annual amortization as % of principal
  maturity: number; // Years
  originationFee?: number; // As percentage
  callProtection?: number; // Years of call protection
  prepaymentPenalty?: number; // As percentage
  covenants?: DebtCovenant[];
}

export interface DebtCovenant {
  type: 'leverage' | 'coverage' | 'fixed_charge' | 'capex' | 'minimum_ebitda';
  threshold: number;
  description: string;
}

export interface LBOResult {
  // Transaction Summary
  transactionSummary: TransactionSummary;

  // Sources & Uses
  sourcesAndUses: SourcesAndUses;

  // Pro Forma Projections
  projections: LBOProjection[];

  // Returns Analysis
  returns: ReturnsAnalysis;

  // Credit Analysis
  creditAnalysis: CreditAnalysis;

  // Exit Scenarios
  exitScenarios: ExitScenario[];

  // Sensitivity
  sensitivity: LBOSensitivity;
}

export interface TransactionSummary {
  purchasePrice: number;
  enterpriseValue: number;
  equityValue: number;
  entryMultiple: number;
  totalDebt: number;
  totalEquity: number;
  debtToEquity: number;
  debtToEbitda: number;
  equityContribution: number;
  fees: number;
}

export interface SourcesAndUses {
  sources: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  uses: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  totalSources: number;
  totalUses: number;
}

export interface LBOProjection {
  year: number;
  // Operating
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  capex: number;
  changeInNWC: number;
  freeCashFlow: number;

  // Debt
  beginningDebt: number;
  mandatoryAmortization: number;
  optionalPrepayment: number;
  endingDebt: number;
  interestExpense: number;
  cashInterest: number;

  // Returns
  cumulativeEquityValue: number;
  impliedEquityValue: number;
  moic: number;
  irr: number;

  // Credit Metrics
  leverageRatio: number;
  interestCoverage: number;
  debtServiceCoverage: number;
  fixedChargeCoverage: number;
}

export interface ReturnsAnalysis {
  holdingPeriod: number;
  entryEquity: number;
  exitEquity: number;
  grossMOIC: number;
  netMOIC: number;
  grossIRR: number;
  netIRR: number;
  returnAttribution: {
    ebitdaGrowth: number;
    multipleExpansion: number;
    debtPaydown: number;
    total: number;
  };
}

export interface CreditAnalysis {
  initialLeverage: number;
  exitLeverage: number;
  peakLeverage: number;
  debtPaydownTotal: number;
  debtPaydownPercent: number;
  averageInterestRate: number;
  covenantCompliance: {
    year: number;
    covenant: string;
    threshold: number;
    actual: number;
    compliant: boolean;
  }[];
}

export interface ExitScenario {
  name: string;
  exitYear: number;
  exitMultiple: number;
  enterpriseValue: number;
  netDebt: number;
  equityValue: number;
  moic: number;
  irr: number;
}

export interface LBOSensitivity {
  // Entry multiple sensitivity
  entryMultipleSensitivity: {
    multiple: number;
    irr: number;
    moic: number;
  }[];

  // Exit multiple sensitivity
  exitMultipleSensitivity: {
    multiple: number;
    irr: number;
    moic: number;
  }[];

  // EBITDA growth sensitivity
  ebitdaGrowthSensitivity: {
    growth: number;
    irr: number;
    moic: number;
  }[];

  // Leverage sensitivity
  leverageSensitivity: {
    leverage: number;
    irr: number;
    moic: number;
  }[];
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

function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 0.0001;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / discountFactor;
      if (t > 0) {
        derivative -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100; // Convert to percentage
    }

    if (derivative === 0) {
      return NaN;
    }

    rate = rate - npv / derivative;

    if (rate < -0.99) rate = -0.99;
    if (rate > 10) rate = 10;
  }

  return NaN;
}

// ============================================================================
// LBO ANALYSIS ENGINE
// ============================================================================

export function buildLBOModel(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  lboInputs: LBOInputs
): LBOResult {
  // Calculate entry EBITDA (from first year of forecast)
  const entryEbitda = forecast.yearly[0]?.ebit || 0;
  const entryMultiple = safeDiv(lboInputs.purchasePrice, entryEbitda);

  // =========================================================================
  // TRANSACTION SUMMARY
  // =========================================================================
  const totalDebt = lboInputs.sources.reduce((sum, s) => sum + s.amount, 0);
  const fees = lboInputs.purchasePrice * (lboInputs.transactionFees / 100);

  const transactionSummary: TransactionSummary = {
    purchasePrice: lboInputs.purchasePrice,
    enterpriseValue: lboInputs.purchasePrice,
    equityValue: lboInputs.purchasePrice - inputs.debtOutstanding,
    entryMultiple,
    totalDebt,
    totalEquity: lboInputs.sponsorEquity,
    debtToEquity: round(safeDiv(totalDebt, lboInputs.sponsorEquity), 2),
    debtToEbitda: round(safeDiv(totalDebt, entryEbitda), 1),
    equityContribution: lboInputs.sponsorEquity,
    fees,
  };

  // =========================================================================
  // SOURCES & USES
  // =========================================================================
  const sources: SourcesAndUses['sources'] = [
    ...lboInputs.sources.map(s => ({
      name: s.name,
      amount: s.amount,
      percentage: 0,
    })),
    {
      name: 'Sponsor Equity',
      amount: lboInputs.sponsorEquity,
      percentage: 0,
    },
    {
      name: 'Management Rollover',
      amount: lboInputs.sponsorEquity * (lboInputs.managementRollover / 100),
      percentage: 0,
    },
  ];

  const totalSources = sources.reduce((sum, s) => sum + s.amount, 0);
  sources.forEach(s => s.percentage = round((s.amount / totalSources) * 100, 1));

  const uses: SourcesAndUses['uses'] = [
    { name: 'Purchase Equity', amount: lboInputs.purchasePrice - inputs.debtOutstanding, percentage: 0 },
    { name: 'Refinance Existing Debt', amount: inputs.debtOutstanding, percentage: 0 },
    { name: 'Transaction Fees', amount: fees, percentage: 0 },
    { name: 'Financing Fees', amount: lboInputs.sources.reduce((sum, s) => sum + s.amount * ((s.originationFee || 0) / 100), 0), percentage: 0 },
    { name: 'Cash to Balance Sheet', amount: lboInputs.minimumCash, percentage: 0 },
  ];

  const totalUses = uses.reduce((sum, u) => sum + u.amount, 0);
  uses.forEach(u => u.percentage = round((u.amount / totalUses) * 100, 1));

  const sourcesAndUses: SourcesAndUses = {
    sources,
    uses,
    totalSources,
    totalUses,
  };

  // =========================================================================
  // PROJECTIONS
  // =========================================================================
  const projections: LBOProjection[] = [];
  let currentDebt = totalDebt;
  let cumulativeCashFlow = 0;

  forecast.yearly.slice(0, lboInputs.exitYear).forEach((yearData, index) => {
    const year = inputs.startYear + index;

    // Apply synergies if applicable
    let adjustedEbitda = yearData.ebit;
    if (lboInputs.synergies && index < lboInputs.synergies.realizationYears) {
      const synergyFactor = (index + 1) / lboInputs.synergies.realizationYears;
      adjustedEbitda += lboInputs.synergies.costSynergies * synergyFactor;
    }

    // Calculate debt service
    const weightedRate = safeDiv(
      lboInputs.sources.reduce((sum, s) => sum + s.amount * s.interestRate, 0),
      totalDebt
    ) / 100;

    const interestExpense = currentDebt * weightedRate;
    const mandatoryAmort = lboInputs.sources.reduce((sum, s) => {
      const trancheBalance = s.amount * (currentDebt / totalDebt);
      return sum + trancheBalance * (s.amortization / 100);
    }, 0);

    // Free cash flow
    const fcf = adjustedEbitda - interestExpense - inputs.annualCapex - (yearData.taxes || 0);
    const optionalPrepay = Math.max(0, fcf - mandatoryAmort);

    const endingDebt = Math.max(0, currentDebt - mandatoryAmort - optionalPrepay);

    // Calculate implied equity value at this point
    const impliedEV = adjustedEbitda * lboInputs.exitMultiple;
    const impliedEquity = impliedEV - endingDebt + lboInputs.minimumCash;

    // Calculate running returns
    cumulativeCashFlow += fcf;
    const moic = safeDiv(impliedEquity, lboInputs.sponsorEquity);

    // IRR calculation (simplified for this year)
    const cashFlows = [-lboInputs.sponsorEquity, ...Array(index).fill(0), impliedEquity];
    const irr = calculateIRR(cashFlows);

    projections.push({
      year,
      revenue: yearData.revenue,
      ebitda: round(adjustedEbitda),
      ebitdaMargin: round((adjustedEbitda / yearData.revenue) * 100, 1),
      capex: inputs.annualCapex,
      changeInNWC: 0, // Simplified
      freeCashFlow: round(fcf),
      beginningDebt: round(currentDebt),
      mandatoryAmortization: round(mandatoryAmort),
      optionalPrepayment: round(optionalPrepay),
      endingDebt: round(endingDebt),
      interestExpense: round(interestExpense),
      cashInterest: round(interestExpense),
      cumulativeEquityValue: round(cumulativeCashFlow + lboInputs.sponsorEquity),
      impliedEquityValue: round(impliedEquity),
      moic: round(moic, 2),
      irr: round(irr, 1),
      leverageRatio: round(safeDiv(endingDebt, adjustedEbitda), 1),
      interestCoverage: round(safeDiv(adjustedEbitda, interestExpense), 1),
      debtServiceCoverage: round(safeDiv(adjustedEbitda, interestExpense + mandatoryAmort), 1),
      fixedChargeCoverage: round(safeDiv(adjustedEbitda, interestExpense + mandatoryAmort + inputs.annualCapex), 1),
    });

    currentDebt = endingDebt;
  });

  // =========================================================================
  // RETURNS ANALYSIS
  // =========================================================================
  const exitProjection = projections[projections.length - 1];
  const exitEV = exitProjection.ebitda * lboInputs.exitMultiple;
  const exitEquity = exitEV - exitProjection.endingDebt + lboInputs.minimumCash;

  const cashFlowsForIRR = [-lboInputs.sponsorEquity];
  projections.slice(0, -1).forEach(() => cashFlowsForIRR.push(0));
  cashFlowsForIRR.push(exitEquity);

  const grossIRR = calculateIRR(cashFlowsForIRR);
  const grossMOIC = safeDiv(exitEquity, lboInputs.sponsorEquity);

  // Return attribution
  const entryEV = lboInputs.purchasePrice;
  const exitEbitda = exitProjection.ebitda;
  const ebitdaGrowthContribution = (exitEbitda - entryEbitda) * entryMultiple;
  const multipleExpansion = (lboInputs.exitMultiple - entryMultiple) * exitEbitda;
  const debtPaydown = totalDebt - exitProjection.endingDebt;

  const returns: ReturnsAnalysis = {
    holdingPeriod: lboInputs.exitYear,
    entryEquity: lboInputs.sponsorEquity,
    exitEquity: round(exitEquity),
    grossMOIC: round(grossMOIC, 2),
    netMOIC: round(grossMOIC * 0.8, 2), // Assuming 20% carry
    grossIRR: round(grossIRR, 1),
    netIRR: round(grossIRR * 0.8, 1),
    returnAttribution: {
      ebitdaGrowth: round(safeDiv(ebitdaGrowthContribution, lboInputs.sponsorEquity) * 100, 1),
      multipleExpansion: round(safeDiv(multipleExpansion, lboInputs.sponsorEquity) * 100, 1),
      debtPaydown: round(safeDiv(debtPaydown, lboInputs.sponsorEquity) * 100, 1),
      total: round((grossMOIC - 1) * 100, 1),
    },
  };

  // =========================================================================
  // CREDIT ANALYSIS
  // =========================================================================
  const leverageRatios = projections.map(p => p.leverageRatio);

  const creditAnalysis: CreditAnalysis = {
    initialLeverage: round(safeDiv(totalDebt, entryEbitda), 1),
    exitLeverage: exitProjection.leverageRatio,
    peakLeverage: Math.max(...leverageRatios),
    debtPaydownTotal: round(totalDebt - exitProjection.endingDebt),
    debtPaydownPercent: round(((totalDebt - exitProjection.endingDebt) / totalDebt) * 100, 1),
    averageInterestRate: round(safeDiv(
      lboInputs.sources.reduce((sum, s) => sum + s.amount * s.interestRate, 0),
      totalDebt
    ), 2),
    covenantCompliance: projections.flatMap(p => {
      const checks: CreditAnalysis['covenantCompliance'] = [];

      // Check leverage covenant (example: 6.0x)
      checks.push({
        year: p.year,
        covenant: 'Leverage Ratio',
        threshold: 6.0,
        actual: p.leverageRatio,
        compliant: p.leverageRatio <= 6.0,
      });

      // Check interest coverage (example: 2.0x)
      checks.push({
        year: p.year,
        covenant: 'Interest Coverage',
        threshold: 2.0,
        actual: p.interestCoverage,
        compliant: p.interestCoverage >= 2.0,
      });

      return checks;
    }),
  };

  // =========================================================================
  // EXIT SCENARIOS
  // =========================================================================
  const exitScenarios: ExitScenario[] = [];

  // Base case
  exitScenarios.push({
    name: 'Base Case',
    exitYear: lboInputs.exitYear,
    exitMultiple: lboInputs.exitMultiple,
    enterpriseValue: exitEV,
    netDebt: exitProjection.endingDebt,
    equityValue: exitEquity,
    moic: grossMOIC,
    irr: grossIRR,
  });

  // Upside case (higher multiple)
  const upsideMultiple = lboInputs.exitMultiple * 1.2;
  const upsideEV = exitProjection.ebitda * upsideMultiple;
  const upsideEquity = upsideEV - exitProjection.endingDebt + lboInputs.minimumCash;
  const upsideCashFlows = [-lboInputs.sponsorEquity, ...Array(lboInputs.exitYear - 1).fill(0), upsideEquity];

  exitScenarios.push({
    name: 'Upside',
    exitYear: lboInputs.exitYear,
    exitMultiple: upsideMultiple,
    enterpriseValue: upsideEV,
    netDebt: exitProjection.endingDebt,
    equityValue: upsideEquity,
    moic: round(safeDiv(upsideEquity, lboInputs.sponsorEquity), 2),
    irr: round(calculateIRR(upsideCashFlows), 1),
  });

  // Downside case (lower multiple)
  const downsideMultiple = lboInputs.exitMultiple * 0.8;
  const downsideEV = exitProjection.ebitda * downsideMultiple;
  const downsideEquity = Math.max(0, downsideEV - exitProjection.endingDebt + lboInputs.minimumCash);
  const downsideCashFlows = [-lboInputs.sponsorEquity, ...Array(lboInputs.exitYear - 1).fill(0), downsideEquity];

  exitScenarios.push({
    name: 'Downside',
    exitYear: lboInputs.exitYear,
    exitMultiple: downsideMultiple,
    enterpriseValue: downsideEV,
    netDebt: exitProjection.endingDebt,
    equityValue: downsideEquity,
    moic: round(safeDiv(downsideEquity, lboInputs.sponsorEquity), 2),
    irr: round(calculateIRR(downsideCashFlows), 1),
  });

  // Early exit
  if (lboInputs.exitYear > 3) {
    const earlyExitYear = 3;
    const earlyProjection = projections[earlyExitYear - 1];
    const earlyEV = earlyProjection.ebitda * lboInputs.exitMultiple;
    const earlyEquity = earlyEV - earlyProjection.endingDebt + lboInputs.minimumCash;
    const earlyCashFlows = [-lboInputs.sponsorEquity, ...Array(earlyExitYear - 1).fill(0), earlyEquity];

    exitScenarios.push({
      name: 'Early Exit (Year 3)',
      exitYear: earlyExitYear,
      exitMultiple: lboInputs.exitMultiple,
      enterpriseValue: earlyEV,
      netDebt: earlyProjection.endingDebt,
      equityValue: earlyEquity,
      moic: round(safeDiv(earlyEquity, lboInputs.sponsorEquity), 2),
      irr: round(calculateIRR(earlyCashFlows), 1),
    });
  }

  // =========================================================================
  // SENSITIVITY ANALYSIS
  // =========================================================================
  const sensitivity: LBOSensitivity = {
    entryMultipleSensitivity: [],
    exitMultipleSensitivity: [],
    ebitdaGrowthSensitivity: [],
    leverageSensitivity: [],
  };

  // Exit multiple sensitivity
  [0.6, 0.8, 1.0, 1.2, 1.4].forEach(factor => {
    const mult = lboInputs.exitMultiple * factor;
    const ev = exitProjection.ebitda * mult;
    const equity = Math.max(0, ev - exitProjection.endingDebt + lboInputs.minimumCash);
    const flows = [-lboInputs.sponsorEquity, ...Array(lboInputs.exitYear - 1).fill(0), equity];

    sensitivity.exitMultipleSensitivity.push({
      multiple: round(mult, 1),
      irr: round(calculateIRR(flows), 1),
      moic: round(safeDiv(equity, lboInputs.sponsorEquity), 2),
    });
  });

  // Entry multiple sensitivity
  [0.7, 0.85, 1.0, 1.15, 1.3].forEach(factor => {
    const adjustedPurchase = lboInputs.purchasePrice * factor;
    const adjustedEquity = lboInputs.sponsorEquity * factor;
    const equity = exitEV - exitProjection.endingDebt + lboInputs.minimumCash;
    const flows = [-adjustedEquity, ...Array(lboInputs.exitYear - 1).fill(0), equity];

    sensitivity.entryMultipleSensitivity.push({
      multiple: round(entryMultiple * factor, 1),
      irr: round(calculateIRR(flows), 1),
      moic: round(safeDiv(equity, adjustedEquity), 2),
    });
  });

  return {
    transactionSummary,
    sourcesAndUses,
    projections,
    returns,
    creditAnalysis,
    exitScenarios,
    sensitivity,
  };
}

// ============================================================================
// DEFAULT LBO INPUTS
// ============================================================================

export function createDefaultLBOInputs(
  purchasePrice: number,
  ebitda: number
): LBOInputs {
  const leverage = 5.0; // 5x EBITDA
  const totalDebt = ebitda * leverage;
  const equity = purchasePrice - totalDebt;

  return {
    purchasePrice,
    transactionFees: 2.5,
    managementRollover: 10,
    minimumCash: purchasePrice * 0.02,
    sources: [
      {
        name: 'Senior Term Loan A',
        type: 'term_loan_a',
        amount: totalDebt * 0.3,
        interestRate: 5.5,
        isFloating: true,
        spread: 2.5,
        amortization: 10,
        maturity: 5,
        originationFee: 1.0,
      },
      {
        name: 'Senior Term Loan B',
        type: 'term_loan_b',
        amount: totalDebt * 0.5,
        interestRate: 6.5,
        isFloating: true,
        spread: 3.5,
        amortization: 1,
        maturity: 7,
        originationFee: 1.0,
      },
      {
        name: 'Subordinated Notes',
        type: 'subordinated',
        amount: totalDebt * 0.2,
        interestRate: 9.0,
        isFloating: false,
        amortization: 0,
        maturity: 8,
        originationFee: 2.0,
      },
    ],
    sponsorEquity: equity > 0 ? equity : purchasePrice * 0.3,
    exitYear: 5,
    exitMultiple: purchasePrice / ebitda,
  };
}

// ============================================================================
// SUMMARY FORMATTERS
// ============================================================================

export function formatLBOSummary(result: LBOResult): string {
  const lines: string[] = [];

  lines.push('=== LBO ANALYSIS SUMMARY ===');
  lines.push('');
  lines.push(`Purchase Price: $${(result.transactionSummary.purchasePrice / 1e6).toFixed(1)}M`);
  lines.push(`Entry Multiple: ${result.transactionSummary.entryMultiple.toFixed(1)}x EBITDA`);
  lines.push(`Total Debt: $${(result.transactionSummary.totalDebt / 1e6).toFixed(1)}M (${result.transactionSummary.debtToEbitda.toFixed(1)}x)`);
  lines.push(`Equity: $${(result.transactionSummary.totalEquity / 1e6).toFixed(1)}M`);
  lines.push('');
  lines.push('--- RETURNS ---');
  lines.push(`Holding Period: ${result.returns.holdingPeriod} years`);
  lines.push(`Gross IRR: ${result.returns.grossIRR.toFixed(1)}%`);
  lines.push(`Gross MOIC: ${result.returns.grossMOIC.toFixed(2)}x`);
  lines.push('');
  lines.push('--- RETURN ATTRIBUTION ---');
  lines.push(`EBITDA Growth: ${result.returns.returnAttribution.ebitdaGrowth.toFixed(1)}%`);
  lines.push(`Multiple Expansion: ${result.returns.returnAttribution.multipleExpansion.toFixed(1)}%`);
  lines.push(`Debt Paydown: ${result.returns.returnAttribution.debtPaydown.toFixed(1)}%`);
  lines.push('');
  lines.push('--- CREDIT METRICS ---');
  lines.push(`Entry Leverage: ${result.creditAnalysis.initialLeverage.toFixed(1)}x`);
  lines.push(`Exit Leverage: ${result.creditAnalysis.exitLeverage.toFixed(1)}x`);
  lines.push(`Debt Paydown: ${result.creditAnalysis.debtPaydownPercent.toFixed(0)}%`);

  return lines.join('\n');
}
