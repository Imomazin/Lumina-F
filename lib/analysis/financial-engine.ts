// Advanced Financial Analysis Engine
// 50+ financial metrics, ratios, and analytical computations

import {
  FinancialModel,
  IncomeStatement,
  BalanceSheet,
  CashFlowAssumptions,
  ValuationAssumptions,
  Scenario,
  INDUSTRY_BENCHMARKS,
  Industry,
} from '../models/financial-model';

// =============================================================================
// OUTPUT TYPES
// =============================================================================

export interface YearlyFinancials {
  year: number;
  // Income Statement
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  ebitda: number;
  ebitdaMargin: number;
  depreciation: number;
  amortization: number;
  ebit: number;
  ebitMargin: number;
  interestExpense: number;
  interestIncome: number;
  ebt: number;
  taxes: number;
  netIncome: number;
  netMargin: number;
  eps: number;

  // Balance Sheet
  totalAssets: number;
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalLiabilities: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalEquity: number;
  netDebt: number;
  workingCapital: number;
  investedCapital: number;

  // Cash Flow
  operatingCashFlow: number;
  capitalExpenditures: number;
  freeCashFlow: number;
  fcfMargin: number;
  dividendsPaid: number;
  netCashFlow: number;
  endingCash: number;

  // Working Capital Components
  accountsReceivable: number;
  inventory: number;
  accountsPayable: number;
  changeInWorkingCapital: number;
}

export interface FinancialRatios {
  // Profitability Ratios
  grossMargin: number;
  ebitdaMargin: number;
  ebitMargin: number;
  netMargin: number;
  returnOnEquity: number;
  returnOnAssets: number;
  returnOnInvestedCapital: number;
  returnOnCapitalEmployed: number;

  // Liquidity Ratios
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  workingCapitalRatio: number;

  // Leverage Ratios
  debtToEquity: number;
  debtToAssets: number;
  debtToEbitda: number;
  netDebtToEbitda: number;
  interestCoverage: number;
  equityMultiplier: number;
  debtToCapital: number;

  // Efficiency Ratios
  assetTurnover: number;
  inventoryTurnover: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  fixedAssetTurnover: number;
  workingCapitalTurnover: number;
  cashConversionCycle: number;
  daysInventoryOutstanding: number;
  daysSalesOutstanding: number;
  daysPayableOutstanding: number;

  // Growth Ratios
  revenueGrowth: number;
  ebitdaGrowth: number;
  netIncomeGrowth: number;
  epsGrowth: number;
  assetGrowth: number;
  equityGrowth: number;

  // Valuation Ratios
  priceToEarnings: number;
  priceToBook: number;
  priceToSales: number;
  evToRevenue: number;
  evToEbitda: number;
  evToEbit: number;
  fcfYield: number;
  dividendYield: number;
  payoutRatio: number;

  // Per Share Metrics
  earningsPerShare: number;
  bookValuePerShare: number;
  revenuePerShare: number;
  freeCashFlowPerShare: number;
  dividendsPerShare: number;
}

export interface DCFValuation {
  wacc: number;
  costOfEquity: number;
  costOfDebt: number;
  taxShield: number;

  projectedFCF: number[];
  discountFactors: number[];
  presentValueFCF: number[];
  sumPVFCF: number;

  terminalValue: number;
  terminalValuePV: number;
  terminalMethod: 'gordon_growth' | 'exit_multiple';

  enterpriseValue: number;
  netDebt: number;
  equityValue: number;
  impliedSharePrice: number;

  // Sensitivity Analysis
  sensitivityWACC: number[];
  sensitivityGrowth: number[];
  sensitivityMatrix: number[][];
}

export interface ComparableAnalysis {
  industry: Industry;
  metrics: {
    companyValue: number;
    industryLow: number;
    industryMedian: number;
    industryHigh: number;
    percentile: number;
    rating: 'below_average' | 'average' | 'above_average' | 'excellent';
  }[];
}

export interface ScenarioAnalysis {
  scenarioId: string;
  scenarioName: string;
  scenarioType: Scenario['type'];
  probability: number;
  yearlyFinancials: YearlyFinancials[];
  terminalMetrics: FinancialRatios;
  dcfValuation: DCFValuation;
  npv: number;
  irr: number;
}

export interface AnalysisResult {
  model: FinancialModel;
  baseCase: {
    yearlyFinancials: YearlyFinancials[];
    averageRatios: FinancialRatios;
    cagr: {
      revenue: number;
      ebitda: number;
      netIncome: number;
      fcf: number;
    };
    dcfValuation: DCFValuation;
  };
  scenarios: ScenarioAnalysis[];
  comparableAnalysis: ComparableAnalysis;
  executiveSummary: ExecutiveSummary;
  riskMetrics: RiskMetrics;
}

export interface ExecutiveSummary {
  keyHighlights: string[];
  strengthsOpportunities: string[];
  risksThreats: string[];
  recommendations: string[];
  investmentRating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface RiskMetrics {
  volatility: number;
  maxDrawdown: number;
  valueAtRisk95: number;
  valueAtRisk99: number;
  sharpeRatio: number;
  breakEvenYear: number | null;
  operatingLeverage: number;
  financialLeverage: number;
  combinedLeverage: number;
}

// =============================================================================
// MAIN ANALYSIS ENGINE
// =============================================================================

export class FinancialAnalysisEngine {
  private model: FinancialModel;

  constructor(model: FinancialModel) {
    this.model = model;
  }

  /**
   * Run complete financial analysis
   */
  analyze(): AnalysisResult {
    const baseCase = this.computeBaseCase();
    const scenarios = this.computeScenarios();
    const comparableAnalysis = this.computeComparableAnalysis(baseCase.yearlyFinancials);
    const executiveSummary = this.generateExecutiveSummary(baseCase, scenarios, comparableAnalysis);
    const riskMetrics = this.computeRiskMetrics(baseCase, scenarios);

    return {
      model: this.model,
      baseCase,
      scenarios,
      comparableAnalysis,
      executiveSummary,
      riskMetrics,
    };
  }

  // ===========================================================================
  // CORE PROJECTIONS
  // ===========================================================================

  private computeBaseCase() {
    const yearlyFinancials = this.projectFinancials();
    const averageRatios = this.computeAverageRatios(yearlyFinancials);
    const cagr = this.computeCAGR(yearlyFinancials);
    const dcfValuation = this.computeDCFValuation(yearlyFinancials);

    return { yearlyFinancials, averageRatios, cagr, dcfValuation };
  }

  private projectFinancials(scenario?: Scenario): YearlyFinancials[] {
    const { profile, incomeStatement, balanceSheet, cashFlowAssumptions } = this.model;
    const years = profile.forecastYears;
    const results: YearlyFinancials[] = [];

    let previousYear: YearlyFinancials | null = null;
    let previousBS = { ...balanceSheet };

    for (let i = 0; i < years; i++) {
      const year = profile.baseYear + i + 1;

      // Calculate Revenue
      let revenue = this.calculateRevenue(i, scenario);

      // Calculate Costs
      const { cogs, opex, depreciation, amortization } = this.calculateCosts(
        revenue,
        i,
        previousBS,
        scenario
      );

      const grossProfit = revenue - cogs;
      const grossMargin = revenue > 0 ? grossProfit / revenue : 0;

      const ebitda = grossProfit - opex + depreciation + amortization;
      const ebitdaMargin = revenue > 0 ? ebitda / revenue : 0;

      const ebit = ebitda - depreciation - amortization;
      const ebitMargin = revenue > 0 ? ebit / revenue : 0;

      // Interest
      const totalDebt = previousBS.shortTermDebt + previousBS.longTermDebt;
      const interestExpense = totalDebt * (incomeStatement.interestExpenseRate / 100);
      const interestIncome = incomeStatement.interestIncome;

      const ebt = ebit - interestExpense + interestIncome + incomeStatement.otherNonOperating;

      // Taxes
      let taxes = 0;
      if (ebt > 0) {
        const taxableIncome = Math.max(0, ebt - this.model.incomeStatement.nolCarryforward);
        taxes = taxableIncome * (incomeStatement.effectiveTaxRate / 100) - incomeStatement.taxCredits;
        taxes = Math.max(0, taxes);
      }

      const netIncome = ebt - taxes;
      const netMargin = revenue > 0 ? netIncome / revenue : 0;

      // Balance Sheet Projections
      const bs = this.projectBalanceSheet(
        revenue,
        cogs,
        netIncome,
        depreciation,
        previousBS,
        i
      );

      // Cash Flow
      const wcChange = previousYear
        ? (bs.workingCapital - (previousYear.accountsReceivable + previousYear.inventory - previousYear.accountsPayable))
        : 0;

      const capex = this.calculateCapex(revenue, i);

      const operatingCashFlow = netIncome + depreciation + amortization - wcChange;
      const freeCashFlow = operatingCashFlow - capex;
      const fcfMargin = revenue > 0 ? freeCashFlow / revenue : 0;

      const dividends = this.calculateDividends(netIncome, freeCashFlow);

      const netCashFlow = freeCashFlow - dividends;
      const endingCash = (previousYear?.endingCash || previousBS.cashAndEquivalents) + netCashFlow;

      // Per Share
      const sharesOutstanding = balanceSheet.sharesOutstanding;
      const eps = sharesOutstanding > 0 ? netIncome / sharesOutstanding : 0;

      const yearResult: YearlyFinancials = {
        year,
        revenue,
        costOfGoodsSold: cogs,
        grossProfit,
        grossMargin,
        operatingExpenses: opex,
        ebitda,
        ebitdaMargin,
        depreciation,
        amortization,
        ebit,
        ebitMargin,
        interestExpense,
        interestIncome,
        ebt,
        taxes,
        netIncome,
        netMargin,
        eps,
        totalAssets: bs.totalAssets,
        totalCurrentAssets: bs.totalCurrentAssets,
        totalNonCurrentAssets: bs.totalNonCurrentAssets,
        totalLiabilities: bs.totalLiabilities,
        totalCurrentLiabilities: bs.totalCurrentLiabilities,
        totalNonCurrentLiabilities: bs.totalNonCurrentLiabilities,
        totalEquity: bs.totalEquity,
        netDebt: bs.netDebt,
        workingCapital: bs.workingCapital,
        investedCapital: bs.investedCapital,
        operatingCashFlow,
        capitalExpenditures: capex,
        freeCashFlow,
        fcfMargin,
        dividendsPaid: dividends,
        netCashFlow,
        endingCash,
        accountsReceivable: bs.accountsReceivable,
        inventory: bs.inventory,
        accountsPayable: bs.accountsPayable,
        changeInWorkingCapital: wcChange,
      };

      results.push(yearResult);
      previousYear = yearResult;
      previousBS = this.updateBalanceSheet(previousBS, yearResult);
    }

    return results;
  }

  private calculateRevenue(yearIndex: number, scenario?: Scenario): number {
    const { incomeStatement } = this.model;
    let totalRevenue = 0;

    for (const stream of incomeStatement.revenueStreams) {
      const baseAmount = stream.baseAmount;
      const growthRate = stream.growthRates[yearIndex] ?? stream.growthRates[stream.growthRates.length - 1] ?? 0;

      let streamRevenue = baseAmount;
      for (let i = 0; i <= yearIndex; i++) {
        const rate = stream.growthRates[i] ?? growthRate;
        streamRevenue *= (1 + rate / 100);
      }

      // Apply scenario adjustments
      if (scenario) {
        streamRevenue *= scenario.revenueMultiplier;
        const adjustedGrowth = growthRate + scenario.growthRateAdjustment;
        streamRevenue *= (1 + (adjustedGrowth - growthRate) / 100);
      }

      totalRevenue += streamRevenue;
    }

    totalRevenue += incomeStatement.otherIncome;
    return totalRevenue;
  }

  private calculateCosts(
    revenue: number,
    yearIndex: number,
    balanceSheet: BalanceSheet,
    scenario?: Scenario
  ): { cogs: number; opex: number; depreciation: number; amortization: number } {
    const { incomeStatement, cashFlowAssumptions } = this.model;
    let cogs = 0;
    let opex = 0;

    for (const item of incomeStatement.costItems) {
      let cost = 0;

      if (item.costType === 'variable' && item.revenuePercent) {
        cost = revenue * (item.revenuePercent / 100);
      } else if (item.costType === 'fixed') {
        cost = item.baseAmount;
        if (item.growthRate) {
          cost *= Math.pow(1 + item.growthRate / 100, yearIndex + 1);
        }
      } else {
        // Semi-variable: base + variable component
        cost = item.baseAmount + (revenue * ((item.revenuePercent || 0) / 100));
      }

      // Apply scenario adjustments
      if (scenario) {
        if (item.category.startsWith('cogs_')) {
          cost *= scenario.cogsMultiplier;
        } else if (item.category.startsWith('opex_')) {
          cost *= scenario.opexMultiplier;
        }
      }

      if (item.category.startsWith('cogs_')) {
        cogs += cost;
      } else if (item.category.startsWith('opex_') &&
                 !item.category.includes('depreciation') &&
                 !item.category.includes('amortization')) {
        opex += cost;
      }
    }

    // Calculate D&A
    const ppe = balanceSheet.propertyPlantEquipment - balanceSheet.accumulatedDepreciation;
    const depreciation = ppe / cashFlowAssumptions.depreciationYears;
    const amortization = balanceSheet.intangibleAssets / cashFlowAssumptions.amortizationYears;

    return { cogs, opex, depreciation, amortization };
  }

  private projectBalanceSheet(
    revenue: number,
    cogs: number,
    netIncome: number,
    depreciation: number,
    previousBS: BalanceSheet,
    yearIndex: number
  ): {
    totalAssets: number;
    totalCurrentAssets: number;
    totalNonCurrentAssets: number;
    totalLiabilities: number;
    totalCurrentLiabilities: number;
    totalNonCurrentLiabilities: number;
    totalEquity: number;
    netDebt: number;
    workingCapital: number;
    investedCapital: number;
    accountsReceivable: number;
    inventory: number;
    accountsPayable: number;
  } {
    const { cashFlowAssumptions } = this.model;

    // Working Capital based on days
    const accountsReceivable = (revenue / 365) * cashFlowAssumptions.daysReceivable;
    const inventory = (cogs / 365) * cashFlowAssumptions.daysInventory;
    const accountsPayable = (cogs / 365) * cashFlowAssumptions.daysPayable;

    // Current Assets
    const cash = previousBS.cashAndEquivalents; // Updated separately
    const currentAssets = cash + previousBS.shortTermInvestments + accountsReceivable +
                          inventory + previousBS.prepaidExpenses + previousBS.otherCurrentAssets;

    // Non-Current Assets (simplified - add capex, subtract depreciation)
    const capex = this.calculateCapex(revenue, yearIndex);
    const ppe = Math.max(0, previousBS.propertyPlantEquipment + capex - depreciation);
    const nonCurrentAssets = ppe + previousBS.intangibleAssets + previousBS.goodwill +
                             previousBS.longTermInvestments + previousBS.deferredTaxAssets +
                             previousBS.otherNonCurrentAssets;

    const totalAssets = currentAssets + nonCurrentAssets;

    // Current Liabilities
    const currentLiabilities = accountsPayable + previousBS.shortTermDebt +
                               previousBS.currentPortionLongTermDebt + previousBS.accruedExpenses +
                               previousBS.deferredRevenue + previousBS.otherCurrentLiabilities;

    // Non-Current Liabilities
    const nonCurrentLiabilities = previousBS.longTermDebt + previousBS.deferredTaxLiabilities +
                                  previousBS.pensionObligations + previousBS.otherNonCurrentLiabilities;

    const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

    // Equity (increase by retained earnings)
    const retainedEarnings = previousBS.retainedEarnings + netIncome;
    const totalEquity = previousBS.commonStock + previousBS.additionalPaidInCapital +
                        retainedEarnings - previousBS.treasuryStock +
                        previousBS.accumulatedOtherComprehensiveIncome + previousBS.minorityInterest;

    const workingCapital = currentAssets - currentLiabilities;
    const netDebt = (previousBS.shortTermDebt + previousBS.longTermDebt) - cash;
    const investedCapital = totalEquity + netDebt;

    return {
      totalAssets,
      totalCurrentAssets: currentAssets,
      totalNonCurrentAssets: nonCurrentAssets,
      totalLiabilities,
      totalCurrentLiabilities: currentLiabilities,
      totalNonCurrentLiabilities: nonCurrentLiabilities,
      totalEquity,
      netDebt,
      workingCapital,
      investedCapital,
      accountsReceivable,
      inventory,
      accountsPayable,
    };
  }

  private updateBalanceSheet(bs: BalanceSheet, yearly: YearlyFinancials): BalanceSheet {
    return {
      ...bs,
      cashAndEquivalents: yearly.endingCash,
      accountsReceivable: yearly.accountsReceivable,
      inventory: yearly.inventory,
      accountsPayable: yearly.accountsPayable,
      retainedEarnings: bs.retainedEarnings + yearly.netIncome - yearly.dividendsPaid,
    };
  }

  private calculateCapex(revenue: number, yearIndex: number): number {
    const { cashFlowAssumptions } = this.model;

    switch (cashFlowAssumptions.capexMethod) {
      case 'fixed':
        return cashFlowAssumptions.capexFixed || 0;
      case 'revenue_percent':
        return revenue * (cashFlowAssumptions.capexRevenuePercent / 100);
      case 'growth_linked':
        const multiplier = cashFlowAssumptions.capexGrowthMultiplier || 1;
        return revenue * (cashFlowAssumptions.capexRevenuePercent / 100) * multiplier;
      default:
        return 0;
    }
  }

  private calculateDividends(netIncome: number, freeCashFlow: number): number {
    const { cashFlowAssumptions } = this.model;

    switch (cashFlowAssumptions.dividendPolicy) {
      case 'none':
        return 0;
      case 'fixed':
        return cashFlowAssumptions.dividendAmount || 0;
      case 'payout_ratio':
        const payoutRatio = (cashFlowAssumptions.dividendPayoutRatio || 0) / 100;
        return Math.max(0, netIncome * payoutRatio);
      case 'residual':
        return Math.max(0, freeCashFlow - (cashFlowAssumptions.minimumCashBalance || 0));
      default:
        return 0;
    }
  }

  // ===========================================================================
  // RATIO CALCULATIONS
  // ===========================================================================

  private computeAverageRatios(yearlyFinancials: YearlyFinancials[]): FinancialRatios {
    const n = yearlyFinancials.length;
    if (n === 0) return this.getEmptyRatios();

    const last = yearlyFinancials[n - 1];
    const first = yearlyFinancials[0];

    // Use last year for point-in-time ratios
    const avgRevenue = yearlyFinancials.reduce((s, y) => s + y.revenue, 0) / n;
    const avgNetIncome = yearlyFinancials.reduce((s, y) => s + y.netIncome, 0) / n;
    const avgEbitda = yearlyFinancials.reduce((s, y) => s + y.ebitda, 0) / n;

    return {
      // Profitability
      grossMargin: this.avg(yearlyFinancials.map(y => y.grossMargin)) * 100,
      ebitdaMargin: this.avg(yearlyFinancials.map(y => y.ebitdaMargin)) * 100,
      ebitMargin: this.avg(yearlyFinancials.map(y => y.ebitMargin)) * 100,
      netMargin: this.avg(yearlyFinancials.map(y => y.netMargin)) * 100,
      returnOnEquity: last.totalEquity > 0 ? (avgNetIncome / last.totalEquity) * 100 : 0,
      returnOnAssets: last.totalAssets > 0 ? (avgNetIncome / last.totalAssets) * 100 : 0,
      returnOnInvestedCapital: last.investedCapital > 0
        ? (last.ebit * (1 - this.model.incomeStatement.effectiveTaxRate / 100) / last.investedCapital) * 100
        : 0,
      returnOnCapitalEmployed: (last.totalAssets - last.totalCurrentLiabilities) > 0
        ? (last.ebit / (last.totalAssets - last.totalCurrentLiabilities)) * 100
        : 0,

      // Liquidity
      currentRatio: last.totalCurrentLiabilities > 0 ? last.totalCurrentAssets / last.totalCurrentLiabilities : 0,
      quickRatio: last.totalCurrentLiabilities > 0
        ? (last.totalCurrentAssets - last.inventory) / last.totalCurrentLiabilities
        : 0,
      cashRatio: last.totalCurrentLiabilities > 0 ? last.endingCash / last.totalCurrentLiabilities : 0,
      workingCapitalRatio: last.revenue > 0 ? last.workingCapital / last.revenue : 0,

      // Leverage
      debtToEquity: last.totalEquity > 0
        ? (last.totalLiabilities - last.totalCurrentLiabilities + last.totalCurrentLiabilities) / last.totalEquity
        : 0,
      debtToAssets: last.totalAssets > 0 ? last.totalLiabilities / last.totalAssets : 0,
      debtToEbitda: last.ebitda > 0 ? (last.netDebt + last.endingCash) / last.ebitda : 0,
      netDebtToEbitda: last.ebitda > 0 ? last.netDebt / last.ebitda : 0,
      interestCoverage: last.interestExpense > 0 ? last.ebit / last.interestExpense : 999,
      equityMultiplier: last.totalEquity > 0 ? last.totalAssets / last.totalEquity : 0,
      debtToCapital: last.investedCapital > 0 ? last.netDebt / last.investedCapital : 0,

      // Efficiency
      assetTurnover: last.totalAssets > 0 ? last.revenue / last.totalAssets : 0,
      inventoryTurnover: last.inventory > 0 ? last.costOfGoodsSold / last.inventory : 0,
      receivablesTurnover: last.accountsReceivable > 0 ? last.revenue / last.accountsReceivable : 0,
      payablesTurnover: last.accountsPayable > 0 ? last.costOfGoodsSold / last.accountsPayable : 0,
      fixedAssetTurnover: last.totalNonCurrentAssets > 0 ? last.revenue / last.totalNonCurrentAssets : 0,
      workingCapitalTurnover: last.workingCapital > 0 ? last.revenue / last.workingCapital : 0,
      daysInventoryOutstanding: this.model.cashFlowAssumptions.daysInventory,
      daysSalesOutstanding: this.model.cashFlowAssumptions.daysReceivable,
      daysPayableOutstanding: this.model.cashFlowAssumptions.daysPayable,
      cashConversionCycle:
        this.model.cashFlowAssumptions.daysReceivable +
        this.model.cashFlowAssumptions.daysInventory -
        this.model.cashFlowAssumptions.daysPayable,

      // Growth (CAGR)
      revenueGrowth: this.cagr(first.revenue, last.revenue, n),
      ebitdaGrowth: this.cagr(first.ebitda, last.ebitda, n),
      netIncomeGrowth: this.cagr(Math.max(1, first.netIncome), Math.max(1, last.netIncome), n),
      epsGrowth: this.cagr(Math.max(0.01, first.eps), Math.max(0.01, last.eps), n),
      assetGrowth: this.cagr(first.totalAssets || 1, last.totalAssets, n),
      equityGrowth: this.cagr(Math.max(1, first.totalEquity), Math.max(1, last.totalEquity), n),

      // Valuation (placeholder - need market data)
      priceToEarnings: 0,
      priceToBook: 0,
      priceToSales: 0,
      evToRevenue: 0,
      evToEbitda: 0,
      evToEbit: 0,
      fcfYield: 0,
      dividendYield: last.revenue > 0 ? (last.dividendsPaid / last.revenue) * 100 : 0,
      payoutRatio: last.netIncome > 0 ? (last.dividendsPaid / last.netIncome) * 100 : 0,

      // Per Share
      earningsPerShare: last.eps,
      bookValuePerShare: this.model.balanceSheet.sharesOutstanding > 0
        ? last.totalEquity / this.model.balanceSheet.sharesOutstanding
        : 0,
      revenuePerShare: this.model.balanceSheet.sharesOutstanding > 0
        ? last.revenue / this.model.balanceSheet.sharesOutstanding
        : 0,
      freeCashFlowPerShare: this.model.balanceSheet.sharesOutstanding > 0
        ? last.freeCashFlow / this.model.balanceSheet.sharesOutstanding
        : 0,
      dividendsPerShare: this.model.balanceSheet.sharesOutstanding > 0
        ? last.dividendsPaid / this.model.balanceSheet.sharesOutstanding
        : 0,
    };
  }

  private getEmptyRatios(): FinancialRatios {
    return {
      grossMargin: 0, ebitdaMargin: 0, ebitMargin: 0, netMargin: 0,
      returnOnEquity: 0, returnOnAssets: 0, returnOnInvestedCapital: 0, returnOnCapitalEmployed: 0,
      currentRatio: 0, quickRatio: 0, cashRatio: 0, workingCapitalRatio: 0,
      debtToEquity: 0, debtToAssets: 0, debtToEbitda: 0, netDebtToEbitda: 0,
      interestCoverage: 0, equityMultiplier: 0, debtToCapital: 0,
      assetTurnover: 0, inventoryTurnover: 0, receivablesTurnover: 0, payablesTurnover: 0,
      fixedAssetTurnover: 0, workingCapitalTurnover: 0, cashConversionCycle: 0,
      daysInventoryOutstanding: 0, daysSalesOutstanding: 0, daysPayableOutstanding: 0,
      revenueGrowth: 0, ebitdaGrowth: 0, netIncomeGrowth: 0, epsGrowth: 0, assetGrowth: 0, equityGrowth: 0,
      priceToEarnings: 0, priceToBook: 0, priceToSales: 0, evToRevenue: 0, evToEbitda: 0, evToEbit: 0,
      fcfYield: 0, dividendYield: 0, payoutRatio: 0,
      earningsPerShare: 0, bookValuePerShare: 0, revenuePerShare: 0, freeCashFlowPerShare: 0, dividendsPerShare: 0,
    };
  }

  // ===========================================================================
  // DCF VALUATION
  // ===========================================================================

  private computeDCFValuation(yearlyFinancials: YearlyFinancials[]): DCFValuation {
    const { valuationAssumptions, incomeStatement } = this.model;

    // Cost of Equity (CAPM)
    const costOfEquity = valuationAssumptions.riskFreeRate +
      valuationAssumptions.beta * valuationAssumptions.equityRiskPremium +
      valuationAssumptions.companySpecificRisk;

    // After-tax Cost of Debt
    const taxRate = incomeStatement.effectiveTaxRate / 100;
    const taxShield = valuationAssumptions.taxShieldEnabled ? (1 - taxRate) : 1;
    const afterTaxCostOfDebt = valuationAssumptions.costOfDebt * taxShield;

    // WACC
    const debtWeight = valuationAssumptions.targetDebtWeight / 100;
    const equityWeight = 1 - debtWeight;
    const wacc = (equityWeight * costOfEquity) + (debtWeight * afterTaxCostOfDebt);

    // Project FCF
    const projectedFCF = yearlyFinancials.map(y => y.freeCashFlow);

    // Discount Factors
    const discountFactors = projectedFCF.map((_, i) => Math.pow(1 + wacc / 100, i + 1));
    const presentValueFCF = projectedFCF.map((fcf, i) => fcf / discountFactors[i]);
    const sumPVFCF = presentValueFCF.reduce((a, b) => a + b, 0);

    // Terminal Value
    const lastFCF = projectedFCF[projectedFCF.length - 1] || 0;
    const terminalGrowth = valuationAssumptions.terminalGrowthRate / 100;
    const waccDecimal = wacc / 100;

    let terminalValue = 0;
    const terminalMethod = valuationAssumptions.terminalMethod;

    if (terminalMethod === 'gordon_growth' || terminalMethod === 'both') {
      if (waccDecimal > terminalGrowth) {
        terminalValue = (lastFCF * (1 + terminalGrowth)) / (waccDecimal - terminalGrowth);
      }
    }

    if (terminalMethod === 'exit_multiple' && valuationAssumptions.exitMultiple) {
      const lastEbitda = yearlyFinancials[yearlyFinancials.length - 1]?.ebitda || 0;
      terminalValue = lastEbitda * valuationAssumptions.exitMultiple;
    }

    const terminalValuePV = terminalValue / discountFactors[discountFactors.length - 1];

    // Enterprise Value
    const enterpriseValue = sumPVFCF + terminalValuePV;

    // Equity Value
    const lastYear = yearlyFinancials[yearlyFinancials.length - 1];
    const netDebt = lastYear?.netDebt || 0;
    const equityValue = enterpriseValue - netDebt;

    // Implied Share Price
    const sharesOutstanding = this.model.balanceSheet.sharesOutstanding;
    const impliedSharePrice = sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0;

    // Sensitivity Analysis
    const sensitivityWACC = [-2, -1, 0, 1, 2].map(adj => wacc + adj);
    const sensitivityGrowth = [-1, -0.5, 0, 0.5, 1].map(adj => valuationAssumptions.terminalGrowthRate + adj);

    const sensitivityMatrix: number[][] = [];
    for (const waccAdj of sensitivityWACC) {
      const row: number[] = [];
      for (const growthAdj of sensitivityGrowth) {
        const adjWacc = waccAdj / 100;
        const adjGrowth = growthAdj / 100;
        if (adjWacc > adjGrowth) {
          const adjTV = (lastFCF * (1 + adjGrowth)) / (adjWacc - adjGrowth);
          const adjTVPV = adjTV / Math.pow(1 + adjWacc, yearlyFinancials.length);
          const adjEV = sumPVFCF + adjTVPV;
          const adjEquity = adjEV - netDebt;
          const adjPrice = sharesOutstanding > 0 ? adjEquity / sharesOutstanding : 0;
          row.push(adjPrice);
        } else {
          row.push(0);
        }
      }
      sensitivityMatrix.push(row);
    }

    return {
      wacc,
      costOfEquity,
      costOfDebt: valuationAssumptions.costOfDebt,
      taxShield: taxShield * 100,
      projectedFCF,
      discountFactors,
      presentValueFCF,
      sumPVFCF,
      terminalValue,
      terminalValuePV,
      terminalMethod: terminalMethod === 'both' ? 'gordon_growth' : terminalMethod,
      enterpriseValue,
      netDebt,
      equityValue,
      impliedSharePrice,
      sensitivityWACC,
      sensitivityGrowth,
      sensitivityMatrix,
    };
  }

  // ===========================================================================
  // SCENARIO ANALYSIS
  // ===========================================================================

  private computeScenarios(): ScenarioAnalysis[] {
    return this.model.scenarios.map(scenario => {
      const yearlyFinancials = this.projectFinancials(scenario);
      const terminalMetrics = this.computeAverageRatios(yearlyFinancials);
      const dcfValuation = this.computeDCFValuation(yearlyFinancials);

      const totalInvestment = yearlyFinancials.reduce((s, y) => s + y.capitalExpenditures, 0);
      const totalCashFlow = yearlyFinancials.reduce((s, y) => s + y.freeCashFlow, 0);
      const npv = dcfValuation.sumPVFCF - totalInvestment;
      const irr = this.calculateIRR([-totalInvestment, ...yearlyFinancials.map(y => y.freeCashFlow)]);

      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        scenarioType: scenario.type,
        probability: scenario.probability,
        yearlyFinancials,
        terminalMetrics,
        dcfValuation,
        npv,
        irr,
      };
    });
  }

  // ===========================================================================
  // COMPARABLE ANALYSIS
  // ===========================================================================

  private computeComparableAnalysis(yearlyFinancials: YearlyFinancials[]): ComparableAnalysis {
    const industry = this.model.profile.industry;
    const benchmarks = INDUSTRY_BENCHMARKS[industry];
    const ratios = this.computeAverageRatios(yearlyFinancials);

    const metrics: ComparableAnalysis['metrics'] = [
      this.compareMetric('Gross Margin', ratios.grossMargin, benchmarks.grossMargin),
      this.compareMetric('EBITDA Margin', ratios.ebitdaMargin, benchmarks.ebitdaMargin),
      this.compareMetric('Net Margin', ratios.netMargin, benchmarks.netMargin),
      this.compareMetric('Revenue Growth', ratios.revenueGrowth, benchmarks.revenueGrowth),
      this.compareMetric('ROIC', ratios.returnOnInvestedCapital, benchmarks.roic),
    ];

    return { industry, metrics };
  }

  private compareMetric(
    name: string,
    value: number,
    benchmark: { low: number; median: number; high: number }
  ): ComparableAnalysis['metrics'][0] {
    let percentile: number;
    let rating: 'below_average' | 'average' | 'above_average' | 'excellent';

    if (value < benchmark.low) {
      percentile = (value / benchmark.low) * 25;
      rating = 'below_average';
    } else if (value < benchmark.median) {
      percentile = 25 + ((value - benchmark.low) / (benchmark.median - benchmark.low)) * 25;
      rating = 'average';
    } else if (value < benchmark.high) {
      percentile = 50 + ((value - benchmark.median) / (benchmark.high - benchmark.median)) * 25;
      rating = 'above_average';
    } else {
      percentile = 75 + Math.min(25, ((value - benchmark.high) / benchmark.high) * 25);
      rating = 'excellent';
    }

    return {
      companyValue: value,
      industryLow: benchmark.low,
      industryMedian: benchmark.median,
      industryHigh: benchmark.high,
      percentile: Math.min(100, Math.max(0, percentile)),
      rating,
    };
  }

  // ===========================================================================
  // EXECUTIVE SUMMARY
  // ===========================================================================

  private generateExecutiveSummary(
    baseCase: AnalysisResult['baseCase'],
    scenarios: ScenarioAnalysis[],
    comparableAnalysis: ComparableAnalysis
  ): ExecutiveSummary {
    const ratios = baseCase.averageRatios;
    const dcf = baseCase.dcfValuation;
    const yearly = baseCase.yearlyFinancials;

    const keyHighlights: string[] = [];
    const strengthsOpportunities: string[] = [];
    const risksThreats: string[] = [];
    const recommendations: string[] = [];

    // Revenue Growth Analysis
    if (ratios.revenueGrowth > 15) {
      keyHighlights.push(`Strong revenue growth of ${ratios.revenueGrowth.toFixed(1)}% CAGR projected`);
      strengthsOpportunities.push('Above-market revenue growth trajectory');
    } else if (ratios.revenueGrowth > 5) {
      keyHighlights.push(`Moderate revenue growth of ${ratios.revenueGrowth.toFixed(1)}% CAGR expected`);
    } else {
      risksThreats.push(`Low revenue growth of ${ratios.revenueGrowth.toFixed(1)}% may limit upside`);
    }

    // Profitability Analysis
    if (ratios.netMargin > 15) {
      keyHighlights.push(`Excellent profitability with ${ratios.netMargin.toFixed(1)}% net margin`);
      strengthsOpportunities.push('Strong pricing power and cost control');
    } else if (ratios.netMargin > 5) {
      keyHighlights.push(`Healthy net margin of ${ratios.netMargin.toFixed(1)}%`);
    } else {
      risksThreats.push('Thin profit margins create earnings vulnerability');
      recommendations.push('Focus on margin expansion initiatives');
    }

    // Cash Flow Analysis
    const lastYear = yearly[yearly.length - 1];
    if (lastYear && lastYear.fcfMargin > 0.1) {
      strengthsOpportunities.push('Strong free cash flow generation supports reinvestment');
    } else if (lastYear && lastYear.fcfMargin < 0) {
      risksThreats.push('Negative free cash flow requires external financing');
    }

    // Leverage Analysis
    if (ratios.netDebtToEbitda > 4) {
      risksThreats.push('High leverage (Net Debt/EBITDA > 4x) increases financial risk');
      recommendations.push('Consider deleveraging strategy');
    } else if (ratios.netDebtToEbitda < 1) {
      strengthsOpportunities.push('Conservative capital structure provides flexibility');
    }

    // Industry Comparison
    const aboveAverage = comparableAnalysis.metrics.filter(m => m.rating === 'above_average' || m.rating === 'excellent');
    const belowAverage = comparableAnalysis.metrics.filter(m => m.rating === 'below_average');

    if (aboveAverage.length >= 3) {
      keyHighlights.push('Outperforms industry peers on majority of metrics');
    }
    if (belowAverage.length >= 2) {
      risksThreats.push('Underperforms industry benchmarks on key metrics');
    }

    // Valuation
    keyHighlights.push(`DCF implies enterprise value of ${this.formatCurrency(dcf.enterpriseValue)}`);

    // Investment Rating
    let investmentRating: ExecutiveSummary['investmentRating'];
    let confidenceLevel: ExecutiveSummary['confidenceLevel'];

    const score = (ratios.revenueGrowth > 10 ? 2 : ratios.revenueGrowth > 5 ? 1 : 0) +
                  (ratios.netMargin > 10 ? 2 : ratios.netMargin > 5 ? 1 : 0) +
                  (ratios.returnOnInvestedCapital > 15 ? 2 : ratios.returnOnInvestedCapital > 10 ? 1 : 0) +
                  (ratios.netDebtToEbitda < 2 ? 1 : 0);

    if (score >= 6) investmentRating = 'strong_buy';
    else if (score >= 4) investmentRating = 'buy';
    else if (score >= 2) investmentRating = 'hold';
    else if (score >= 1) investmentRating = 'sell';
    else investmentRating = 'strong_sell';

    // Confidence based on data quality
    const hasMultipleScenarios = scenarios.length >= 3;
    const hasReasonableAssumptions = ratios.revenueGrowth < 50 && ratios.netMargin < 50;
    confidenceLevel = hasMultipleScenarios && hasReasonableAssumptions ? 'high' : 'medium';

    return {
      keyHighlights,
      strengthsOpportunities,
      risksThreats,
      recommendations,
      investmentRating,
      confidenceLevel,
    };
  }

  // ===========================================================================
  // RISK METRICS
  // ===========================================================================

  private computeRiskMetrics(
    baseCase: AnalysisResult['baseCase'],
    scenarios: ScenarioAnalysis[]
  ): RiskMetrics {
    const yearly = baseCase.yearlyFinancials;

    // Calculate returns
    const returns = yearly.slice(1).map((y, i) =>
      yearly[i].freeCashFlow !== 0 ? (y.freeCashFlow - yearly[i].freeCashFlow) / Math.abs(yearly[i].freeCashFlow) : 0
    );

    // Volatility (standard deviation of returns)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = Math.sqrt(returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / returns.length) * 100;

    // Max Drawdown
    let peak = yearly[0]?.freeCashFlow || 0;
    let maxDrawdown = 0;
    for (const y of yearly) {
      if (y.freeCashFlow > peak) peak = y.freeCashFlow;
      const drawdown = peak > 0 ? (peak - y.freeCashFlow) / peak : 0;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    // VaR from scenarios
    const scenarioValues = scenarios.map(s => s.dcfValuation.equityValue).sort((a, b) => a - b);
    const valueAtRisk95 = scenarioValues.length > 0 ? scenarioValues[Math.floor(scenarioValues.length * 0.05)] || scenarioValues[0] : 0;
    const valueAtRisk99 = scenarioValues.length > 0 ? scenarioValues[0] : 0;

    // Sharpe Ratio (simplified)
    const riskFreeRate = this.model.valuationAssumptions.riskFreeRate;
    const sharpeRatio = volatility > 0 ? (avgReturn * 100 - riskFreeRate) / volatility : 0;

    // Break-even Year
    let breakEvenYear: number | null = null;
    let cumulativeCash = 0;
    for (const y of yearly) {
      cumulativeCash += y.freeCashFlow;
      if (cumulativeCash > 0 && breakEvenYear === null) {
        breakEvenYear = y.year;
      }
    }

    // Operating Leverage
    const firstYear = yearly[0];
    const lastYear = yearly[yearly.length - 1];
    const revenueChange = firstYear && lastYear && firstYear.revenue !== 0
      ? (lastYear.revenue - firstYear.revenue) / firstYear.revenue
      : 0;
    const ebitChange = firstYear && lastYear && firstYear.ebit !== 0
      ? (lastYear.ebit - firstYear.ebit) / firstYear.ebit
      : 0;
    const operatingLeverage = revenueChange !== 0 ? ebitChange / revenueChange : 1;

    // Financial Leverage
    const ratios = baseCase.averageRatios;
    const financialLeverage = ratios.equityMultiplier;

    return {
      volatility,
      maxDrawdown: maxDrawdown * 100,
      valueAtRisk95,
      valueAtRisk99,
      sharpeRatio,
      breakEvenYear,
      operatingLeverage,
      financialLeverage,
      combinedLeverage: operatingLeverage * financialLeverage,
    };
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private computeCAGR(yearly: YearlyFinancials[]): AnalysisResult['baseCase']['cagr'] {
    const n = yearly.length;
    if (n < 2) return { revenue: 0, ebitda: 0, netIncome: 0, fcf: 0 };

    const first = yearly[0];
    const last = yearly[n - 1];

    return {
      revenue: this.cagr(first.revenue, last.revenue, n),
      ebitda: this.cagr(Math.max(1, first.ebitda), Math.max(1, last.ebitda), n),
      netIncome: this.cagr(Math.max(1, first.netIncome), Math.max(1, last.netIncome), n),
      fcf: this.cagr(Math.max(1, first.freeCashFlow), Math.max(1, last.freeCashFlow), n),
    };
  }

  private cagr(startValue: number, endValue: number, years: number): number {
    if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }

  private avg(values: number[]): number {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private calculateIRR(cashFlows: number[]): number {
    // Newton-Raphson method
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
      let npv = 0;
      let dnpv = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        npv += cashFlows[t] / Math.pow(1 + rate, t);
        dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
      }
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < 0.0001) return newRate * 100;
      rate = newRate;
    }
    return rate * 100;
  }

  private formatCurrency(value: number): string {
    const symbol = this.model.profile.currency === 'USD' ? '$' :
                   this.model.profile.currency === 'EUR' ? '€' :
                   this.model.profile.currency === 'GBP' ? '£' : '$';

    if (Math.abs(value) >= 1e9) return `${symbol}${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${symbol}${(value / 1e3).toFixed(1)}K`;
    return `${symbol}${value.toFixed(0)}`;
  }
}

// =============================================================================
// EXPORT ANALYSIS RUNNER
// =============================================================================

export function runFinancialAnalysis(model: FinancialModel): AnalysisResult {
  const engine = new FinancialAnalysisEngine(model);
  return engine.analyze();
}
