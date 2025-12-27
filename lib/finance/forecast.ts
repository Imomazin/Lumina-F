import { AnalysisSession } from "../schema";

export interface YearlyMetrics {
  year: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  ebit: number;
  interest: number;
  ebt: number;
  tax: number;
  netIncome: number;
  cashProxy: number; // netIncome - capex
}

export interface ForecastRatios {
  grossMarginPct: number;
  ebitMarginPct: number;
  netMarginPct: number;
}

export interface ForecastResult {
  yearly: YearlyMetrics[];
  ratios: ForecastRatios;
  summary: {
    revenueYear1: number;
    revenueYearN: number;
    averageEbitMargin: number;
    averageNetMargin: number;
    totalNetIncome: number;
    totalCashProxy: number;
  };
}

// Round to 2 decimal places
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Safe division that returns 0 for division by zero
function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Compute financial forecast from analysis session inputs
 */
export function computeForecast(inputs: AnalysisSession): ForecastResult {
  const {
    startYear,
    yearsForward,
    currentRevenue,
    revenueGrowthAssumption,
    currentCOGS,
    currentOpex,
    cogsPctOptional,
    opexPctOptional,
    annualCapex,
    debtOutstanding,
    interestRatePct,
    taxRatePct,
  } = inputs;

  // Calculate base ratios from current year data
  const baseCogsPct = cogsPctOptional ?? safeDivide(currentCOGS, currentRevenue) * 100;
  const baseOpexPct = opexPctOptional ?? safeDivide(currentOpex, currentRevenue) * 100;
  const growthRate = revenueGrowthAssumption / 100;
  const interestRate = interestRatePct / 100;
  const taxRate = taxRatePct / 100;

  const yearly: YearlyMetrics[] = [];
  let totalGrossMargin = 0;
  let totalEbitMargin = 0;
  let totalNetMargin = 0;
  let totalNetIncome = 0;
  let totalCashProxy = 0;

  for (let i = 0; i < yearsForward; i++) {
    const year = startYear + i;

    // Revenue grows at assumed rate
    const revenue = round2(currentRevenue * Math.pow(1 + growthRate, i));

    // Costs as percentage of revenue (or use percentage overrides)
    const cogs = round2(revenue * (baseCogsPct / 100));
    const grossProfit = round2(revenue - cogs);
    const opex = round2(revenue * (baseOpexPct / 100));
    const ebit = round2(grossProfit - opex);

    // Interest expense on outstanding debt
    const interest = round2(debtOutstanding * interestRate);
    const ebt = round2(ebit - interest);

    // Tax only on positive earnings
    const tax = ebt > 0 ? round2(ebt * taxRate) : 0;
    const netIncome = round2(ebt - tax);

    // Simple cash proxy
    const cashProxy = round2(netIncome - annualCapex);

    yearly.push({
      year,
      revenue,
      cogs,
      grossProfit,
      opex,
      ebit,
      interest,
      ebt,
      tax,
      netIncome,
      cashProxy,
    });

    // Accumulate for averages
    if (revenue > 0) {
      totalGrossMargin += safeDivide(grossProfit, revenue) * 100;
      totalEbitMargin += safeDivide(ebit, revenue) * 100;
      totalNetMargin += safeDivide(netIncome, revenue) * 100;
    }
    totalNetIncome += netIncome;
    totalCashProxy += cashProxy;
  }

  // Calculate average ratios
  const ratios: ForecastRatios = {
    grossMarginPct: round2(safeDivide(totalGrossMargin, yearsForward)),
    ebitMarginPct: round2(safeDivide(totalEbitMargin, yearsForward)),
    netMarginPct: round2(safeDivide(totalNetMargin, yearsForward)),
  };

  const summary = {
    revenueYear1: yearly[0]?.revenue ?? 0,
    revenueYearN: yearly[yearly.length - 1]?.revenue ?? 0,
    averageEbitMargin: ratios.ebitMarginPct,
    averageNetMargin: ratios.netMarginPct,
    totalNetIncome: round2(totalNetIncome),
    totalCashProxy: round2(totalCashProxy),
  };

  return { yearly, ratios, summary };
}
