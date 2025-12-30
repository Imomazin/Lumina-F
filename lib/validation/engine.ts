/**
 * Enhanced Validation Engine
 *
 * Comprehensive cross-field validation, sanity checks, and data quality scoring
 * for financial inputs and projections
 */

import { AnalysisSession } from '../schema';
import { ForecastResult } from '../finance/forecast';

// ============================================================================
// TYPES
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ValidationResult {
  id: string;
  field?: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  title: string;
  message: string;
  suggestion?: string;
  value?: number | string;
  threshold?: number | string;
  autoFix?: () => Partial<AnalysisSession>;
}

export type ValidationCategory =
  | 'required'
  | 'range'
  | 'consistency'
  | 'sanity'
  | 'ratio'
  | 'trend'
  | 'benchmark'
  | 'completeness';

export interface ValidationSummary {
  isValid: boolean;
  score: number; // 0-100 data quality score
  grade: string; // A-F
  results: ValidationResult[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  categories: {
    category: ValidationCategory;
    passed: number;
    failed: number;
    score: number;
  }[];
}

export interface SanityCheck {
  name: string;
  check: (inputs: AnalysisSession) => boolean;
  message: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  suggestion?: string;
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

const SANITY_CHECKS: SanityCheck[] = [
  // Revenue checks
  {
    name: 'revenue-positive',
    check: (i) => i.currentRevenue > 0,
    message: 'Current revenue must be greater than zero',
    severity: 'error',
    category: 'required',
    suggestion: 'Enter a positive revenue figure',
  },
  {
    name: 'revenue-reasonable-max',
    check: (i) => i.currentRevenue < 1e12, // Less than $1 trillion
    message: 'Revenue exceeds maximum reasonable value',
    severity: 'error',
    category: 'sanity',
    suggestion: 'Verify revenue is in correct units (not in thousands)',
  },
  {
    name: 'growth-reasonable',
    check: (i) => i.revenueGrowthAssumption >= -50 && i.revenueGrowthAssumption <= 200,
    message: 'Revenue growth rate is outside typical range (-50% to 200%)',
    severity: 'warning',
    category: 'range',
    suggestion: 'Growth rates outside this range are rare; verify assumptions',
  },
  {
    name: 'growth-sustainable',
    check: (i) => i.revenueGrowthAssumption <= 100 || i.currentRevenue < 1e9,
    message: 'Growth above 100% is unsustainable for large companies',
    severity: 'warning',
    category: 'sanity',
    suggestion: 'Consider reducing growth rate as company scales',
  },

  // COGS checks
  {
    name: 'cogs-positive',
    check: (i) => i.currentCOGS >= 0,
    message: 'Cost of Goods Sold cannot be negative',
    severity: 'error',
    category: 'range',
  },
  {
    name: 'cogs-less-than-revenue',
    check: (i) => i.currentCOGS < i.currentRevenue,
    message: 'COGS exceeds revenue (negative gross margin)',
    severity: 'error',
    category: 'consistency',
    suggestion: 'Reduce COGS or verify revenue figures',
  },
  {
    name: 'gross-margin-reasonable',
    check: (i) => {
      const margin = (i.currentRevenue - i.currentCOGS) / i.currentRevenue;
      return margin >= 0 && margin <= 0.95;
    },
    message: 'Gross margin is outside typical range (0% to 95%)',
    severity: 'warning',
    category: 'range',
    suggestion: 'Very high gross margins (>90%) are unusual; verify inputs',
  },

  // OpEx checks
  {
    name: 'opex-positive',
    check: (i) => i.currentOpex >= 0,
    message: 'Operating expenses cannot be negative',
    severity: 'error',
    category: 'range',
  },
  {
    name: 'opex-reasonable',
    check: (i) => i.currentOpex < i.currentRevenue * 2,
    message: 'Operating expenses exceed 200% of revenue',
    severity: 'warning',
    category: 'sanity',
    suggestion: 'Very high opex relative to revenue may indicate early-stage company',
  },
  {
    name: 'operating-margin-check',
    check: (i) => {
      const grossProfit = i.currentRevenue - i.currentCOGS;
      const ebit = grossProfit - i.currentOpex;
      const opMargin = ebit / i.currentRevenue;
      return opMargin > -1; // More than -100%
    },
    message: 'Operating losses exceed revenue (highly unusual)',
    severity: 'warning',
    category: 'sanity',
  },

  // Working Capital checks
  {
    name: 'days-receivable-range',
    check: (i) => (i.daysReceivable ?? 30) >= 0 && (i.daysReceivable ?? 30) <= 180,
    message: 'Days receivable outside normal range (0-180 days)',
    severity: 'warning',
    category: 'range',
    suggestion: 'Most companies collect receivables within 90 days',
  },
  {
    name: 'days-payable-range',
    check: (i) => (i.daysPayable ?? 30) >= 0 && (i.daysPayable ?? 30) <= 180,
    message: 'Days payable outside normal range (0-180 days)',
    severity: 'warning',
    category: 'range',
  },
  {
    name: 'days-inventory-range',
    check: (i) => (i.daysInventory ?? 45) >= 0 && (i.daysInventory ?? 45) <= 365,
    message: 'Days inventory outside normal range (0-365 days)',
    severity: 'warning',
    category: 'range',
  },
  {
    name: 'cash-conversion-reasonable',
    check: (i) => {
      const ccc = (i.daysReceivable ?? 30) + (i.daysInventory ?? 45) - (i.daysPayable ?? 30);
      return ccc > -90 && ccc < 180;
    },
    message: 'Cash conversion cycle is unusual (should be -90 to 180 days)',
    severity: 'info',
    category: 'ratio',
  },

  // Debt checks
  {
    name: 'debt-non-negative',
    check: (i) => i.debtOutstanding >= 0,
    message: 'Debt cannot be negative',
    severity: 'error',
    category: 'range',
  },
  {
    name: 'interest-rate-range',
    check: (i) => i.interestRatePct >= 0 && i.interestRatePct <= 30,
    message: 'Interest rate outside typical range (0% to 30%)',
    severity: 'warning',
    category: 'range',
    suggestion: 'Interest rates above 20% are unusually high',
  },
  {
    name: 'debt-to-revenue-check',
    check: (i) => i.debtOutstanding < i.currentRevenue * 10,
    message: 'Debt exceeds 10x revenue (extremely leveraged)',
    severity: 'warning',
    category: 'ratio',
    suggestion: 'Very high debt levels increase financial risk',
  },

  // Tax checks
  {
    name: 'tax-rate-range',
    check: (i) => i.taxRatePct >= 0 && i.taxRatePct <= 50,
    message: 'Tax rate outside typical range (0% to 50%)',
    severity: 'warning',
    category: 'range',
    suggestion: 'Most corporate tax rates fall between 15% and 35%',
  },

  // CapEx checks
  {
    name: 'capex-non-negative',
    check: (i) => i.annualCapex >= 0,
    message: 'Capital expenditure cannot be negative',
    severity: 'error',
    category: 'range',
  },
  {
    name: 'capex-reasonable',
    check: (i) => i.annualCapex < i.currentRevenue * 0.5,
    message: 'CapEx exceeds 50% of revenue (very capital intensive)',
    severity: 'info',
    category: 'sanity',
    suggestion: 'High CapEx may indicate growth phase or capital-intensive industry',
  },

  // Horizon checks
  {
    name: 'years-forward-range',
    check: (i) => i.yearsForward >= 1 && i.yearsForward <= 20,
    message: 'Forecast horizon should be 1-20 years',
    severity: 'error',
    category: 'range',
    suggestion: 'Forecasts beyond 10 years have high uncertainty',
  },
  {
    name: 'forecast-uncertainty-warning',
    check: (i) => i.yearsForward <= 10,
    message: 'Forecasts beyond 10 years carry significant uncertainty',
    severity: 'info',
    category: 'sanity',
  },
];

// ============================================================================
// RATIO VALIDATIONS
// ============================================================================

export interface RatioValidation {
  name: string;
  calculate: (inputs: AnalysisSession) => number | null;
  thresholds: {
    error?: { min?: number; max?: number };
    warning?: { min?: number; max?: number };
    info?: { min?: number; max?: number };
  };
  format: (value: number) => string;
  message: (value: number, severity: ValidationSeverity) => string;
}

const RATIO_VALIDATIONS: RatioValidation[] = [
  {
    name: 'Gross Margin',
    calculate: (i) => ((i.currentRevenue - i.currentCOGS) / i.currentRevenue) * 100,
    thresholds: {
      error: { min: 0 },
      warning: { min: 10, max: 95 },
    },
    format: (v) => `${v.toFixed(1)}%`,
    message: (v, severity) => {
      if (severity === 'error') return `Gross margin of ${v.toFixed(1)}% is negative`;
      if (v < 10) return `Gross margin of ${v.toFixed(1)}% is very low`;
      if (v > 95) return `Gross margin of ${v.toFixed(1)}% is unusually high`;
      return `Gross margin of ${v.toFixed(1)}% is within normal range`;
    },
  },
  {
    name: 'Operating Margin',
    calculate: (i) => {
      const grossProfit = i.currentRevenue - i.currentCOGS;
      const ebit = grossProfit - i.currentOpex;
      return (ebit / i.currentRevenue) * 100;
    },
    thresholds: {
      error: { min: -100 },
      warning: { min: -20, max: 60 },
    },
    format: (v) => `${v.toFixed(1)}%`,
    message: (v, severity) => {
      if (v < -100) return `Operating margin of ${v.toFixed(1)}% indicates severe losses`;
      if (v < -20) return `Operating margin of ${v.toFixed(1)}% shows significant losses`;
      if (v > 60) return `Operating margin of ${v.toFixed(1)}% is exceptionally high`;
      return `Operating margin of ${v.toFixed(1)}% is within normal range`;
    },
  },
  {
    name: 'Interest Coverage',
    calculate: (i) => {
      const grossProfit = i.currentRevenue - i.currentCOGS;
      const ebit = grossProfit - i.currentOpex;
      const interest = (i.debtOutstanding * i.interestRatePct) / 100;
      return interest > 0 ? ebit / interest : 999;
    },
    thresholds: {
      error: { min: 1 },
      warning: { min: 2 },
      info: { min: 4 },
    },
    format: (v) => v > 100 ? '>100x' : `${v.toFixed(1)}x`,
    message: (v, severity) => {
      if (v < 1) return `Interest coverage of ${v.toFixed(1)}x - cannot cover interest`;
      if (v < 2) return `Interest coverage of ${v.toFixed(1)}x - limited debt capacity`;
      if (v < 4) return `Interest coverage of ${v.toFixed(1)}x - adequate`;
      return `Interest coverage of ${v.toFixed(1)}x - strong`;
    },
  },
  {
    name: 'Debt-to-Revenue',
    calculate: (i) => i.debtOutstanding / i.currentRevenue,
    thresholds: {
      warning: { max: 3 },
      info: { max: 5 },
    },
    format: (v) => `${v.toFixed(2)}x`,
    message: (v, severity) => {
      if (v > 5) return `Debt/Revenue of ${v.toFixed(2)}x is very high`;
      if (v > 3) return `Debt/Revenue of ${v.toFixed(2)}x is elevated`;
      return `Debt/Revenue of ${v.toFixed(2)}x is manageable`;
    },
  },
  {
    name: 'CapEx Intensity',
    calculate: (i) => (i.annualCapex / i.currentRevenue) * 100,
    thresholds: {
      info: { max: 20 },
      warning: { max: 40 },
    },
    format: (v) => `${v.toFixed(1)}%`,
    message: (v, severity) => {
      if (v > 40) return `CapEx intensity of ${v.toFixed(1)}% is very high`;
      if (v > 20) return `CapEx intensity of ${v.toFixed(1)}% indicates capital-intensive business`;
      return `CapEx intensity of ${v.toFixed(1)}% is normal`;
    },
  },
];

// ============================================================================
// CROSS-FIELD VALIDATIONS
// ============================================================================

export interface CrossFieldValidation {
  id: string;
  fields: string[];
  validate: (inputs: AnalysisSession) => ValidationResult | null;
}

const CROSS_FIELD_VALIDATIONS: CrossFieldValidation[] = [
  {
    id: 'profit-consistency',
    fields: ['currentRevenue', 'currentCOGS', 'currentOpex'],
    validate: (inputs) => {
      const grossProfit = inputs.currentRevenue - inputs.currentCOGS;
      const ebit = grossProfit - inputs.currentOpex;
      const interest = (inputs.debtOutstanding * inputs.interestRatePct) / 100;
      const ebt = ebit - interest;
      const tax = ebt * (inputs.taxRatePct / 100);
      const netIncome = ebt - tax;

      if (netIncome < 0 && inputs.revenueGrowthAssumption > 30) {
        return {
          id: 'high-growth-unprofitable',
          severity: 'warning',
          category: 'consistency',
          title: 'High Growth with Losses',
          message: `Company is currently unprofitable but projecting ${inputs.revenueGrowthAssumption}% growth`,
          suggestion: 'Consider modeling path to profitability or reducing growth assumptions',
        };
      }
      return null;
    },
  },
  {
    id: 'debt-service-capacity',
    fields: ['debtOutstanding', 'interestRatePct', 'currentRevenue', 'currentCOGS', 'currentOpex'],
    validate: (inputs) => {
      const ebit = inputs.currentRevenue - inputs.currentCOGS - inputs.currentOpex;
      const interest = (inputs.debtOutstanding * inputs.interestRatePct) / 100;
      const coverage = interest > 0 ? ebit / interest : 999;

      if (coverage < 1 && inputs.debtOutstanding > 0) {
        return {
          id: 'debt-service-concern',
          severity: 'error',
          category: 'consistency',
          title: 'Debt Service Concern',
          message: `EBIT of ${ebit.toLocaleString()} insufficient to cover interest of ${interest.toLocaleString()}`,
          suggestion: 'Reduce debt or improve operating performance',
          value: coverage,
        };
      }
      return null;
    },
  },
  {
    id: 'working-capital-imbalance',
    fields: ['daysReceivable', 'daysPayable', 'daysInventory'],
    validate: (inputs) => {
      const dso = inputs.daysReceivable ?? 30;
      const dpo = inputs.daysPayable ?? 30;
      const dio = inputs.daysInventory ?? 45;
      const ccc = dso + dio - dpo;

      if (ccc > 120) {
        return {
          id: 'working-capital-heavy',
          severity: 'warning',
          category: 'ratio',
          title: 'Working Capital Intensive',
          message: `Cash conversion cycle of ${ccc} days requires significant working capital`,
          suggestion: 'Review collection and payment terms',
          value: ccc,
        };
      }
      if (ccc < -30) {
        return {
          id: 'negative-working-capital',
          severity: 'info',
          category: 'ratio',
          title: 'Negative Working Capital',
          message: `Cash conversion cycle of ${ccc} days indicates efficient working capital`,
          value: ccc,
        };
      }
      return null;
    },
  },
  {
    id: 'growth-capex-mismatch',
    fields: ['revenueGrowthAssumption', 'annualCapex', 'currentRevenue'],
    validate: (inputs) => {
      const capexIntensity = inputs.annualCapex / inputs.currentRevenue;
      const growth = inputs.revenueGrowthAssumption;

      if (growth > 30 && capexIntensity < 0.03) {
        return {
          id: 'low-capex-high-growth',
          severity: 'info',
          category: 'consistency',
          title: 'Low Investment for High Growth',
          message: `High growth (${growth}%) with low CapEx (${(capexIntensity * 100).toFixed(1)}% of revenue)`,
          suggestion: 'Verify business model supports asset-light growth',
        };
      }
      return null;
    },
  },
];

// ============================================================================
// VALIDATION ENGINE
// ============================================================================

export function validateInputs(inputs: AnalysisSession): ValidationSummary {
  const results: ValidationResult[] = [];
  const categoryScores: Map<ValidationCategory, { passed: number; failed: number }> = new Map();

  // Initialize categories
  const allCategories: ValidationCategory[] = [
    'required', 'range', 'consistency', 'sanity', 'ratio', 'trend', 'benchmark', 'completeness'
  ];
  allCategories.forEach(cat => categoryScores.set(cat, { passed: 0, failed: 0 }));

  // Run sanity checks
  SANITY_CHECKS.forEach((check) => {
    const passed = check.check(inputs);
    const catScore = categoryScores.get(check.category)!;

    if (passed) {
      catScore.passed++;
    } else {
      catScore.failed++;
      results.push({
        id: check.name,
        severity: check.severity,
        category: check.category,
        title: check.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        message: check.message,
        suggestion: check.suggestion,
      });
    }
  });

  // Run ratio validations
  RATIO_VALIDATIONS.forEach((rv) => {
    const value = rv.calculate(inputs);
    if (value === null) return;

    let severity: ValidationSeverity = 'success';
    const catScore = categoryScores.get('ratio')!;

    // Check thresholds
    if (rv.thresholds.error) {
      if (rv.thresholds.error.min !== undefined && value < rv.thresholds.error.min) severity = 'error';
      if (rv.thresholds.error.max !== undefined && value > rv.thresholds.error.max) severity = 'error';
    }
    if (severity === 'success' && rv.thresholds.warning) {
      if (rv.thresholds.warning.min !== undefined && value < rv.thresholds.warning.min) severity = 'warning';
      if (rv.thresholds.warning.max !== undefined && value > rv.thresholds.warning.max) severity = 'warning';
    }
    if (severity === 'success' && rv.thresholds.info) {
      if (rv.thresholds.info.min !== undefined && value < rv.thresholds.info.min) severity = 'info';
      if (rv.thresholds.info.max !== undefined && value > rv.thresholds.info.max) severity = 'info';
    }

    if (severity !== 'success') {
      catScore.failed++;
      results.push({
        id: `ratio-${rv.name.toLowerCase().replace(/\s/g, '-')}`,
        severity,
        category: 'ratio',
        title: rv.name,
        message: rv.message(value, severity),
        value: rv.format(value),
      });
    } else {
      catScore.passed++;
    }
  });

  // Run cross-field validations
  CROSS_FIELD_VALIDATIONS.forEach((cfv) => {
    const result = cfv.validate(inputs);
    const catScore = categoryScores.get(result?.category ?? 'consistency')!;

    if (result) {
      catScore.failed++;
      results.push(result);
    } else {
      catScore.passed++;
    }
  });

  // Check completeness
  const optionalFields = ['notes', 'companyName', 'industry', 'currency'];
  const completenessScore = categoryScores.get('completeness')!;

  if (!inputs.companyName) {
    completenessScore.failed++;
    results.push({
      id: 'missing-company-name',
      severity: 'info',
      category: 'completeness',
      title: 'Missing Company Name',
      message: 'Company name not provided',
      suggestion: 'Add company name for better report identification',
    });
  } else {
    completenessScore.passed++;
  }

  if (!inputs.industry) {
    completenessScore.failed++;
    results.push({
      id: 'missing-industry',
      severity: 'info',
      category: 'completeness',
      title: 'Missing Industry',
      message: 'Industry not specified',
      suggestion: 'Add industry for benchmarking and comparison',
    });
  } else {
    completenessScore.passed++;
  }

  // Calculate scores
  const errorCount = results.filter(r => r.severity === 'error').length;
  const warningCount = results.filter(r => r.severity === 'warning').length;
  const infoCount = results.filter(r => r.severity === 'info').length;

  // Calculate overall score (100 - weighted penalties)
  let score = 100;
  score -= errorCount * 20;
  score -= warningCount * 5;
  score -= infoCount * 1;
  score = Math.max(0, Math.min(100, score));

  // Calculate grade
  let grade: string;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  // Build category summaries
  const categories = allCategories.map(cat => {
    const scores = categoryScores.get(cat)!;
    const total = scores.passed + scores.failed;
    return {
      category: cat,
      passed: scores.passed,
      failed: scores.failed,
      score: total > 0 ? Math.round((scores.passed / total) * 100) : 100,
    };
  });

  return {
    isValid: errorCount === 0,
    score: Math.round(score),
    grade,
    results: results.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2, success: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
    errorCount,
    warningCount,
    infoCount,
    categories,
  };
}

// ============================================================================
// FORECAST VALIDATION
// ============================================================================

export function validateForecast(
  inputs: AnalysisSession,
  forecast: ForecastResult
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check for negative values
  forecast.yearly.forEach((year, index) => {
    if (year.revenue <= 0) {
      results.push({
        id: `forecast-revenue-negative-${index}`,
        severity: 'error',
        category: 'sanity',
        title: `Negative Revenue Year ${inputs.startYear + index}`,
        message: 'Forecast produces negative revenue',
      });
    }

    if (year.netIncome < 0 && year.revenue > 0) {
      const margin = (year.netIncome / year.revenue) * 100;
      if (margin < -50) {
        results.push({
          id: `forecast-heavy-loss-${index}`,
          severity: 'warning',
          category: 'sanity',
          title: `Heavy Losses Year ${inputs.startYear + index}`,
          message: `Net margin of ${margin.toFixed(1)}% indicates severe losses`,
        });
      }
    }
  });

  // Check growth trajectory
  const lastYear = forecast.yearly[forecast.yearly.length - 1];
  const firstYear = forecast.yearly[0];

  if (lastYear && firstYear) {
    const totalGrowth = ((lastYear.revenue / firstYear.revenue) - 1) * 100;
    const years = forecast.yearly.length;
    const cagr = (Math.pow(lastYear.revenue / firstYear.revenue, 1 / years) - 1) * 100;

    if (cagr > 50 && lastYear.revenue > 1e10) {
      results.push({
        id: 'forecast-unrealistic-growth',
        severity: 'warning',
        category: 'sanity',
        title: 'Potentially Unrealistic Growth',
        message: `${cagr.toFixed(1)}% CAGR resulting in ${(lastYear.revenue / 1e9).toFixed(1)}B revenue may be aggressive`,
        suggestion: 'Consider growth deceleration as company scales',
      });
    }
  }

  return results;
}

// ============================================================================
// QUICK VALIDATION HELPERS
// ============================================================================

export function isInputValid(inputs: AnalysisSession): boolean {
  const summary = validateInputs(inputs);
  return summary.isValid;
}

export function getValidationErrors(inputs: AnalysisSession): ValidationResult[] {
  const summary = validateInputs(inputs);
  return summary.results.filter(r => r.severity === 'error');
}

export function getDataQualityScore(inputs: AnalysisSession): number {
  const summary = validateInputs(inputs);
  return summary.score;
}

// ============================================================================
// AUTO-FIX SUGGESTIONS
// ============================================================================

export interface AutoFixSuggestion {
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  apply: () => Partial<AnalysisSession>;
}

export function getAutoFixSuggestions(inputs: AnalysisSession): AutoFixSuggestion[] {
  const suggestions: AutoFixSuggestion[] = [];

  // Suggest reasonable defaults for missing or extreme values
  if (!inputs.daysReceivable || inputs.daysReceivable > 120) {
    suggestions.push({
      field: 'daysReceivable',
      currentValue: inputs.daysReceivable,
      suggestedValue: 45,
      reason: 'Industry standard for receivables collection',
      apply: () => ({ daysReceivable: 45 }),
    });
  }

  if (!inputs.daysPayable || inputs.daysPayable > 120) {
    suggestions.push({
      field: 'daysPayable',
      currentValue: inputs.daysPayable,
      suggestedValue: 30,
      reason: 'Industry standard for payables',
      apply: () => ({ daysPayable: 30 }),
    });
  }

  if (inputs.revenueGrowthAssumption > 100) {
    suggestions.push({
      field: 'revenueGrowthAssumption',
      currentValue: inputs.revenueGrowthAssumption,
      suggestedValue: 50,
      reason: 'Growth above 100% is rarely sustainable',
      apply: () => ({ revenueGrowthAssumption: 50 }),
    });
  }

  if (inputs.taxRatePct === 0 || inputs.taxRatePct > 40) {
    suggestions.push({
      field: 'taxRatePct',
      currentValue: inputs.taxRatePct,
      suggestedValue: 25,
      reason: 'Typical corporate tax rate',
      apply: () => ({ taxRatePct: 25 }),
    });
  }

  return suggestions;
}
