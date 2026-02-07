// Demo Financial Model - TechVentures Inc.
// A realistic SaaS company example to demonstrate all outputs

import { FinancialModel } from './models/financial-model';

export function createDemoFinancialModel(): FinancialModel {
  return {
    id: 'demo-techventures',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),

    profile: {
      companyName: 'TechVentures Inc.',
      ticker: 'TVNT',
      industry: 'technology',
      subIndustry: 'Enterprise SaaS',
      revenueModel: 'subscription',
      companyStage: 'growth',
      headquarters: 'San Francisco, CA',
      operatingCountries: 15,
      employees: 450,
      foundedYear: 2018,
      currency: 'USD',
      fiscalYearEnd: 'dec',
      reportingBasis: 'gaap',
      baseYear: 2024,
      forecastYears: 5,
      historicalYears: 0,
    },

    incomeStatement: {
      revenueStreams: [
        {
          id: 'saas-subscription',
          name: 'SaaS Subscriptions',
          type: 'subscription',
          baseAmount: 45000000, // $45M ARR
          growthRates: [35, 28, 22, 18, 15], // Decelerating growth typical for SaaS
          pricePerUnit: 12000, // $12K average contract value
          unitVolume: 3750, // customers
          unitGrowthRate: 25,
          priceGrowthRate: 8,
        },
        {
          id: 'professional-services',
          name: 'Professional Services',
          type: 'service',
          baseAmount: 8500000, // $8.5M
          growthRates: [20, 18, 15, 12, 10],
        },
        {
          id: 'marketplace-fees',
          name: 'Marketplace & Add-ons',
          type: 'other',
          baseAmount: 3200000, // $3.2M
          growthRates: [45, 40, 35, 30, 25], // Higher growth from new revenue stream
        },
      ],
      otherIncome: 250000,

      costItems: [
        // COGS
        {
          id: 'hosting-infra',
          name: 'Cloud Infrastructure',
          category: 'cogs_materials',
          costType: 'variable',
          baseAmount: 0,
          revenuePercent: 12,
          inflationLinked: false,
        },
        {
          id: 'customer-support',
          name: 'Customer Support',
          category: 'cogs_labor',
          costType: 'semi_variable',
          baseAmount: 2800000,
          revenuePercent: 3,
          growthRate: 8,
          inflationLinked: true,
        },
        {
          id: 'payment-processing',
          name: 'Payment Processing',
          category: 'cogs_other',
          costType: 'variable',
          baseAmount: 0,
          revenuePercent: 2.5,
          inflationLinked: false,
        },
        // OPEX
        {
          id: 'sales-marketing',
          name: 'Sales & Marketing',
          category: 'opex_sales_marketing',
          costType: 'semi_variable',
          baseAmount: 12000000,
          revenuePercent: 8,
          growthRate: 15,
          inflationLinked: false,
        },
        {
          id: 'research-development',
          name: 'R&D / Engineering',
          category: 'opex_research_development',
          costType: 'fixed',
          baseAmount: 14500000,
          growthRate: 18,
          inflationLinked: false,
        },
        {
          id: 'general-admin',
          name: 'G&A / Corporate',
          category: 'opex_general_admin',
          costType: 'semi_variable',
          baseAmount: 5500000,
          revenuePercent: 2,
          growthRate: 10,
          inflationLinked: true,
        },
      ],

      interestIncome: 180000,
      interestExpenseRate: 5.5,
      otherNonOperating: 0,
      effectiveTaxRate: 22,
      taxCredits: 500000,
      nolCarryforward: 2000000,
      extraordinaryItems: 0,
      discontinuedOperations: 0,
    },

    balanceSheet: {
      cashAndEquivalents: 28000000,
      shortTermInvestments: 12000000,
      accountsReceivable: 9500000,
      inventory: 0,
      prepaidExpenses: 1800000,
      otherCurrentAssets: 500000,
      propertyPlantEquipment: 8500000,
      accumulatedDepreciation: 2200000,
      intangibleAssets: 15000000,
      goodwill: 8000000,
      longTermInvestments: 3000000,
      deferredTaxAssets: 1200000,
      otherNonCurrentAssets: 800000,
      accountsPayable: 3200000,
      shortTermDebt: 0,
      currentPortionLongTermDebt: 2000000,
      accruedExpenses: 4500000,
      deferredRevenue: 18500000, // Strong deferred revenue for SaaS
      otherCurrentLiabilities: 1500000,
      longTermDebt: 15000000,
      deferredTaxLiabilities: 800000,
      pensionObligations: 0,
      otherNonCurrentLiabilities: 1200000,
      commonStock: 100000,
      additionalPaidInCapital: 45000000,
      retainedEarnings: -8500000, // Still burning some cash in growth phase
      treasuryStock: 0,
      accumulatedOtherComprehensiveIncome: 0,
      minorityInterest: 0,
      sharesOutstanding: 52000000,
    },

    cashFlowAssumptions: {
      daysReceivable: 62,
      daysInventory: 0,
      daysPayable: 35,
      daysDeferred: 120, // Strong deferred revenue typical for annual SaaS contracts
      capexMethod: 'revenue_percent',
      capexRevenuePercent: 4,
      maintenanceCapexPercent: 30,
      depreciationMethod: 'straight_line',
      depreciationYears: 7,
      amortizationYears: 10,
      dividendPolicy: 'none',
      minimumCashBalance: 5000000,
      shareRepurchases: 0,
      newEquityIssuance: 0,
      optionExercises: 1500000,
    },

    valuationAssumptions: {
      riskFreeRate: 4.25,
      equityRiskPremium: 5.75,
      beta: 1.35, // Higher beta typical for growth tech
      companySpecificRisk: 2,
      costOfDebt: 6.5,
      taxShieldEnabled: true,
      targetDebtWeight: 20,
      terminalGrowthRate: 3,
      terminalMethod: 'gordon_growth',
      exitMultiple: 12,
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
        id: 'bull',
        name: 'Bull Case',
        type: 'upside',
        probability: 25,
        revenueMultiplier: 1.25,
        cogsMultiplier: 0.95,
        opexMultiplier: 0.95,
        growthRateAdjustment: 8,
        marginAdjustment: 4,
      },
      {
        id: 'bear',
        name: 'Bear Case',
        type: 'downside',
        probability: 25,
        revenueMultiplier: 0.8,
        cogsMultiplier: 1.1,
        opexMultiplier: 1.1,
        growthRateAdjustment: -10,
        marginAdjustment: -3,
      },
    ],
  };
}

// Quick stats about the demo company for display
export const DEMO_COMPANY_INFO = {
  name: 'TechVentures Inc.',
  description: 'Enterprise SaaS platform for workflow automation',
  highlights: [
    '$56.7M in revenue',
    '35% YoY growth',
    'Rule of 40: 52',
    '3,750+ customers',
    '120%+ net revenue retention',
  ],
};
