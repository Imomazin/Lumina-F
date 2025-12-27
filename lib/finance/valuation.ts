import { AnalysisSession } from "../schema";
import { ForecastResult, YearlyMetrics } from "./forecast";

// ============================================================================
// TYPES
// ============================================================================

export interface WACCInputs {
  costOfEquity: number; // As decimal (e.g., 0.12 for 12%)
  costOfDebt: number; // As decimal
  taxRate: number; // As decimal
  equityWeight: number; // As decimal
  debtWeight: number; // As decimal
}

export interface DCFResult {
  wacc: number;
  terminalValue: number;
  terminalValuePV: number;
  fcfProjections: number[];
  fcfPVs: number[];
  enterpriseValue: number;
  equityValue: number;
  impliedMultiples: {
    evToRevenue: number;
    evToEbitda: number;
    priceToEarnings: number;
  };
}

export interface DuPontAnalysis {
  netProfitMargin: number;
  assetTurnover: number;
  equityMultiplier: number;
  roe: number;
  roeFiveWay?: {
    taxBurden: number;
    interestBurden: number;
    operatingMargin: number;
    assetTurnover: number;
    leverage: number;
  };
}

export interface LeverageMetrics {
  degreeOfOperatingLeverage: number;
  degreeOfFinancialLeverage: number;
  degreeCombinedLeverage: number;
  interestCoverage: number;
  debtToEquity: number;
  debtToEbitda: number;
}

export interface EfficiencyMetrics {
  assetTurnover: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  cashConversionCycle: number;
  workingCapitalRatio: number;
}

export interface ValuationMetrics {
  dcf: DCFResult;
  duPont: DuPontAnalysis;
  leverage: LeverageMetrics;
  efficiency: EfficiencyMetrics;
  returnMetrics: {
    roa: number;
    roe: number;
    roic: number;
    roce: number;
  };
  eva: number; // Economic Value Added
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function round(n: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

function safeDivide(num: number, den: number, fallback: number = 0): number {
  return den === 0 ? fallback : num / den;
}

// ============================================================================
// WACC CALCULATION
// ============================================================================

export function calculateWACC(inputs: WACCInputs): number {
  const { costOfEquity, costOfDebt, taxRate, equityWeight, debtWeight } = inputs;

  // WACC = (E/V × Re) + (D/V × Rd × (1 - Tc))
  const wacc = (equityWeight * costOfEquity) + (debtWeight * costOfDebt * (1 - taxRate));
  return round(wacc, 4);
}

/**
 * Estimate cost of equity using CAPM
 * Re = Rf + β(Rm - Rf)
 */
export function estimateCostOfEquity(
  riskFreeRate: number = 0.04, // 4%
  marketPremium: number = 0.055, // 5.5%
  beta: number = 1.0
): number {
  return round(riskFreeRate + beta * marketPremium, 4);
}

// ============================================================================
// DCF VALUATION
// ============================================================================

export function calculateDCF(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  assumptions: {
    wacc?: number;
    terminalGrowthRate?: number;
    equityValue?: number;
    totalDebt?: number;
  } = {}
): DCFResult {
  const {
    wacc = 0.10, // 10% default WACC
    terminalGrowthRate = 0.025, // 2.5% perpetual growth
    equityValue = inputs.currentRevenue * 2, // Rough estimate
    totalDebt = inputs.debtOutstanding,
  } = assumptions;

  const yearly = forecast.yearly;
  const annualCapex = inputs.annualCapex;

  // Calculate Free Cash Flow to Firm (FCFF) for each year
  // FCFF = EBIT(1-t) + D&A - CapEx - ΔWC
  // Simplified: FCFF ≈ NetIncome + Interest(1-t) - CapEx
  const taxRate = inputs.taxRatePct / 100;

  const fcfProjections = yearly.map((y) => {
    // FCFF = EBIT × (1 - Tax Rate) - CapEx
    // Since we don't have D&A, using simplified approach
    const nopat = y.ebit * (1 - taxRate);
    const fcf = nopat - annualCapex;
    return round(fcf);
  });

  // Calculate PV of each FCF
  const fcfPVs = fcfProjections.map((fcf, i) => {
    const discountFactor = Math.pow(1 + wacc, i + 1);
    return round(fcf / discountFactor);
  });

  // Terminal Value using Gordon Growth Model
  // TV = FCF_n × (1 + g) / (WACC - g)
  const lastFCF = fcfProjections[fcfProjections.length - 1] || 0;
  const terminalValue = round(
    (lastFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate)
  );

  // PV of Terminal Value
  const n = yearly.length;
  const terminalValuePV = round(terminalValue / Math.pow(1 + wacc, n));

  // Enterprise Value = Sum of PV(FCF) + PV(TV)
  const sumFCFPV = fcfPVs.reduce((a, b) => a + b, 0);
  const enterpriseValue = round(sumFCFPV + terminalValuePV);

  // Equity Value = EV - Net Debt
  const equityValueCalc = round(enterpriseValue - totalDebt);

  // Implied Multiples
  const totalRevenue = yearly.reduce((sum, y) => sum + y.revenue, 0) / yearly.length;
  const totalEbitda = yearly.reduce((sum, y) => sum + y.ebit, 0) / yearly.length; // Using EBIT as proxy
  const totalEarnings = yearly.reduce((sum, y) => sum + y.netIncome, 0) / yearly.length;

  const impliedMultiples = {
    evToRevenue: round(safeDivide(enterpriseValue, totalRevenue), 2),
    evToEbitda: round(safeDivide(enterpriseValue, totalEbitda), 2),
    priceToEarnings: round(safeDivide(equityValueCalc, totalEarnings), 2),
  };

  return {
    wacc: round(wacc * 100, 2), // Convert to percentage
    terminalValue,
    terminalValuePV,
    fcfProjections,
    fcfPVs,
    enterpriseValue,
    equityValue: equityValueCalc,
    impliedMultiples,
  };
}

// ============================================================================
// DUPONT ANALYSIS
// ============================================================================

export function calculateDuPont(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  assumptions: {
    totalAssets?: number;
    totalEquity?: number;
  } = {}
): DuPontAnalysis {
  const yearly = forecast.yearly;
  if (yearly.length === 0) {
    return {
      netProfitMargin: 0,
      assetTurnover: 0,
      equityMultiplier: 0,
      roe: 0,
    };
  }

  // Use averages from forecast
  const avgRevenue = yearly.reduce((s, y) => s + y.revenue, 0) / yearly.length;
  const avgNetIncome = yearly.reduce((s, y) => s + y.netIncome, 0) / yearly.length;
  const avgEbit = yearly.reduce((s, y) => s + y.ebit, 0) / yearly.length;
  const avgEbt = yearly.reduce((s, y) => s + y.ebt, 0) / yearly.length;

  // Estimate assets and equity if not provided
  const totalAssets = assumptions.totalAssets ?? inputs.currentRevenue * 1.5;
  const totalEquity = assumptions.totalEquity ?? (totalAssets - inputs.debtOutstanding);

  // 3-Way DuPont
  const netProfitMargin = round(safeDivide(avgNetIncome, avgRevenue) * 100, 2);
  const assetTurnover = round(safeDivide(avgRevenue, totalAssets), 2);
  const equityMultiplier = round(safeDivide(totalAssets, totalEquity), 2);
  const roe = round((netProfitMargin / 100) * assetTurnover * equityMultiplier * 100, 2);

  // 5-Way DuPont
  const taxBurden = round(safeDivide(avgNetIncome, avgEbt), 4);
  const interestBurden = round(safeDivide(avgEbt, avgEbit), 4);
  const operatingMargin = round(safeDivide(avgEbit, avgRevenue), 4);

  return {
    netProfitMargin,
    assetTurnover,
    equityMultiplier,
    roe,
    roeFiveWay: {
      taxBurden,
      interestBurden,
      operatingMargin,
      assetTurnover,
      leverage: equityMultiplier,
    },
  };
}

// ============================================================================
// LEVERAGE METRICS
// ============================================================================

export function calculateLeverage(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  assumptions: {
    totalEquity?: number;
    fixedCosts?: number;
  } = {}
): LeverageMetrics {
  const yearly = forecast.yearly;
  if (yearly.length === 0) {
    return {
      degreeOfOperatingLeverage: 0,
      degreeOfFinancialLeverage: 0,
      degreeCombinedLeverage: 0,
      interestCoverage: 0,
      debtToEquity: 0,
      debtToEbitda: 0,
    };
  }

  const avgEbit = yearly.reduce((s, y) => s + y.ebit, 0) / yearly.length;
  const avgInterest = yearly.reduce((s, y) => s + y.interest, 0) / yearly.length;
  const avgRevenue = yearly.reduce((s, y) => s + y.revenue, 0) / yearly.length;
  const avgCogs = yearly.reduce((s, y) => s + y.cogs, 0) / yearly.length;

  // Estimate contribution margin (Revenue - Variable Costs)
  // Assume 70% of COGS is variable
  const variableCosts = avgCogs * 0.7;
  const contributionMargin = avgRevenue - variableCosts;

  // DOL = Contribution Margin / EBIT
  const dol = round(safeDivide(contributionMargin, avgEbit), 2);

  // DFL = EBIT / (EBIT - Interest)
  const ebitMinusInterest = avgEbit - avgInterest;
  const dfl = round(safeDivide(avgEbit, ebitMinusInterest), 2);

  // DCL = DOL × DFL
  const dcl = round(dol * dfl, 2);

  // Interest Coverage = EBIT / Interest
  const interestCoverage = round(safeDivide(avgEbit, avgInterest), 2);

  // Debt ratios
  const totalEquity = assumptions.totalEquity ?? (inputs.currentRevenue * 1.5 - inputs.debtOutstanding);
  const debtToEquity = round(safeDivide(inputs.debtOutstanding, totalEquity), 2);
  const debtToEbitda = round(safeDivide(inputs.debtOutstanding, avgEbit), 2);

  return {
    degreeOfOperatingLeverage: dol,
    degreeOfFinancialLeverage: dfl,
    degreeCombinedLeverage: dcl,
    interestCoverage,
    debtToEquity,
    debtToEbitda,
  };
}

// ============================================================================
// EFFICIENCY METRICS
// ============================================================================

export function calculateEfficiency(
  inputs: AnalysisSession,
  forecast: ForecastResult
): EfficiencyMetrics {
  const yearly = forecast.yearly;
  if (yearly.length === 0) {
    return {
      assetTurnover: 0,
      receivablesTurnover: 0,
      payablesTurnover: 0,
      inventoryTurnover: 0,
      cashConversionCycle: 0,
      workingCapitalRatio: 0,
    };
  }

  const avgRevenue = yearly.reduce((s, y) => s + y.revenue, 0) / yearly.length;
  const avgCogs = yearly.reduce((s, y) => s + y.cogs, 0) / yearly.length;

  // Use days from inputs or defaults
  const daysReceivable = inputs.daysReceivable ?? 30;
  const daysPayable = inputs.daysPayable ?? 30;
  const daysInventory = inputs.daysInventory ?? 45;

  // Calculate turnover ratios from days
  const receivablesTurnover = round(365 / daysReceivable, 2);
  const payablesTurnover = round(365 / daysPayable, 2);
  const inventoryTurnover = round(365 / daysInventory, 2);

  // Cash Conversion Cycle = DSO + DIO - DPO
  const cashConversionCycle = round(daysReceivable + daysInventory - daysPayable);

  // Estimate asset turnover
  const totalAssets = inputs.currentRevenue * 1.5;
  const assetTurnover = round(safeDivide(avgRevenue, totalAssets), 2);

  // Working capital ratio estimate
  const receivables = (avgRevenue / 365) * daysReceivable;
  const inventory = (avgCogs / 365) * daysInventory;
  const payables = (avgCogs / 365) * daysPayable;
  const workingCapital = receivables + inventory - payables;
  const workingCapitalRatio = round(safeDivide(workingCapital, avgRevenue) * 100, 2);

  return {
    assetTurnover,
    receivablesTurnover,
    payablesTurnover,
    inventoryTurnover,
    cashConversionCycle,
    workingCapitalRatio,
  };
}

// ============================================================================
// RETURN METRICS
// ============================================================================

export function calculateReturns(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  assumptions: {
    totalAssets?: number;
    totalEquity?: number;
    investedCapital?: number;
    capitalEmployed?: number;
  } = {}
): { roa: number; roe: number; roic: number; roce: number } {
  const yearly = forecast.yearly;
  if (yearly.length === 0) {
    return { roa: 0, roe: 0, roic: 0, roce: 0 };
  }

  const avgNetIncome = yearly.reduce((s, y) => s + y.netIncome, 0) / yearly.length;
  const avgEbit = yearly.reduce((s, y) => s + y.ebit, 0) / yearly.length;
  const taxRate = inputs.taxRatePct / 100;
  const nopat = avgEbit * (1 - taxRate);

  // Estimate values if not provided
  const totalAssets = assumptions.totalAssets ?? inputs.currentRevenue * 1.5;
  const totalEquity = assumptions.totalEquity ?? (totalAssets - inputs.debtOutstanding);
  const investedCapital = assumptions.investedCapital ?? (totalEquity + inputs.debtOutstanding * 0.5);
  const capitalEmployed = assumptions.capitalEmployed ?? totalAssets;

  return {
    roa: round(safeDivide(avgNetIncome, totalAssets) * 100, 2),
    roe: round(safeDivide(avgNetIncome, totalEquity) * 100, 2),
    roic: round(safeDivide(nopat, investedCapital) * 100, 2),
    roce: round(safeDivide(avgEbit, capitalEmployed) * 100, 2),
  };
}

// ============================================================================
// ECONOMIC VALUE ADDED (EVA)
// ============================================================================

export function calculateEVA(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  wacc: number = 0.10
): number {
  const yearly = forecast.yearly;
  if (yearly.length === 0) return 0;

  const avgEbit = yearly.reduce((s, y) => s + y.ebit, 0) / yearly.length;
  const taxRate = inputs.taxRatePct / 100;
  const nopat = avgEbit * (1 - taxRate);

  // Invested Capital estimate
  const totalAssets = inputs.currentRevenue * 1.5;
  const totalEquity = totalAssets - inputs.debtOutstanding;
  const investedCapital = totalEquity + inputs.debtOutstanding * 0.5;

  // EVA = NOPAT - (WACC × Invested Capital)
  const capitalCharge = wacc * investedCapital;
  const eva = nopat - capitalCharge;

  return round(eva);
}

// ============================================================================
// COMPREHENSIVE VALUATION
// ============================================================================

export function computeValuation(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  options: {
    wacc?: number;
    terminalGrowthRate?: number;
    totalAssets?: number;
    totalEquity?: number;
  } = {}
): ValuationMetrics {
  const wacc = options.wacc ?? 0.10;
  const totalAssets = options.totalAssets ?? inputs.currentRevenue * 1.5;
  const totalEquity = options.totalEquity ?? (totalAssets - inputs.debtOutstanding);

  const assumptions = { totalAssets, totalEquity };

  return {
    dcf: calculateDCF(inputs, forecast, { wacc, terminalGrowthRate: options.terminalGrowthRate }),
    duPont: calculateDuPont(inputs, forecast, assumptions),
    leverage: calculateLeverage(inputs, forecast, assumptions),
    efficiency: calculateEfficiency(inputs, forecast),
    returnMetrics: calculateReturns(inputs, forecast, assumptions),
    eva: calculateEVA(inputs, forecast, wacc),
  };
}
