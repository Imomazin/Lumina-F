// Comprehensive Financial Data Schema
// World-class 3-statement financial model with advanced analysis capabilities

import { z } from 'zod';

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const INDUSTRIES = [
  'technology',
  'healthcare',
  'financial_services',
  'retail',
  'manufacturing',
  'energy',
  'real_estate',
  'telecommunications',
  'consumer_goods',
  'professional_services',
  'media_entertainment',
  'transportation',
  'hospitality',
  'education',
  'agriculture',
  'construction',
  'pharmaceuticals',
  'aerospace_defense',
  'automotive',
  'utilities',
] as const;

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD',
  'CNY', 'HKD', 'SGD', 'INR', 'BRL', 'MXN', 'KRW'
] as const;

export const REVENUE_MODELS = [
  'subscription',
  'transactional',
  'licensing',
  'services',
  'product_sales',
  'marketplace',
  'advertising',
  'freemium',
  'hybrid',
] as const;

export const COMPANY_STAGES = [
  'startup',
  'growth',
  'mature',
  'turnaround',
  'declining',
] as const;

export const FISCAL_YEAR_ENDS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
] as const;

// =============================================================================
// COMPANY PROFILE SCHEMA
// =============================================================================

export const companyProfileSchema = z.object({
  // Basic Information
  companyName: z.string().min(1, 'Company name is required').max(100),
  ticker: z.string().max(10).optional(),
  industry: z.enum(INDUSTRIES),
  subIndustry: z.string().max(50).optional(),
  revenueModel: z.enum(REVENUE_MODELS),
  companyStage: z.enum(COMPANY_STAGES),

  // Geography & Structure
  headquarters: z.string().max(100).optional(),
  operatingCountries: z.number().min(1).max(200).default(1),
  employees: z.number().min(0).optional(),
  foundedYear: z.number().min(1800).max(2100).optional(),

  // Financial Settings
  currency: z.enum(CURRENCIES).default('USD'),
  fiscalYearEnd: z.enum(FISCAL_YEAR_ENDS).default('dec'),
  reportingBasis: z.enum(['gaap', 'ifrs', 'other']).default('gaap'),

  // Time Horizon
  baseYear: z.number().min(2000).max(2100),
  forecastYears: z.number().min(1).max(10).default(5),
  historicalYears: z.number().min(0).max(5).default(0),
});

// =============================================================================
// INCOME STATEMENT SCHEMA
// =============================================================================

export const revenueStreamSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['product', 'service', 'subscription', 'licensing', 'other']),
  baseAmount: z.number().min(0),
  growthRates: z.array(z.number()), // Growth rate per forecast year
  seasonalityFactors: z.array(z.number()).optional(), // Q1-Q4 factors
  pricePerUnit: z.number().optional(),
  unitVolume: z.number().optional(),
  unitGrowthRate: z.number().optional(),
  priceGrowthRate: z.number().optional(),
});

export const costItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.enum([
    'cogs_materials',
    'cogs_labor',
    'cogs_overhead',
    'cogs_other',
    'opex_sales_marketing',
    'opex_research_development',
    'opex_general_admin',
    'opex_depreciation',
    'opex_amortization',
    'opex_other',
  ]),
  costType: z.enum(['fixed', 'variable', 'semi_variable']),
  baseAmount: z.number(),
  revenuePercent: z.number().min(0).max(100).optional(), // For variable costs
  growthRate: z.number().optional(), // Annual growth for fixed costs
  inflationLinked: z.boolean().default(false),
});

export const incomeStatementSchema = z.object({
  // Revenue Configuration
  revenueStreams: z.array(revenueStreamSchema).min(1),
  otherIncome: z.number().default(0),

  // Cost of Goods Sold
  costItems: z.array(costItemSchema),

  // Operating Expenses (can also use costItems with opex_ categories)

  // Below the Line
  interestIncome: z.number().default(0),
  interestExpenseRate: z.number().min(0).max(100).default(5),
  otherNonOperating: z.number().default(0),

  // Tax
  effectiveTaxRate: z.number().min(0).max(100).default(25),
  taxCredits: z.number().default(0),
  nolCarryforward: z.number().default(0), // Net Operating Loss

  // Extraordinary Items
  extraordinaryItems: z.number().default(0),
  discontinuedOperations: z.number().default(0),
});

// =============================================================================
// BALANCE SHEET SCHEMA
// =============================================================================

export const balanceSheetSchema = z.object({
  // ASSETS - Current
  cashAndEquivalents: z.number().min(0).default(0),
  shortTermInvestments: z.number().min(0).default(0),
  accountsReceivable: z.number().min(0).default(0),
  inventory: z.number().min(0).default(0),
  prepaidExpenses: z.number().min(0).default(0),
  otherCurrentAssets: z.number().min(0).default(0),

  // ASSETS - Non-Current
  propertyPlantEquipment: z.number().min(0).default(0),
  accumulatedDepreciation: z.number().min(0).default(0),
  intangibleAssets: z.number().min(0).default(0),
  goodwill: z.number().min(0).default(0),
  longTermInvestments: z.number().min(0).default(0),
  deferredTaxAssets: z.number().min(0).default(0),
  otherNonCurrentAssets: z.number().min(0).default(0),

  // LIABILITIES - Current
  accountsPayable: z.number().min(0).default(0),
  shortTermDebt: z.number().min(0).default(0),
  currentPortionLongTermDebt: z.number().min(0).default(0),
  accruedExpenses: z.number().min(0).default(0),
  deferredRevenue: z.number().min(0).default(0),
  otherCurrentLiabilities: z.number().min(0).default(0),

  // LIABILITIES - Non-Current
  longTermDebt: z.number().min(0).default(0),
  deferredTaxLiabilities: z.number().min(0).default(0),
  pensionObligations: z.number().min(0).default(0),
  otherNonCurrentLiabilities: z.number().min(0).default(0),

  // EQUITY
  commonStock: z.number().default(0),
  additionalPaidInCapital: z.number().default(0),
  retainedEarnings: z.number().default(0),
  treasuryStock: z.number().min(0).default(0),
  accumulatedOtherComprehensiveIncome: z.number().default(0),
  minorityInterest: z.number().default(0),

  // Shares
  sharesOutstanding: z.number().min(0).default(1000000),
  sharesAuthorized: z.number().min(0).optional(),
});

// =============================================================================
// CASH FLOW ASSUMPTIONS SCHEMA
// =============================================================================

export const cashFlowAssumptionsSchema = z.object({
  // Working Capital Days
  daysReceivable: z.number().min(0).max(365).default(45),
  daysInventory: z.number().min(0).max(365).default(60),
  daysPayable: z.number().min(0).max(365).default(30),
  daysDeferred: z.number().min(0).max(365).default(0),

  // Capital Expenditure
  capexMethod: z.enum(['fixed', 'revenue_percent', 'growth_linked']).default('revenue_percent'),
  capexFixed: z.number().min(0).optional(),
  capexRevenuePercent: z.number().min(0).max(50).default(5),
  capexGrowthMultiplier: z.number().min(0).max(5).optional(),
  maintenanceCapexPercent: z.number().min(0).max(100).default(40), // % of capex for maintenance

  // Depreciation & Amortization
  depreciationMethod: z.enum(['straight_line', 'declining_balance', 'units_of_production']).default('straight_line'),
  depreciationYears: z.number().min(1).max(40).default(10),
  amortizationYears: z.number().min(1).max(40).default(15),

  // Financing Activities
  dividendPolicy: z.enum(['none', 'fixed', 'payout_ratio', 'residual']).default('none'),
  dividendAmount: z.number().min(0).optional(),
  dividendPayoutRatio: z.number().min(0).max(100).optional(),
  targetDividendGrowth: z.number().optional(),

  // Debt Management
  debtRepaymentSchedule: z.array(z.object({
    year: z.number(),
    principalPayment: z.number(),
  })).optional(),
  targetDebtToEquity: z.number().min(0).max(10).optional(),
  minimumCashBalance: z.number().min(0).default(0),

  // Share Activity
  shareRepurchases: z.number().min(0).default(0),
  newEquityIssuance: z.number().min(0).default(0),
  optionExercises: z.number().min(0).default(0),
});

// =============================================================================
// SCENARIO SCHEMA
// =============================================================================

export const scenarioSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  type: z.enum(['base', 'upside', 'downside', 'stress', 'custom']),
  probability: z.number().min(0).max(100).default(33),

  // Adjustment Factors (multipliers applied to base case)
  revenueMultiplier: z.number().min(0).max(3).default(1),
  cogsMultiplier: z.number().min(0).max(3).default(1),
  opexMultiplier: z.number().min(0).max(3).default(1),
  growthRateAdjustment: z.number().min(-50).max(50).default(0), // Percentage points
  marginAdjustment: z.number().min(-50).max(50).default(0),

  // Scenario-specific assumptions
  customAssumptions: z.record(z.string(), z.number()).optional(),
});

// =============================================================================
// VALUATION ASSUMPTIONS SCHEMA
// =============================================================================

export const valuationAssumptionsSchema = z.object({
  // Cost of Capital
  riskFreeRate: z.number().min(0).max(20).default(4),
  equityRiskPremium: z.number().min(0).max(15).default(5.5),
  beta: z.number().min(0).max(3).default(1),
  companySpecificRisk: z.number().min(0).max(10).default(0),

  // Cost of Debt
  costOfDebt: z.number().min(0).max(30).default(6),
  taxShieldEnabled: z.boolean().default(true),

  // Capital Structure
  targetDebtWeight: z.number().min(0).max(100).default(30),

  // Terminal Value
  terminalGrowthRate: z.number().min(0).max(10).default(2.5),
  exitMultiple: z.number().min(0).max(30).optional(),
  terminalMethod: z.enum(['gordon_growth', 'exit_multiple', 'both']).default('gordon_growth'),

  // Comparable Companies
  comparableMultiples: z.object({
    evRevenue: z.number().optional(),
    evEbitda: z.number().optional(),
    peRatio: z.number().optional(),
    pbRatio: z.number().optional(),
  }).optional(),
});

// =============================================================================
// COMPLETE FINANCIAL MODEL SCHEMA
// =============================================================================

export const financialModelSchema = z.object({
  // Metadata
  id: z.string(),
  version: z.number().default(1),
  createdAt: z.date(),
  updatedAt: z.date(),

  // Model Components
  profile: companyProfileSchema,
  incomeStatement: incomeStatementSchema,
  balanceSheet: balanceSheetSchema,
  cashFlowAssumptions: cashFlowAssumptionsSchema,
  valuationAssumptions: valuationAssumptionsSchema,

  // Scenarios
  scenarios: z.array(scenarioSchema).default([]),
  activeScenarioId: z.string().optional(),

  // Notes & Documentation
  notes: z.string().max(10000).optional(),
  keyAssumptions: z.array(z.object({
    category: z.string(),
    assumption: z.string(),
    rationale: z.string().optional(),
  })).optional(),

  // Audit Trail
  changeLog: z.array(z.object({
    timestamp: z.date(),
    field: z.string(),
    oldValue: z.any(),
    newValue: z.any(),
    user: z.string().optional(),
  })).optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type CompanyProfile = z.infer<typeof companyProfileSchema>;
export type RevenueStream = z.infer<typeof revenueStreamSchema>;
export type CostItem = z.infer<typeof costItemSchema>;
export type IncomeStatement = z.infer<typeof incomeStatementSchema>;
export type BalanceSheet = z.infer<typeof balanceSheetSchema>;
export type CashFlowAssumptions = z.infer<typeof cashFlowAssumptionsSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type ValuationAssumptions = z.infer<typeof valuationAssumptionsSchema>;
export type FinancialModel = z.infer<typeof financialModelSchema>;

export type Industry = typeof INDUSTRIES[number];
export type Currency = typeof CURRENCIES[number];
export type RevenueModel = typeof REVENUE_MODELS[number];
export type CompanyStage = typeof COMPANY_STAGES[number];

// =============================================================================
// DEFAULT VALUES FACTORY
// =============================================================================

export function createDefaultFinancialModel(): Omit<FinancialModel, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    version: 1,
    profile: {
      companyName: '',
      industry: 'technology',
      revenueModel: 'subscription',
      companyStage: 'growth',
      currency: 'USD',
      fiscalYearEnd: 'dec',
      reportingBasis: 'gaap',
      baseYear: new Date().getFullYear(),
      forecastYears: 5,
      historicalYears: 0,
      operatingCountries: 1,
    },
    incomeStatement: {
      revenueStreams: [{
        id: 'primary',
        name: 'Primary Revenue',
        type: 'product',
        baseAmount: 0,
        growthRates: [10, 10, 10, 10, 10],
      }],
      otherIncome: 0,
      costItems: [],
      interestIncome: 0,
      interestExpenseRate: 5,
      otherNonOperating: 0,
      effectiveTaxRate: 25,
      taxCredits: 0,
      nolCarryforward: 0,
      extraordinaryItems: 0,
      discontinuedOperations: 0,
    },
    balanceSheet: {
      cashAndEquivalents: 0,
      shortTermInvestments: 0,
      accountsReceivable: 0,
      inventory: 0,
      prepaidExpenses: 0,
      otherCurrentAssets: 0,
      propertyPlantEquipment: 0,
      accumulatedDepreciation: 0,
      intangibleAssets: 0,
      goodwill: 0,
      longTermInvestments: 0,
      deferredTaxAssets: 0,
      otherNonCurrentAssets: 0,
      accountsPayable: 0,
      shortTermDebt: 0,
      currentPortionLongTermDebt: 0,
      accruedExpenses: 0,
      deferredRevenue: 0,
      otherCurrentLiabilities: 0,
      longTermDebt: 0,
      deferredTaxLiabilities: 0,
      pensionObligations: 0,
      otherNonCurrentLiabilities: 0,
      commonStock: 0,
      additionalPaidInCapital: 0,
      retainedEarnings: 0,
      treasuryStock: 0,
      accumulatedOtherComprehensiveIncome: 0,
      minorityInterest: 0,
      sharesOutstanding: 1000000,
    },
    cashFlowAssumptions: {
      daysReceivable: 45,
      daysInventory: 60,
      daysPayable: 30,
      daysDeferred: 0,
      capexMethod: 'revenue_percent',
      capexRevenuePercent: 5,
      maintenanceCapexPercent: 40,
      depreciationMethod: 'straight_line',
      depreciationYears: 10,
      amortizationYears: 15,
      dividendPolicy: 'none',
      minimumCashBalance: 0,
      shareRepurchases: 0,
      newEquityIssuance: 0,
      optionExercises: 0,
    },
    valuationAssumptions: {
      riskFreeRate: 4,
      equityRiskPremium: 5.5,
      beta: 1,
      companySpecificRisk: 0,
      costOfDebt: 6,
      taxShieldEnabled: true,
      targetDebtWeight: 30,
      terminalGrowthRate: 2.5,
      terminalMethod: 'gordon_growth',
    },
    scenarios: [
      {
        id: 'base',
        name: 'Base Case',
        type: 'base',
        probability: 50,
        revenueMultiplier: 1,
        cogsMultiplier: 1,
        opexMultiplier: 1,
        growthRateAdjustment: 0,
        marginAdjustment: 0,
      },
      {
        id: 'upside',
        name: 'Upside Case',
        type: 'upside',
        probability: 25,
        revenueMultiplier: 1.15,
        cogsMultiplier: 0.97,
        opexMultiplier: 0.95,
        growthRateAdjustment: 5,
        marginAdjustment: 2,
      },
      {
        id: 'downside',
        name: 'Downside Case',
        type: 'downside',
        probability: 25,
        revenueMultiplier: 0.85,
        cogsMultiplier: 1.03,
        opexMultiplier: 1.05,
        growthRateAdjustment: -5,
        marginAdjustment: -2,
      },
    ],
    activeScenarioId: 'base',
  };
}

// =============================================================================
// INDUSTRY BENCHMARKS
// =============================================================================

export const INDUSTRY_BENCHMARKS: Record<Industry, {
  grossMargin: { low: number; median: number; high: number };
  ebitdaMargin: { low: number; median: number; high: number };
  netMargin: { low: number; median: number; high: number };
  revenueGrowth: { low: number; median: number; high: number };
  roic: { low: number; median: number; high: number };
  evRevenue: { low: number; median: number; high: number };
  evEbitda: { low: number; median: number; high: number };
}> = {
  technology: {
    grossMargin: { low: 55, median: 70, high: 85 },
    ebitdaMargin: { low: 15, median: 25, high: 40 },
    netMargin: { low: 8, median: 18, high: 30 },
    revenueGrowth: { low: 10, median: 20, high: 40 },
    roic: { low: 10, median: 20, high: 35 },
    evRevenue: { low: 3, median: 8, high: 15 },
    evEbitda: { low: 12, median: 20, high: 35 },
  },
  healthcare: {
    grossMargin: { low: 40, median: 55, high: 70 },
    ebitdaMargin: { low: 12, median: 20, high: 30 },
    netMargin: { low: 6, median: 12, high: 20 },
    revenueGrowth: { low: 5, median: 10, high: 20 },
    roic: { low: 8, median: 15, high: 25 },
    evRevenue: { low: 2, median: 4, high: 8 },
    evEbitda: { low: 10, median: 15, high: 25 },
  },
  financial_services: {
    grossMargin: { low: 50, median: 65, high: 80 },
    ebitdaMargin: { low: 20, median: 35, high: 50 },
    netMargin: { low: 15, median: 25, high: 35 },
    revenueGrowth: { low: 3, median: 8, high: 15 },
    roic: { low: 8, median: 12, high: 18 },
    evRevenue: { low: 2, median: 4, high: 7 },
    evEbitda: { low: 8, median: 12, high: 18 },
  },
  retail: {
    grossMargin: { low: 25, median: 35, high: 50 },
    ebitdaMargin: { low: 5, median: 10, high: 18 },
    netMargin: { low: 2, median: 5, high: 10 },
    revenueGrowth: { low: 2, median: 6, high: 15 },
    roic: { low: 8, median: 15, high: 25 },
    evRevenue: { low: 0.5, median: 1, high: 2 },
    evEbitda: { low: 6, median: 10, high: 15 },
  },
  manufacturing: {
    grossMargin: { low: 20, median: 30, high: 45 },
    ebitdaMargin: { low: 8, median: 15, high: 22 },
    netMargin: { low: 4, median: 8, high: 14 },
    revenueGrowth: { low: 2, median: 5, high: 12 },
    roic: { low: 6, median: 12, high: 20 },
    evRevenue: { low: 0.8, median: 1.5, high: 2.5 },
    evEbitda: { low: 6, median: 9, high: 14 },
  },
  energy: {
    grossMargin: { low: 30, median: 45, high: 60 },
    ebitdaMargin: { low: 15, median: 25, high: 40 },
    netMargin: { low: 5, median: 12, high: 22 },
    revenueGrowth: { low: -5, median: 5, high: 15 },
    roic: { low: 5, median: 10, high: 18 },
    evRevenue: { low: 1, median: 2, high: 4 },
    evEbitda: { low: 4, median: 7, high: 12 },
  },
  real_estate: {
    grossMargin: { low: 40, median: 55, high: 70 },
    ebitdaMargin: { low: 30, median: 45, high: 60 },
    netMargin: { low: 15, median: 25, high: 40 },
    revenueGrowth: { low: 2, median: 5, high: 12 },
    roic: { low: 4, median: 8, high: 14 },
    evRevenue: { low: 3, median: 6, high: 10 },
    evEbitda: { low: 10, median: 15, high: 22 },
  },
  telecommunications: {
    grossMargin: { low: 45, median: 58, high: 72 },
    ebitdaMargin: { low: 25, median: 35, high: 45 },
    netMargin: { low: 8, median: 15, high: 22 },
    revenueGrowth: { low: 1, median: 4, high: 10 },
    roic: { low: 5, median: 10, high: 16 },
    evRevenue: { low: 1.5, median: 2.5, high: 4 },
    evEbitda: { low: 5, median: 7, high: 11 },
  },
  consumer_goods: {
    grossMargin: { low: 35, median: 48, high: 62 },
    ebitdaMargin: { low: 10, median: 18, high: 28 },
    netMargin: { low: 5, median: 10, high: 18 },
    revenueGrowth: { low: 2, median: 6, high: 12 },
    roic: { low: 10, median: 18, high: 30 },
    evRevenue: { low: 1, median: 2, high: 4 },
    evEbitda: { low: 8, median: 12, high: 18 },
  },
  professional_services: {
    grossMargin: { low: 40, median: 55, high: 70 },
    ebitdaMargin: { low: 12, median: 20, high: 30 },
    netMargin: { low: 8, median: 14, high: 22 },
    revenueGrowth: { low: 5, median: 10, high: 20 },
    roic: { low: 15, median: 25, high: 40 },
    evRevenue: { low: 1, median: 2, high: 4 },
    evEbitda: { low: 8, median: 12, high: 18 },
  },
  media_entertainment: {
    grossMargin: { low: 35, median: 50, high: 68 },
    ebitdaMargin: { low: 10, median: 20, high: 35 },
    netMargin: { low: 5, median: 12, high: 22 },
    revenueGrowth: { low: 3, median: 8, high: 18 },
    roic: { low: 8, median: 15, high: 25 },
    evRevenue: { low: 1.5, median: 3, high: 6 },
    evEbitda: { low: 8, median: 14, high: 22 },
  },
  transportation: {
    grossMargin: { low: 15, median: 25, high: 40 },
    ebitdaMargin: { low: 8, median: 15, high: 25 },
    netMargin: { low: 3, median: 7, high: 14 },
    revenueGrowth: { low: 2, median: 5, high: 12 },
    roic: { low: 5, median: 10, high: 18 },
    evRevenue: { low: 0.5, median: 1, high: 2 },
    evEbitda: { low: 5, median: 8, high: 12 },
  },
  hospitality: {
    grossMargin: { low: 55, median: 68, high: 80 },
    ebitdaMargin: { low: 12, median: 22, high: 35 },
    netMargin: { low: 5, median: 12, high: 20 },
    revenueGrowth: { low: 2, median: 6, high: 15 },
    roic: { low: 6, median: 12, high: 20 },
    evRevenue: { low: 1.5, median: 3, high: 5 },
    evEbitda: { low: 8, median: 12, high: 18 },
  },
  education: {
    grossMargin: { low: 40, median: 55, high: 70 },
    ebitdaMargin: { low: 8, median: 15, high: 25 },
    netMargin: { low: 4, median: 10, high: 18 },
    revenueGrowth: { low: 3, median: 8, high: 18 },
    roic: { low: 8, median: 15, high: 25 },
    evRevenue: { low: 1, median: 2, high: 4 },
    evEbitda: { low: 8, median: 12, high: 18 },
  },
  agriculture: {
    grossMargin: { low: 15, median: 25, high: 40 },
    ebitdaMargin: { low: 8, median: 15, high: 25 },
    netMargin: { low: 3, median: 8, high: 15 },
    revenueGrowth: { low: 2, median: 5, high: 12 },
    roic: { low: 5, median: 10, high: 18 },
    evRevenue: { low: 0.5, median: 1, high: 2 },
    evEbitda: { low: 5, median: 8, high: 14 },
  },
  construction: {
    grossMargin: { low: 12, median: 20, high: 32 },
    ebitdaMargin: { low: 5, median: 10, high: 18 },
    netMargin: { low: 2, median: 5, high: 10 },
    revenueGrowth: { low: 2, median: 6, high: 15 },
    roic: { low: 8, median: 15, high: 25 },
    evRevenue: { low: 0.3, median: 0.6, high: 1.2 },
    evEbitda: { low: 4, median: 7, high: 12 },
  },
  pharmaceuticals: {
    grossMargin: { low: 60, median: 72, high: 85 },
    ebitdaMargin: { low: 20, median: 32, high: 45 },
    netMargin: { low: 12, median: 22, high: 35 },
    revenueGrowth: { low: 3, median: 8, high: 18 },
    roic: { low: 10, median: 18, high: 30 },
    evRevenue: { low: 3, median: 5, high: 10 },
    evEbitda: { low: 10, median: 16, high: 25 },
  },
  aerospace_defense: {
    grossMargin: { low: 18, median: 28, high: 40 },
    ebitdaMargin: { low: 10, median: 15, high: 22 },
    netMargin: { low: 5, median: 10, high: 16 },
    revenueGrowth: { low: 2, median: 5, high: 10 },
    roic: { low: 8, median: 14, high: 22 },
    evRevenue: { low: 1, median: 1.8, high: 3 },
    evEbitda: { low: 8, median: 12, high: 18 },
  },
  automotive: {
    grossMargin: { low: 12, median: 18, high: 28 },
    ebitdaMargin: { low: 5, median: 10, high: 16 },
    netMargin: { low: 2, median: 5, high: 10 },
    revenueGrowth: { low: 1, median: 4, high: 10 },
    roic: { low: 5, median: 10, high: 18 },
    evRevenue: { low: 0.3, median: 0.6, high: 1.2 },
    evEbitda: { low: 4, median: 7, high: 12 },
  },
  utilities: {
    grossMargin: { low: 30, median: 42, high: 55 },
    ebitdaMargin: { low: 25, median: 35, high: 48 },
    netMargin: { low: 10, median: 18, high: 28 },
    revenueGrowth: { low: 1, median: 3, high: 7 },
    roic: { low: 4, median: 7, high: 11 },
    evRevenue: { low: 2, median: 3.5, high: 5 },
    evEbitda: { low: 8, median: 11, high: 15 },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getIndustryLabel(industry: Industry): string {
  const labels: Record<Industry, string> = {
    technology: 'Technology',
    healthcare: 'Healthcare',
    financial_services: 'Financial Services',
    retail: 'Retail & E-commerce',
    manufacturing: 'Manufacturing',
    energy: 'Energy & Utilities',
    real_estate: 'Real Estate',
    telecommunications: 'Telecommunications',
    consumer_goods: 'Consumer Goods',
    professional_services: 'Professional Services',
    media_entertainment: 'Media & Entertainment',
    transportation: 'Transportation & Logistics',
    hospitality: 'Hospitality & Travel',
    education: 'Education',
    agriculture: 'Agriculture',
    construction: 'Construction',
    pharmaceuticals: 'Pharmaceuticals',
    aerospace_defense: 'Aerospace & Defense',
    automotive: 'Automotive',
    utilities: 'Utilities',
  };
  return labels[industry];
}

export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CHF: 'CHF',
    CAD: 'C$', AUD: 'A$', CNY: '¥', HKD: 'HK$', SGD: 'S$',
    INR: '₹', BRL: 'R$', MXN: 'MX$', KRW: '₩',
  };
  return symbols[currency];
}
