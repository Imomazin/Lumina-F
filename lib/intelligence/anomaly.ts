/**
 * Anomaly Detection System
 *
 * Identifies unusual patterns and outliers in financial inputs
 * Provides intelligent validation with industry context
 */

import { getIndustryById, IndustryBenchmark } from './industries';

// ============================================================================
// TYPES
// ============================================================================

export type AnomalySeverity = 'info' | 'warning' | 'critical';
export type AnomalyType =
  | 'outlier'
  | 'inconsistency'
  | 'impossible'
  | 'unusual_pattern'
  | 'missing_data'
  | 'ratio_violation'
  | 'trend_break';

export interface Anomaly {
  id: string;
  field: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  message: string;
  details: string;
  value: number;
  expectedRange?: { min: number; max: number };
  industryContext?: string;
  suggestion?: string;
  autoFixValue?: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 data quality score
  anomalies: Anomaly[];
  warnings: Anomaly[];
  criticalIssues: Anomaly[];
  summary: string;
}

export interface FinancialInputs {
  revenue?: number;
  revenueGrowth?: number;
  cogs?: number;
  grossProfit?: number;
  grossMargin?: number;
  operatingExpenses?: number;
  ebitda?: number;
  ebitdaMargin?: number;
  depreciation?: number;
  amortization?: number;
  interestExpense?: number;
  taxExpense?: number;
  netIncome?: number;
  netMargin?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  currentAssets?: number;
  currentLiabilities?: number;
  inventory?: number;
  receivables?: number;
  payables?: number;
  cash?: number;
  debt?: number;
  capex?: number;
  employees?: number;
  industryId?: string;
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

interface ValidationRule {
  id: string;
  name: string;
  check: (inputs: FinancialInputs, industry?: IndustryBenchmark) => Anomaly | null;
}

const validationRules: ValidationRule[] = [
  // =========================================================================
  // IMPOSSIBLE VALUES
  // =========================================================================
  {
    id: 'negative-revenue',
    name: 'Negative Revenue',
    check: (inputs) => {
      if (inputs.revenue !== undefined && inputs.revenue < 0) {
        return {
          id: 'negative-revenue',
          field: 'revenue',
          type: 'impossible',
          severity: 'critical',
          message: 'Revenue cannot be negative',
          details: 'Revenue represents sales and must be zero or positive.',
          value: inputs.revenue,
          expectedRange: { min: 0, max: Infinity },
          suggestion: 'Enter a positive revenue value or zero if no sales.',
          autoFixValue: 0,
        };
      }
      return null;
    },
  },
  {
    id: 'negative-assets',
    name: 'Negative Total Assets',
    check: (inputs) => {
      if (inputs.totalAssets !== undefined && inputs.totalAssets < 0) {
        return {
          id: 'negative-assets',
          field: 'totalAssets',
          type: 'impossible',
          severity: 'critical',
          message: 'Total assets cannot be negative',
          details: 'Assets represent owned resources and must be positive.',
          value: inputs.totalAssets,
          expectedRange: { min: 0, max: Infinity },
        };
      }
      return null;
    },
  },
  {
    id: 'negative-employees',
    name: 'Negative Employees',
    check: (inputs) => {
      if (inputs.employees !== undefined && inputs.employees < 0) {
        return {
          id: 'negative-employees',
          field: 'employees',
          type: 'impossible',
          severity: 'critical',
          message: 'Employee count cannot be negative',
          details: 'Number of employees must be zero or positive.',
          value: inputs.employees,
          autoFixValue: 0,
        };
      }
      return null;
    },
  },

  // =========================================================================
  // MARGIN VALIDATION
  // =========================================================================
  {
    id: 'impossible-gross-margin',
    name: 'Impossible Gross Margin',
    check: (inputs) => {
      if (inputs.grossMargin !== undefined) {
        if (inputs.grossMargin > 100) {
          return {
            id: 'impossible-gross-margin-high',
            field: 'grossMargin',
            type: 'impossible',
            severity: 'critical',
            message: 'Gross margin cannot exceed 100%',
            details: 'Gross margin = (Revenue - COGS) / Revenue, maximum is 100%.',
            value: inputs.grossMargin,
            expectedRange: { min: -100, max: 100 },
            autoFixValue: 100,
          };
        }
        if (inputs.grossMargin < -100) {
          return {
            id: 'impossible-gross-margin-low',
            field: 'grossMargin',
            type: 'impossible',
            severity: 'critical',
            message: 'Gross margin below -100% is highly unusual',
            details: 'This would mean COGS is more than double the revenue.',
            value: inputs.grossMargin,
            expectedRange: { min: -100, max: 100 },
          };
        }
      }
      return null;
    },
  },
  {
    id: 'negative-gross-margin',
    name: 'Negative Gross Margin Warning',
    check: (inputs, industry) => {
      if (inputs.grossMargin !== undefined && inputs.grossMargin < 0) {
        return {
          id: 'negative-gross-margin',
          field: 'grossMargin',
          type: 'unusual_pattern',
          severity: 'warning',
          message: 'Negative gross margin detected',
          details: 'Selling products below cost. This is unsustainable long-term.',
          value: inputs.grossMargin,
          industryContext: industry ? `Industry median: ${industry.grossMargin.p50}%` : undefined,
          suggestion: 'Review pricing strategy or cost structure.',
        };
      }
      return null;
    },
  },

  // =========================================================================
  // CONSISTENCY CHECKS
  // =========================================================================
  {
    id: 'margin-consistency',
    name: 'Margin Consistency Check',
    check: (inputs) => {
      if (inputs.revenue && inputs.grossProfit !== undefined) {
        const calculatedMargin = (inputs.grossProfit / inputs.revenue) * 100;
        if (inputs.grossMargin !== undefined && Math.abs(calculatedMargin - inputs.grossMargin) > 1) {
          return {
            id: 'margin-consistency',
            field: 'grossMargin',
            type: 'inconsistency',
            severity: 'warning',
            message: 'Gross margin inconsistent with gross profit and revenue',
            details: `Calculated: ${calculatedMargin.toFixed(1)}%, Entered: ${inputs.grossMargin}%`,
            value: inputs.grossMargin,
            suggestion: 'Verify gross profit and revenue figures.',
            autoFixValue: calculatedMargin,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'balance-sheet-equation',
    name: 'Balance Sheet Equation',
    check: (inputs) => {
      if (inputs.totalAssets && inputs.totalLiabilities !== undefined && inputs.totalEquity !== undefined) {
        const calculatedAssets = inputs.totalLiabilities + inputs.totalEquity;
        const diff = Math.abs(inputs.totalAssets - calculatedAssets);
        const tolerance = inputs.totalAssets * 0.01; // 1% tolerance

        if (diff > tolerance) {
          return {
            id: 'balance-sheet-equation',
            field: 'totalAssets',
            type: 'inconsistency',
            severity: 'critical',
            message: 'Balance sheet equation does not balance',
            details: `Assets (${inputs.totalAssets.toLocaleString()}) ≠ Liabilities + Equity (${calculatedAssets.toLocaleString()})`,
            value: inputs.totalAssets,
            suggestion: 'Assets must equal Liabilities + Equity.',
          };
        }
      }
      return null;
    },
  },
  {
    id: 'current-ratio-consistency',
    name: 'Current Assets/Liabilities Consistency',
    check: (inputs) => {
      if (inputs.totalAssets && inputs.currentAssets !== undefined && inputs.currentAssets > inputs.totalAssets) {
        return {
          id: 'current-assets-exceeds-total',
          field: 'currentAssets',
          type: 'inconsistency',
          severity: 'critical',
          message: 'Current assets cannot exceed total assets',
          details: `Current assets (${inputs.currentAssets.toLocaleString()}) > Total assets (${inputs.totalAssets.toLocaleString()})`,
          value: inputs.currentAssets,
        };
      }
      return null;
    },
  },

  // =========================================================================
  // INDUSTRY OUTLIERS
  // =========================================================================
  {
    id: 'revenue-growth-outlier',
    name: 'Revenue Growth Industry Outlier',
    check: (inputs, industry) => {
      if (inputs.revenueGrowth !== undefined && industry) {
        if (inputs.revenueGrowth > industry.revenueGrowth.p90 * 2) {
          return {
            id: 'revenue-growth-outlier-high',
            field: 'revenueGrowth',
            type: 'outlier',
            severity: 'warning',
            message: `Revenue growth of ${inputs.revenueGrowth}% is exceptionally high for this industry`,
            details: `Industry 90th percentile is ${industry.revenueGrowth.p90}%`,
            value: inputs.revenueGrowth,
            industryContext: `Industry range: ${industry.revenueGrowth.p10}% - ${industry.revenueGrowth.p90}%`,
            suggestion: 'Verify this growth rate is accurate. High growth often normalizes.',
          };
        }
        if (inputs.revenueGrowth < industry.revenueGrowth.p10 * 2 && inputs.revenueGrowth < -30) {
          return {
            id: 'revenue-growth-outlier-low',
            field: 'revenueGrowth',
            type: 'outlier',
            severity: 'warning',
            message: `Revenue decline of ${inputs.revenueGrowth}% is severe`,
            details: `Industry 10th percentile is ${industry.revenueGrowth.p10}%`,
            value: inputs.revenueGrowth,
            industryContext: `Industry range: ${industry.revenueGrowth.p10}% - ${industry.revenueGrowth.p90}%`,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'gross-margin-outlier',
    name: 'Gross Margin Industry Outlier',
    check: (inputs, industry) => {
      if (inputs.grossMargin !== undefined && industry) {
        if (inputs.grossMargin > industry.grossMargin.p90 + 15) {
          return {
            id: 'gross-margin-outlier-high',
            field: 'grossMargin',
            type: 'outlier',
            severity: 'info',
            message: `Gross margin of ${inputs.grossMargin}% is above industry top performers`,
            details: `Industry 90th percentile is ${industry.grossMargin.p90}%`,
            value: inputs.grossMargin,
            industryContext: `Industry median: ${industry.grossMargin.p50}%`,
            suggestion: 'This could indicate premium pricing power or unique cost advantages.',
          };
        }
        if (inputs.grossMargin < industry.grossMargin.p10 - 10) {
          return {
            id: 'gross-margin-outlier-low',
            field: 'grossMargin',
            type: 'outlier',
            severity: 'warning',
            message: `Gross margin of ${inputs.grossMargin}% is significantly below industry`,
            details: `Industry 10th percentile is ${industry.grossMargin.p10}%`,
            value: inputs.grossMargin,
            industryContext: `Industry median: ${industry.grossMargin.p50}%`,
            suggestion: 'Review cost structure and pricing strategy.',
          };
        }
      }
      return null;
    },
  },
  {
    id: 'operating-margin-outlier',
    name: 'Operating Margin Industry Outlier',
    check: (inputs, industry) => {
      const operatingMargin = inputs.ebitdaMargin !== undefined ? inputs.ebitdaMargin - 5 : undefined; // Rough approximation
      if (operatingMargin !== undefined && industry && operatingMargin < industry.operatingMargin.p10 - 20) {
        return {
          id: 'operating-margin-outlier',
          field: 'ebitdaMargin',
          type: 'outlier',
          severity: 'warning',
          message: 'Operating profitability significantly below industry',
          details: `Your implied operating margin is well below the industry 10th percentile of ${industry.operatingMargin.p10}%`,
          value: operatingMargin,
          industryContext: `Industry median: ${industry.operatingMargin.p50}%`,
        };
      }
      return null;
    },
  },

  // =========================================================================
  // RATIO VIOLATIONS
  // =========================================================================
  {
    id: 'debt-to-equity-extreme',
    name: 'Extreme Debt to Equity',
    check: (inputs, industry) => {
      if (inputs.debt !== undefined && inputs.totalEquity !== undefined && inputs.totalEquity > 0) {
        const debtToEquity = inputs.debt / inputs.totalEquity;
        if (debtToEquity > 5) {
          return {
            id: 'debt-to-equity-extreme',
            field: 'debt',
            type: 'ratio_violation',
            severity: 'warning',
            message: `Debt to equity ratio of ${debtToEquity.toFixed(1)}x is very high`,
            details: 'High leverage increases financial risk significantly.',
            value: debtToEquity,
            industryContext: industry ? `Industry median: ${industry.debtToEquity.p50}x` : undefined,
            suggestion: 'Consider if this capital structure is sustainable.',
          };
        }
      }
      return null;
    },
  },
  {
    id: 'negative-equity',
    name: 'Negative Equity',
    check: (inputs) => {
      if (inputs.totalEquity !== undefined && inputs.totalEquity < 0) {
        return {
          id: 'negative-equity',
          field: 'totalEquity',
          type: 'ratio_violation',
          severity: 'critical',
          message: 'Negative shareholder equity detected',
          details: 'Liabilities exceed assets. This indicates financial distress.',
          value: inputs.totalEquity,
          suggestion: 'Review the capital structure and consider restructuring needs.',
        };
      }
      return null;
    },
  },
  {
    id: 'current-ratio-low',
    name: 'Low Current Ratio',
    check: (inputs) => {
      if (inputs.currentAssets !== undefined && inputs.currentLiabilities !== undefined && inputs.currentLiabilities > 0) {
        const currentRatio = inputs.currentAssets / inputs.currentLiabilities;
        if (currentRatio < 0.5) {
          return {
            id: 'current-ratio-low',
            field: 'currentAssets',
            type: 'ratio_violation',
            severity: 'warning',
            message: `Current ratio of ${currentRatio.toFixed(2)} indicates liquidity risk`,
            details: 'Current assets are less than half of current liabilities.',
            value: currentRatio,
            expectedRange: { min: 1, max: 3 },
            suggestion: 'May have difficulty meeting short-term obligations.',
          };
        }
      }
      return null;
    },
  },

  // =========================================================================
  // EMPLOYEE PRODUCTIVITY
  // =========================================================================
  {
    id: 'revenue-per-employee',
    name: 'Revenue per Employee Check',
    check: (inputs, industry) => {
      if (inputs.revenue && inputs.employees && inputs.employees > 0) {
        const revenuePerEmployee = inputs.revenue / inputs.employees / 1000; // In thousands

        if (revenuePerEmployee < 20) {
          return {
            id: 'revenue-per-employee-low',
            field: 'employees',
            type: 'outlier',
            severity: 'warning',
            message: `Revenue per employee of $${revenuePerEmployee.toFixed(0)}K is very low`,
            details: 'This may indicate overstaffing or low productivity.',
            value: revenuePerEmployee,
            industryContext: industry ? `Industry median: $${industry.employeeProductivity.p50}K` : undefined,
          };
        }
        if (revenuePerEmployee > 5000) {
          return {
            id: 'revenue-per-employee-high',
            field: 'employees',
            type: 'outlier',
            severity: 'info',
            message: `Revenue per employee of $${revenuePerEmployee.toFixed(0)}K is exceptionally high`,
            details: 'Verify employee count is accurate and includes all workers.',
            value: revenuePerEmployee,
          };
        }
      }
      return null;
    },
  },
];

// ============================================================================
// VALIDATION ENGINE
// ============================================================================

export function validateFinancialInputs(inputs: FinancialInputs): ValidationResult {
  const industry = inputs.industryId ? getIndustryById(inputs.industryId) : undefined;
  const anomalies: Anomaly[] = [];

  // Run all validation rules
  for (const rule of validationRules) {
    const result = rule.check(inputs, industry);
    if (result) {
      anomalies.push(result);
    }
  }

  // Categorize by severity
  const criticalIssues = anomalies.filter(a => a.severity === 'critical');
  const warnings = anomalies.filter(a => a.severity === 'warning');
  const infoItems = anomalies.filter(a => a.severity === 'info');

  // Calculate data quality score
  let score = 100;
  score -= criticalIssues.length * 25;
  score -= warnings.length * 10;
  score -= infoItems.length * 2;
  score = Math.max(0, Math.min(100, score));

  // Generate summary
  let summary: string;
  if (criticalIssues.length > 0) {
    summary = `Found ${criticalIssues.length} critical issue(s) that need attention.`;
  } else if (warnings.length > 0) {
    summary = `Data looks mostly good with ${warnings.length} warning(s) to review.`;
  } else if (infoItems.length > 0) {
    summary = `Data quality is excellent with ${infoItems.length} informational note(s).`;
  } else {
    summary = 'All inputs pass validation checks. Data quality is excellent.';
  }

  return {
    isValid: criticalIssues.length === 0,
    score,
    anomalies,
    warnings,
    criticalIssues,
    summary,
  };
}

// ============================================================================
// SMART SUGGESTIONS
// ============================================================================

export interface SmartSuggestion {
  field: string;
  currentValue?: number;
  suggestedValue: number;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  source: string;
}

export function generateSmartSuggestions(
  inputs: FinancialInputs,
  industryId: string
): SmartSuggestion[] {
  const industry = getIndustryById(industryId);
  if (!industry) return [];

  const suggestions: SmartSuggestion[] = [];

  // Suggest gross margin if not provided
  if (inputs.grossMargin === undefined && inputs.revenue) {
    suggestions.push({
      field: 'grossMargin',
      suggestedValue: industry.grossMargin.p50,
      reason: `Industry median gross margin for ${industry.name}`,
      confidence: 'medium',
      source: 'Industry Benchmark',
    });
  }

  // Suggest revenue growth if not provided
  if (inputs.revenueGrowth === undefined) {
    suggestions.push({
      field: 'revenueGrowth',
      suggestedValue: industry.revenueGrowth.p50,
      reason: `Industry median growth rate for ${industry.name}`,
      confidence: 'medium',
      source: 'Industry Benchmark',
    });
  }

  // Suggest EBITDA margin if not provided
  if (inputs.ebitdaMargin === undefined && inputs.revenue) {
    suggestions.push({
      field: 'ebitdaMargin',
      suggestedValue: industry.ebitdaMargin.p50,
      reason: `Industry median EBITDA margin for ${industry.name}`,
      confidence: 'medium',
      source: 'Industry Benchmark',
    });
  }

  // Suggest D&A if missing
  if (inputs.depreciation === undefined && inputs.revenue) {
    const suggestedDA = inputs.revenue * (industry.capexToRevenue.p50 / 100) * 0.8; // Rough estimate
    suggestions.push({
      field: 'depreciation',
      suggestedValue: suggestedDA,
      reason: 'Estimated based on typical CapEx and depreciation relationship',
      confidence: 'low',
      source: 'Calculated Estimate',
    });
  }

  return suggestions;
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

export interface TrendAnomaly {
  field: string;
  pattern: 'acceleration' | 'deceleration' | 'reversal' | 'volatility' | 'plateau';
  description: string;
  significance: number; // 0-100
}

export function detectTrendAnomalies(
  historicalData: { year: number; values: Record<string, number> }[]
): TrendAnomaly[] {
  if (historicalData.length < 3) return [];

  const anomalies: TrendAnomaly[] = [];
  const fields = Object.keys(historicalData[0].values);

  for (const field of fields) {
    const values = historicalData.map(d => d.values[field]).filter(v => v !== undefined);
    if (values.length < 3) continue;

    // Calculate year-over-year changes
    const changes: number[] = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] !== 0) {
        changes.push((values[i] - values[i - 1]) / Math.abs(values[i - 1]) * 100);
      }
    }

    if (changes.length < 2) continue;

    // Detect reversal (sign change in growth)
    const lastChange = changes[changes.length - 1];
    const prevChange = changes[changes.length - 2];
    if ((lastChange > 5 && prevChange < -5) || (lastChange < -5 && prevChange > 5)) {
      anomalies.push({
        field,
        pattern: 'reversal',
        description: `${field} shows a trend reversal: ${prevChange > 0 ? 'growth' : 'decline'} to ${lastChange > 0 ? 'growth' : 'decline'}`,
        significance: Math.min(100, Math.abs(lastChange - prevChange)),
      });
    }

    // Detect acceleration
    if (changes.length >= 2) {
      const acceleration = changes[changes.length - 1] - changes[changes.length - 2];
      if (acceleration > 20) {
        anomalies.push({
          field,
          pattern: 'acceleration',
          description: `${field} growth is accelerating significantly`,
          significance: Math.min(100, acceleration),
        });
      } else if (acceleration < -20) {
        anomalies.push({
          field,
          pattern: 'deceleration',
          description: `${field} growth is decelerating significantly`,
          significance: Math.min(100, Math.abs(acceleration)),
        });
      }
    }

    // Detect high volatility
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance = changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > 30) {
      anomalies.push({
        field,
        pattern: 'volatility',
        description: `${field} shows high volatility (std dev: ${stdDev.toFixed(1)}%)`,
        significance: Math.min(100, stdDev),
      });
    }
  }

  return anomalies.sort((a, b) => b.significance - a.significance);
}
