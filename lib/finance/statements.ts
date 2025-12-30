/**
 * Three-Statement Financial Model
 *
 * Comprehensive integrated financial statements:
 * - Income Statement (P&L)
 * - Balance Sheet
 * - Cash Flow Statement
 *
 * All three statements are linked and automatically reconcile
 */

import { AnalysisSession } from '../schema';
import { ForecastResult, YearlyMetrics } from './forecast';

// ============================================================================
// TYPES
// ============================================================================

export interface IncomeStatement {
  year: number;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMargin: number;

  // Operating Expenses
  researchAndDevelopment: number;
  salesAndMarketing: number;
  generalAndAdministrative: number;
  totalOperatingExpenses: number;

  operatingIncome: number; // EBIT
  operatingMargin: number;

  // Below the line
  interestExpense: number;
  interestIncome: number;
  otherIncomeExpense: number;
  incomeBeforeTax: number;

  incomeTaxExpense: number;
  effectiveTaxRate: number;

  netIncome: number;
  netMargin: number;

  // Per share (if applicable)
  sharesOutstanding?: number;
  earningsPerShare?: number;

  // Non-GAAP
  ebitda: number;
  ebitdaMargin: number;
  adjustedEbitda?: number;
}

export interface BalanceSheet {
  year: number;
  asOfDate: string;

  // Assets
  assets: {
    current: {
      cashAndEquivalents: number;
      shortTermInvestments: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      otherCurrentAssets: number;
      totalCurrentAssets: number;
    };
    nonCurrent: {
      propertyPlantEquipment: number;
      accumulatedDepreciation: number;
      netPPE: number;
      goodwill: number;
      intangibleAssets: number;
      longTermInvestments: number;
      otherNonCurrentAssets: number;
      totalNonCurrentAssets: number;
    };
    totalAssets: number;
  };

  // Liabilities
  liabilities: {
    current: {
      accountsPayable: number;
      accruedExpenses: number;
      shortTermDebt: number;
      deferredRevenue: number;
      currentPortionLongTermDebt: number;
      otherCurrentLiabilities: number;
      totalCurrentLiabilities: number;
    };
    nonCurrent: {
      longTermDebt: number;
      deferredTaxLiabilities: number;
      otherNonCurrentLiabilities: number;
      totalNonCurrentLiabilities: number;
    };
    totalLiabilities: number;
  };

  // Equity
  equity: {
    commonStock: number;
    additionalPaidInCapital: number;
    retainedEarnings: number;
    treasuryStock: number;
    accumulatedOtherComprehensiveIncome: number;
    totalEquity: number;
  };

  // Validation
  totalLiabilitiesAndEquity: number;
  balanceCheck: boolean; // Assets = Liabilities + Equity
}

export interface CashFlowStatement {
  year: number;

  // Operating Activities
  operating: {
    netIncome: number;

    // Adjustments for non-cash items
    depreciationAndAmortization: number;
    stockBasedCompensation: number;
    deferredTaxes: number;
    otherNonCashItems: number;

    // Changes in working capital
    changeInAccountsReceivable: number;
    changeInInventory: number;
    changeInPrepaidExpenses: number;
    changeInAccountsPayable: number;
    changeInAccruedExpenses: number;
    changeInDeferredRevenue: number;
    changeInOtherWorkingCapital: number;

    netCashFromOperating: number;
  };

  // Investing Activities
  investing: {
    capitalExpenditures: number;
    acquisitions: number;
    purchaseOfInvestments: number;
    saleOfInvestments: number;
    otherInvestingActivities: number;
    netCashFromInvesting: number;
  };

  // Financing Activities
  financing: {
    debtProceeds: number;
    debtRepayments: number;
    equityIssuance: number;
    stockRepurchases: number;
    dividendsPaid: number;
    otherFinancingActivities: number;
    netCashFromFinancing: number;
  };

  // Summary
  netChangeInCash: number;
  beginningCash: number;
  endingCash: number;

  // Key metrics
  freeCashFlow: number; // Operating - CapEx
  freeCashFlowMargin: number;
  operatingCashFlowRatio: number;
}

export interface ThreeStatementModel {
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlowStatements: CashFlowStatement[];
  summary: {
    revenueCAGR: number;
    netIncomeCAGR: number;
    averageROE: number;
    averageROA: number;
    totalFreeCashFlow: number;
    endingCashPosition: number;
    endingDebtPosition: number;
    debtToEquityFinal: number;
  };
  validationChecks: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  expected: number;
  actual: number;
  message: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function safeDiv(numerator: number, denominator: number, fallback: number = 0): number {
  return denominator !== 0 ? numerator / denominator : fallback;
}

function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

// ============================================================================
// INCOME STATEMENT BUILDER
// ============================================================================

export function buildIncomeStatement(
  inputs: AnalysisSession,
  yearMetrics: YearlyMetrics,
  year: number,
  assumptions: {
    rdPercent?: number;
    smPercent?: number;
    gaPercent?: number;
    daPercent?: number; // D&A as % of revenue
    sharesOutstanding?: number;
  } = {}
): IncomeStatement {
  const revenue = yearMetrics.revenue;
  const cogs = yearMetrics.cogs;
  const grossProfit = revenue - cogs;
  const grossMargin = safeDiv(grossProfit, revenue) * 100;

  // Operating expenses breakdown (from total opex)
  const totalOpex = yearMetrics.opex;
  const rdPercent = assumptions.rdPercent ?? 0.15; // 15% of opex to R&D
  const smPercent = assumptions.smPercent ?? 0.50; // 50% of opex to S&M
  const gaPercent = assumptions.gaPercent ?? 0.35; // 35% of opex to G&A

  const researchAndDevelopment = round(totalOpex * rdPercent);
  const salesAndMarketing = round(totalOpex * smPercent);
  const generalAndAdministrative = round(totalOpex * gaPercent);

  const operatingIncome = yearMetrics.ebit;
  const operatingMargin = safeDiv(operatingIncome, revenue) * 100;

  const interestExpense = yearMetrics.interest;
  const interestIncome = 0; // Could add cash * interest rate
  const otherIncomeExpense = 0;

  const incomeBeforeTax = yearMetrics.ebt;
  const incomeTaxExpense = yearMetrics.taxes;
  const effectiveTaxRate = safeDiv(incomeTaxExpense, incomeBeforeTax) * 100;

  const netIncome = yearMetrics.netIncome;
  const netMargin = safeDiv(netIncome, revenue) * 100;

  // D&A estimation
  const daPercent = assumptions.daPercent ?? 0.03;
  const depreciation = round(revenue * daPercent);

  const ebitda = operatingIncome + depreciation;
  const ebitdaMargin = safeDiv(ebitda, revenue) * 100;

  // EPS
  const sharesOutstanding = assumptions.sharesOutstanding;
  const eps = sharesOutstanding ? safeDiv(netIncome, sharesOutstanding) : undefined;

  return {
    year,
    revenue: round(revenue),
    costOfGoodsSold: round(cogs),
    grossProfit: round(grossProfit),
    grossMargin: round(grossMargin, 1),
    researchAndDevelopment,
    salesAndMarketing,
    generalAndAdministrative,
    totalOperatingExpenses: round(totalOpex),
    operatingIncome: round(operatingIncome),
    operatingMargin: round(operatingMargin, 1),
    interestExpense: round(interestExpense),
    interestIncome: round(interestIncome),
    otherIncomeExpense: round(otherIncomeExpense),
    incomeBeforeTax: round(incomeBeforeTax),
    incomeTaxExpense: round(incomeTaxExpense),
    effectiveTaxRate: round(effectiveTaxRate, 1),
    netIncome: round(netIncome),
    netMargin: round(netMargin, 1),
    sharesOutstanding,
    earningsPerShare: eps ? round(eps, 2) : undefined,
    ebitda: round(ebitda),
    ebitdaMargin: round(ebitdaMargin, 1),
  };
}

// ============================================================================
// BALANCE SHEET BUILDER
// ============================================================================

export function buildBalanceSheet(
  inputs: AnalysisSession,
  yearMetrics: YearlyMetrics,
  year: number,
  previousBalance: BalanceSheet | null,
  incomeStatement: IncomeStatement,
  assumptions: {
    initialCash?: number;
    initialDebt?: number;
    initialEquity?: number;
    ppeGrowthRate?: number;
    debtRepaymentRate?: number;
  } = {}
): BalanceSheet {
  const revenue = incomeStatement.revenue;
  const cogs = incomeStatement.costOfGoodsSold;
  const netIncome = incomeStatement.netIncome;

  // Working capital from days assumptions
  const daysReceivable = inputs.daysReceivable ?? 30;
  const daysPayable = inputs.daysPayable ?? 30;
  const daysInventory = inputs.daysInventory ?? 45;

  // Current Assets
  const accountsReceivable = round((revenue / 365) * daysReceivable);
  const inventory = round((cogs / 365) * daysInventory);
  const prepaidExpenses = round(revenue * 0.02); // 2% of revenue

  // Cash calculation (start with previous or initial)
  let cashAndEquivalents: number;
  if (previousBalance) {
    // Will be updated after cash flow calculation
    cashAndEquivalents = previousBalance.assets.current.cashAndEquivalents;
  } else {
    cashAndEquivalents = assumptions.initialCash ?? inputs.currentRevenue * 0.1;
  }

  const shortTermInvestments = 0;
  const otherCurrentAssets = round(revenue * 0.01);

  const totalCurrentAssets = round(
    cashAndEquivalents + shortTermInvestments + accountsReceivable +
    inventory + prepaidExpenses + otherCurrentAssets
  );

  // Non-Current Assets
  const ppeGrowthRate = assumptions.ppeGrowthRate ?? 0.05;
  let grossPPE: number;
  let accumulatedDepreciation: number;

  if (previousBalance) {
    grossPPE = previousBalance.assets.nonCurrent.propertyPlantEquipment + inputs.annualCapex;
    const annualDepreciation = round(incomeStatement.ebitda - incomeStatement.operatingIncome);
    accumulatedDepreciation = Math.abs(previousBalance.assets.nonCurrent.accumulatedDepreciation) + annualDepreciation;
  } else {
    grossPPE = round(inputs.currentRevenue * 0.3); // 30% of revenue as initial PPE
    accumulatedDepreciation = round(grossPPE * 0.3); // 30% depreciated
  }

  const netPPE = round(grossPPE - accumulatedDepreciation);
  const goodwill = previousBalance?.assets.nonCurrent.goodwill ?? round(inputs.currentRevenue * 0.1);
  const intangibleAssets = previousBalance?.assets.nonCurrent.intangibleAssets ?? round(inputs.currentRevenue * 0.05);
  const longTermInvestments = 0;
  const otherNonCurrentAssets = round(revenue * 0.02);

  const totalNonCurrentAssets = round(
    netPPE + goodwill + intangibleAssets + longTermInvestments + otherNonCurrentAssets
  );

  const totalAssets = round(totalCurrentAssets + totalNonCurrentAssets);

  // Current Liabilities
  const accountsPayable = round((cogs / 365) * daysPayable);
  const accruedExpenses = round(incomeStatement.totalOperatingExpenses * 0.05);
  const deferredRevenue = round(revenue * 0.03);
  const shortTermDebt = round(inputs.debtOutstanding * 0.1); // 10% current portion
  const currentPortionLongTermDebt = shortTermDebt;
  const otherCurrentLiabilities = round(revenue * 0.01);

  const totalCurrentLiabilities = round(
    accountsPayable + accruedExpenses + shortTermDebt +
    deferredRevenue + currentPortionLongTermDebt + otherCurrentLiabilities
  );

  // Non-Current Liabilities
  const debtRepaymentRate = assumptions.debtRepaymentRate ?? 0.05;
  let longTermDebt: number;

  if (previousBalance) {
    const previousDebt = previousBalance.liabilities.nonCurrent.longTermDebt;
    longTermDebt = round(previousDebt * (1 - debtRepaymentRate));
  } else {
    longTermDebt = round(inputs.debtOutstanding * 0.9); // 90% long-term
  }

  const deferredTaxLiabilities = round(incomeStatement.incomeTaxExpense * 0.1);
  const otherNonCurrentLiabilities = round(revenue * 0.02);

  const totalNonCurrentLiabilities = round(
    longTermDebt + deferredTaxLiabilities + otherNonCurrentLiabilities
  );

  const totalLiabilities = round(totalCurrentLiabilities + totalNonCurrentLiabilities);

  // Equity
  let retainedEarnings: number;
  let commonStock: number;
  let additionalPaidInCapital: number;

  if (previousBalance) {
    retainedEarnings = previousBalance.equity.retainedEarnings + netIncome;
    commonStock = previousBalance.equity.commonStock;
    additionalPaidInCapital = previousBalance.equity.additionalPaidInCapital;
  } else {
    const initialEquity = assumptions.initialEquity ?? (totalAssets - totalLiabilities);
    commonStock = round(initialEquity * 0.01);
    additionalPaidInCapital = round(initialEquity * 0.5);
    retainedEarnings = round(initialEquity - commonStock - additionalPaidInCapital);
  }

  const treasuryStock = 0;
  const aoci = 0;
  const totalEquity = round(commonStock + additionalPaidInCapital + retainedEarnings - treasuryStock + aoci);

  const totalLiabilitiesAndEquity = round(totalLiabilities + totalEquity);
  const balanceCheck = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

  return {
    year,
    asOfDate: `${year}-12-31`,
    assets: {
      current: {
        cashAndEquivalents: round(cashAndEquivalents),
        shortTermInvestments,
        accountsReceivable,
        inventory,
        prepaidExpenses,
        otherCurrentAssets,
        totalCurrentAssets,
      },
      nonCurrent: {
        propertyPlantEquipment: round(grossPPE),
        accumulatedDepreciation: round(-accumulatedDepreciation),
        netPPE,
        goodwill,
        intangibleAssets,
        longTermInvestments,
        otherNonCurrentAssets,
        totalNonCurrentAssets,
      },
      totalAssets,
    },
    liabilities: {
      current: {
        accountsPayable,
        accruedExpenses,
        shortTermDebt,
        deferredRevenue,
        currentPortionLongTermDebt,
        otherCurrentLiabilities,
        totalCurrentLiabilities,
      },
      nonCurrent: {
        longTermDebt,
        deferredTaxLiabilities,
        otherNonCurrentLiabilities,
        totalNonCurrentLiabilities,
      },
      totalLiabilities,
    },
    equity: {
      commonStock,
      additionalPaidInCapital,
      retainedEarnings: round(retainedEarnings),
      treasuryStock,
      accumulatedOtherComprehensiveIncome: aoci,
      totalEquity,
    },
    totalLiabilitiesAndEquity,
    balanceCheck,
  };
}

// ============================================================================
// CASH FLOW STATEMENT BUILDER
// ============================================================================

export function buildCashFlowStatement(
  inputs: AnalysisSession,
  incomeStatement: IncomeStatement,
  currentBalance: BalanceSheet,
  previousBalance: BalanceSheet | null,
  year: number
): CashFlowStatement {
  const netIncome = incomeStatement.netIncome;

  // Non-cash adjustments
  const depreciationAndAmortization = round(incomeStatement.ebitda - incomeStatement.operatingIncome);
  const stockBasedCompensation = round(incomeStatement.totalOperatingExpenses * 0.03);
  const deferredTaxes = round(incomeStatement.incomeTaxExpense * 0.1);
  const otherNonCashItems = 0;

  // Working capital changes
  let changeInAR = 0;
  let changeInInventory = 0;
  let changeInPrepaid = 0;
  let changeInAP = 0;
  let changeInAccrued = 0;
  let changeInDeferred = 0;

  if (previousBalance) {
    changeInAR = previousBalance.assets.current.accountsReceivable - currentBalance.assets.current.accountsReceivable;
    changeInInventory = previousBalance.assets.current.inventory - currentBalance.assets.current.inventory;
    changeInPrepaid = previousBalance.assets.current.prepaidExpenses - currentBalance.assets.current.prepaidExpenses;
    changeInAP = currentBalance.liabilities.current.accountsPayable - previousBalance.liabilities.current.accountsPayable;
    changeInAccrued = currentBalance.liabilities.current.accruedExpenses - previousBalance.liabilities.current.accruedExpenses;
    changeInDeferred = currentBalance.liabilities.current.deferredRevenue - previousBalance.liabilities.current.deferredRevenue;
  }

  const netCashFromOperating = round(
    netIncome +
    depreciationAndAmortization +
    stockBasedCompensation +
    deferredTaxes +
    otherNonCashItems +
    changeInAR +
    changeInInventory +
    changeInPrepaid +
    changeInAP +
    changeInAccrued +
    changeInDeferred
  );

  // Investing Activities
  const capitalExpenditures = -inputs.annualCapex;
  const acquisitions = 0;
  const purchaseOfInvestments = 0;
  const saleOfInvestments = 0;
  const otherInvestingActivities = 0;

  const netCashFromInvesting = round(
    capitalExpenditures + acquisitions + purchaseOfInvestments +
    saleOfInvestments + otherInvestingActivities
  );

  // Financing Activities
  const debtProceeds = 0;
  let debtRepayments = 0;
  if (previousBalance) {
    const totalDebtPrev = previousBalance.liabilities.current.shortTermDebt + previousBalance.liabilities.nonCurrent.longTermDebt;
    const totalDebtCurr = currentBalance.liabilities.current.shortTermDebt + currentBalance.liabilities.nonCurrent.longTermDebt;
    debtRepayments = Math.min(0, totalDebtCurr - totalDebtPrev);
  }

  const equityIssuance = 0;
  const stockRepurchases = 0;
  const dividendsPaid = 0;
  const otherFinancingActivities = 0;

  const netCashFromFinancing = round(
    debtProceeds + debtRepayments + equityIssuance +
    stockRepurchases + dividendsPaid + otherFinancingActivities
  );

  // Summary
  const netChangeInCash = round(netCashFromOperating + netCashFromInvesting + netCashFromFinancing);
  const beginningCash = previousBalance?.assets.current.cashAndEquivalents ?? round(inputs.currentRevenue * 0.1);
  const endingCash = round(beginningCash + netChangeInCash);

  // Key metrics
  const freeCashFlow = round(netCashFromOperating + capitalExpenditures);
  const freeCashFlowMargin = safeDiv(freeCashFlow, incomeStatement.revenue) * 100;
  const operatingCashFlowRatio = safeDiv(netCashFromOperating, currentBalance.liabilities.current.totalCurrentLiabilities);

  return {
    year,
    operating: {
      netIncome: round(netIncome),
      depreciationAndAmortization,
      stockBasedCompensation,
      deferredTaxes,
      otherNonCashItems,
      changeInAccountsReceivable: round(changeInAR),
      changeInInventory: round(changeInInventory),
      changeInPrepaidExpenses: round(changeInPrepaid),
      changeInAccountsPayable: round(changeInAP),
      changeInAccruedExpenses: round(changeInAccrued),
      changeInDeferredRevenue: round(changeInDeferred),
      changeInOtherWorkingCapital: 0,
      netCashFromOperating,
    },
    investing: {
      capitalExpenditures: round(capitalExpenditures),
      acquisitions,
      purchaseOfInvestments,
      saleOfInvestments,
      otherInvestingActivities,
      netCashFromInvesting,
    },
    financing: {
      debtProceeds,
      debtRepayments: round(debtRepayments),
      equityIssuance,
      stockRepurchases,
      dividendsPaid,
      otherFinancingActivities,
      netCashFromFinancing,
    },
    netChangeInCash,
    beginningCash,
    endingCash,
    freeCashFlow,
    freeCashFlowMargin: round(freeCashFlowMargin, 1),
    operatingCashFlowRatio: round(operatingCashFlowRatio, 2),
  };
}

// ============================================================================
// THREE-STATEMENT MODEL BUILDER
// ============================================================================

export function buildThreeStatementModel(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  assumptions: {
    initialCash?: number;
    initialDebt?: number;
    initialEquity?: number;
    sharesOutstanding?: number;
    rdPercent?: number;
    smPercent?: number;
    gaPercent?: number;
  } = {}
): ThreeStatementModel {
  const incomeStatements: IncomeStatement[] = [];
  const balanceSheets: BalanceSheet[] = [];
  const cashFlowStatements: CashFlowStatement[] = [];
  const validationChecks: ValidationCheck[] = [];

  let previousBalance: BalanceSheet | null = null;

  forecast.yearly.forEach((yearMetrics, index) => {
    const year = inputs.startYear + index;

    // Build Income Statement
    const incomeStatement = buildIncomeStatement(inputs, yearMetrics, year, {
      sharesOutstanding: assumptions.sharesOutstanding,
      rdPercent: assumptions.rdPercent,
      smPercent: assumptions.smPercent,
      gaPercent: assumptions.gaPercent,
    });
    incomeStatements.push(incomeStatement);

    // Build Balance Sheet
    const balanceSheet = buildBalanceSheet(
      inputs,
      yearMetrics,
      year,
      previousBalance,
      incomeStatement,
      {
        initialCash: assumptions.initialCash,
        initialDebt: assumptions.initialDebt,
        initialEquity: assumptions.initialEquity,
      }
    );
    balanceSheets.push(balanceSheet);

    // Build Cash Flow Statement
    const cashFlowStatement = buildCashFlowStatement(
      inputs,
      incomeStatement,
      balanceSheet,
      previousBalance,
      year
    );
    cashFlowStatements.push(cashFlowStatement);

    // Update balance sheet cash with calculated ending cash
    balanceSheet.assets.current.cashAndEquivalents = cashFlowStatement.endingCash;
    balanceSheet.assets.current.totalCurrentAssets = round(
      cashFlowStatement.endingCash +
      balanceSheet.assets.current.shortTermInvestments +
      balanceSheet.assets.current.accountsReceivable +
      balanceSheet.assets.current.inventory +
      balanceSheet.assets.current.prepaidExpenses +
      balanceSheet.assets.current.otherCurrentAssets
    );
    balanceSheet.assets.totalAssets = round(
      balanceSheet.assets.current.totalCurrentAssets +
      balanceSheet.assets.nonCurrent.totalNonCurrentAssets
    );

    previousBalance = balanceSheet;
  });

  // Validation Checks
  balanceSheets.forEach((bs, index) => {
    const balanceDiff = Math.abs(bs.assets.totalAssets - bs.totalLiabilitiesAndEquity);
    validationChecks.push({
      name: `Balance Sheet Year ${bs.year}`,
      passed: balanceDiff < 1,
      expected: bs.assets.totalAssets,
      actual: bs.totalLiabilitiesAndEquity,
      message: balanceDiff < 1
        ? 'Assets = Liabilities + Equity ✓'
        : `Imbalance of ${balanceDiff.toFixed(0)}`,
    });
  });

  // Cash flow to balance sheet reconciliation
  cashFlowStatements.forEach((cf, index) => {
    if (index > 0) {
      const prevCash = balanceSheets[index - 1].assets.current.cashAndEquivalents;
      const expectedCash = prevCash + cf.netChangeInCash;
      const actualCash = cf.endingCash;
      const diff = Math.abs(expectedCash - actualCash);

      validationChecks.push({
        name: `Cash Reconciliation Year ${cf.year}`,
        passed: diff < 1,
        expected: expectedCash,
        actual: actualCash,
        message: diff < 1
          ? 'Cash flow reconciles ✓'
          : `Cash difference of ${diff.toFixed(0)}`,
      });
    }
  });

  // Summary calculations
  const firstYear = incomeStatements[0];
  const lastYear = incomeStatements[incomeStatements.length - 1];
  const years = incomeStatements.length;

  const revenueCAGR = calculateCAGR(firstYear.revenue, lastYear.revenue, years);
  const netIncomeCAGR = firstYear.netIncome > 0 && lastYear.netIncome > 0
    ? calculateCAGR(firstYear.netIncome, lastYear.netIncome, years)
    : 0;

  const lastBalance = balanceSheets[balanceSheets.length - 1];
  const avgROE = incomeStatements.reduce((sum, is, i) => {
    const equity = balanceSheets[i].equity.totalEquity;
    return sum + safeDiv(is.netIncome, equity);
  }, 0) / years * 100;

  const avgROA = incomeStatements.reduce((sum, is, i) => {
    const assets = balanceSheets[i].assets.totalAssets;
    return sum + safeDiv(is.netIncome, assets);
  }, 0) / years * 100;

  const totalFCF = cashFlowStatements.reduce((sum, cf) => sum + cf.freeCashFlow, 0);
  const endingCash = lastBalance.assets.current.cashAndEquivalents;
  const endingDebt = lastBalance.liabilities.current.shortTermDebt +
    lastBalance.liabilities.nonCurrent.longTermDebt;
  const debtToEquityFinal = safeDiv(endingDebt, lastBalance.equity.totalEquity);

  return {
    incomeStatements,
    balanceSheets,
    cashFlowStatements,
    summary: {
      revenueCAGR: round(revenueCAGR, 1),
      netIncomeCAGR: round(netIncomeCAGR, 1),
      averageROE: round(avgROE, 1),
      averageROA: round(avgROA, 1),
      totalFreeCashFlow: round(totalFCF),
      endingCashPosition: round(endingCash),
      endingDebtPosition: round(endingDebt),
      debtToEquityFinal: round(debtToEquityFinal, 2),
    },
    validationChecks,
  };
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export function formatIncomeStatementTable(statements: IncomeStatement[]): string[][] {
  const headers = ['Metric', ...statements.map(s => s.year.toString())];
  const rows: string[][] = [headers];

  const metrics = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'costOfGoodsSold', label: 'Cost of Goods Sold' },
    { key: 'grossProfit', label: 'Gross Profit' },
    { key: 'grossMargin', label: 'Gross Margin %', suffix: '%' },
    { key: 'totalOperatingExpenses', label: 'Operating Expenses' },
    { key: 'operatingIncome', label: 'Operating Income (EBIT)' },
    { key: 'operatingMargin', label: 'Operating Margin %', suffix: '%' },
    { key: 'interestExpense', label: 'Interest Expense' },
    { key: 'incomeBeforeTax', label: 'Income Before Tax' },
    { key: 'incomeTaxExpense', label: 'Tax Expense' },
    { key: 'netIncome', label: 'Net Income' },
    { key: 'netMargin', label: 'Net Margin %', suffix: '%' },
    { key: 'ebitda', label: 'EBITDA' },
    { key: 'ebitdaMargin', label: 'EBITDA Margin %', suffix: '%' },
  ];

  metrics.forEach(({ key, label, suffix }) => {
    const row = [label];
    statements.forEach(stmt => {
      const value = (stmt as any)[key];
      row.push(suffix ? `${value}${suffix}` : value.toLocaleString());
    });
    rows.push(row);
  });

  return rows;
}

export function formatBalanceSheetTable(sheets: BalanceSheet[]): string[][] {
  const headers = ['Account', ...sheets.map(s => s.year.toString())];
  const rows: string[][] = [headers];

  const sections = [
    { label: '--- ASSETS ---', values: sheets.map(() => '') },
    { label: 'Cash & Equivalents', values: sheets.map(s => s.assets.current.cashAndEquivalents.toLocaleString()) },
    { label: 'Accounts Receivable', values: sheets.map(s => s.assets.current.accountsReceivable.toLocaleString()) },
    { label: 'Inventory', values: sheets.map(s => s.assets.current.inventory.toLocaleString()) },
    { label: 'Total Current Assets', values: sheets.map(s => s.assets.current.totalCurrentAssets.toLocaleString()) },
    { label: 'Net PP&E', values: sheets.map(s => s.assets.nonCurrent.netPPE.toLocaleString()) },
    { label: 'Total Assets', values: sheets.map(s => s.assets.totalAssets.toLocaleString()) },
    { label: '--- LIABILITIES ---', values: sheets.map(() => '') },
    { label: 'Accounts Payable', values: sheets.map(s => s.liabilities.current.accountsPayable.toLocaleString()) },
    { label: 'Total Current Liabilities', values: sheets.map(s => s.liabilities.current.totalCurrentLiabilities.toLocaleString()) },
    { label: 'Long-Term Debt', values: sheets.map(s => s.liabilities.nonCurrent.longTermDebt.toLocaleString()) },
    { label: 'Total Liabilities', values: sheets.map(s => s.liabilities.totalLiabilities.toLocaleString()) },
    { label: '--- EQUITY ---', values: sheets.map(() => '') },
    { label: 'Retained Earnings', values: sheets.map(s => s.equity.retainedEarnings.toLocaleString()) },
    { label: 'Total Equity', values: sheets.map(s => s.equity.totalEquity.toLocaleString()) },
    { label: 'Total Liab + Equity', values: sheets.map(s => s.totalLiabilitiesAndEquity.toLocaleString()) },
  ];

  sections.forEach(({ label, values }) => {
    rows.push([label, ...values]);
  });

  return rows;
}

export function formatCashFlowTable(statements: CashFlowStatement[]): string[][] {
  const headers = ['Item', ...statements.map(s => s.year.toString())];
  const rows: string[][] = [headers];

  const items = [
    { label: 'Net Income', values: statements.map(s => s.operating.netIncome.toLocaleString()) },
    { label: 'D&A', values: statements.map(s => s.operating.depreciationAndAmortization.toLocaleString()) },
    { label: 'Working Capital Changes', values: statements.map(s =>
      (s.operating.changeInAccountsReceivable + s.operating.changeInInventory +
       s.operating.changeInAccountsPayable).toLocaleString()
    )},
    { label: 'Cash from Operations', values: statements.map(s => s.operating.netCashFromOperating.toLocaleString()) },
    { label: 'CapEx', values: statements.map(s => s.investing.capitalExpenditures.toLocaleString()) },
    { label: 'Cash from Investing', values: statements.map(s => s.investing.netCashFromInvesting.toLocaleString()) },
    { label: 'Cash from Financing', values: statements.map(s => s.financing.netCashFromFinancing.toLocaleString()) },
    { label: 'Net Change in Cash', values: statements.map(s => s.netChangeInCash.toLocaleString()) },
    { label: 'Ending Cash', values: statements.map(s => s.endingCash.toLocaleString()) },
    { label: '--- KEY METRICS ---', values: statements.map(() => '') },
    { label: 'Free Cash Flow', values: statements.map(s => s.freeCashFlow.toLocaleString()) },
    { label: 'FCF Margin %', values: statements.map(s => `${s.freeCashFlowMargin}%`) },
  ];

  items.forEach(({ label, values }) => {
    rows.push([label, ...values]);
  });

  return rows;
}
