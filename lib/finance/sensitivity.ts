import { AnalysisSession } from "../schema";
import { computeForecast, ForecastResult } from "./forecast";
import { calculateDCF, DCFResult } from "./valuation";

// ============================================================================
// TYPES
// ============================================================================

export type ScenarioType = "bull" | "base" | "bear";

export interface ScenarioAssumptions {
  revenueGrowthMultiplier: number;
  marginImpact: number; // percentage points
  waccAdjustment: number; // percentage points
  terminalGrowthAdjustment: number;
}

export interface ScenarioResult {
  type: ScenarioType;
  label: string;
  probability: number;
  assumptions: {
    revenueGrowth: number;
    grossMargin: number;
    wacc: number;
    terminalGrowth: number;
  };
  forecast: ForecastResult;
  valuation: DCFResult;
  keyMetrics: {
    totalRevenue: number;
    totalNetIncome: number;
    enterpriseValue: number;
    equityValue: number;
  };
}

export interface SensitivityPoint {
  variable: string;
  baseValue: number;
  newValue: number;
  percentChange: number;
  evImpact: number;
  evPercentChange: number;
}

export interface TornadoItem {
  variable: string;
  lowValue: number;
  highValue: number;
  lowEV: number;
  highEV: number;
  baseEV: number;
  sensitivity: number; // Impact magnitude
}

export interface SensitivityAnalysis {
  scenarios: ScenarioResult[];
  tornado: TornadoItem[];
  sensitivityMatrix: {
    revenueGrowth: SensitivityPoint[];
    wacc: SensitivityPoint[];
    terminalGrowth: SensitivityPoint[];
    margin: SensitivityPoint[];
  };
  probabilityWeightedEV: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function round(n: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

// ============================================================================
// SCENARIO DEFINITIONS
// ============================================================================

const SCENARIO_PARAMS: Record<ScenarioType, ScenarioAssumptions> = {
  bull: {
    revenueGrowthMultiplier: 1.5,
    marginImpact: 2,
    waccAdjustment: -1,
    terminalGrowthAdjustment: 0.5,
  },
  base: {
    revenueGrowthMultiplier: 1.0,
    marginImpact: 0,
    waccAdjustment: 0,
    terminalGrowthAdjustment: 0,
  },
  bear: {
    revenueGrowthMultiplier: 0.5,
    marginImpact: -3,
    waccAdjustment: 2,
    terminalGrowthAdjustment: -0.5,
  },
};

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  bull: "Optimistic",
  base: "Base Case",
  bear: "Conservative",
};

const SCENARIO_PROBABILITIES: Record<ScenarioType, number> = {
  bull: 0.25,
  base: 0.50,
  bear: 0.25,
};

// ============================================================================
// SCENARIO ANALYSIS
// ============================================================================

function computeScenario(
  inputs: AnalysisSession,
  scenarioType: ScenarioType,
  baseWacc: number = 0.10,
  baseTerminalGrowth: number = 0.025
): ScenarioResult {
  const params = SCENARIO_PARAMS[scenarioType];

  // Adjust inputs for scenario
  const adjustedInputs: AnalysisSession = {
    ...inputs,
    revenueGrowthAssumption: round(inputs.revenueGrowthAssumption * params.revenueGrowthMultiplier, 1),
  };

  // If we have margin overrides, adjust them
  if (inputs.cogsPctOptional !== undefined) {
    adjustedInputs.cogsPctOptional = Math.max(0, inputs.cogsPctOptional - params.marginImpact);
  }

  // Compute forecast with adjusted inputs
  const forecast = computeForecast(adjustedInputs);

  // Adjust WACC and terminal growth for valuation
  const adjustedWacc = Math.max(0.05, baseWacc + params.waccAdjustment / 100);
  const adjustedTerminalGrowth = Math.max(0, Math.min(adjustedWacc - 0.01,
    baseTerminalGrowth + params.terminalGrowthAdjustment / 100));

  const valuation = calculateDCF(adjustedInputs, forecast, {
    wacc: adjustedWacc,
    terminalGrowthRate: adjustedTerminalGrowth,
  });

  const totalRevenue = forecast.yearly.reduce((s, y) => s + y.revenue, 0);
  const totalNetIncome = forecast.summary.totalNetIncome;

  return {
    type: scenarioType,
    label: SCENARIO_LABELS[scenarioType],
    probability: SCENARIO_PROBABILITIES[scenarioType],
    assumptions: {
      revenueGrowth: adjustedInputs.revenueGrowthAssumption,
      grossMargin: forecast.ratios.grossMarginPct,
      wacc: round(adjustedWacc * 100, 1),
      terminalGrowth: round(adjustedTerminalGrowth * 100, 1),
    },
    forecast,
    valuation,
    keyMetrics: {
      totalRevenue: round(totalRevenue),
      totalNetIncome: round(totalNetIncome),
      enterpriseValue: valuation.enterpriseValue,
      equityValue: valuation.equityValue,
    },
  };
}

// ============================================================================
// SENSITIVITY MATRIX
// ============================================================================

function computeSensitivityForVariable(
  inputs: AnalysisSession,
  variableName: string,
  baseValue: number,
  variations: number[],
  modifier: (inputs: AnalysisSession, newValue: number) => AnalysisSession,
  wacc: number = 0.10
): SensitivityPoint[] {
  const baseInputs = modifier(inputs, baseValue);
  const baseForecast = computeForecast(baseInputs);
  const baseDCF = calculateDCF(baseInputs, baseForecast, { wacc });
  const baseEV = baseDCF.enterpriseValue;

  return variations.map((pctChange) => {
    const newValue = baseValue * (1 + pctChange / 100);
    const adjustedInputs = modifier(inputs, newValue);
    const forecast = computeForecast(adjustedInputs);
    const dcf = calculateDCF(adjustedInputs, forecast, { wacc });

    const evChange = dcf.enterpriseValue - baseEV;
    const evPctChange = baseEV !== 0 ? (evChange / baseEV) * 100 : 0;

    return {
      variable: variableName,
      baseValue: round(baseValue, 2),
      newValue: round(newValue, 2),
      percentChange: pctChange,
      evImpact: round(evChange),
      evPercentChange: round(evPctChange, 2),
    };
  });
}

// ============================================================================
// TORNADO ANALYSIS
// ============================================================================

function computeTornadoItem(
  inputs: AnalysisSession,
  variableName: string,
  baseValue: number,
  lowPct: number,
  highPct: number,
  modifier: (inputs: AnalysisSession, newValue: number) => AnalysisSession,
  wacc: number = 0.10
): TornadoItem {
  const baseForecast = computeForecast(inputs);
  const baseDCF = calculateDCF(inputs, baseForecast, { wacc });
  const baseEV = baseDCF.enterpriseValue;

  const lowValue = baseValue * (1 + lowPct / 100);
  const highValue = baseValue * (1 + highPct / 100);

  const lowInputs = modifier(inputs, lowValue);
  const lowForecast = computeForecast(lowInputs);
  const lowDCF = calculateDCF(lowInputs, lowForecast, { wacc });

  const highInputs = modifier(inputs, highValue);
  const highForecast = computeForecast(highInputs);
  const highDCF = calculateDCF(highInputs, highForecast, { wacc });

  const sensitivity = Math.abs(highDCF.enterpriseValue - lowDCF.enterpriseValue);

  return {
    variable: variableName,
    lowValue: round(lowValue, 2),
    highValue: round(highValue, 2),
    lowEV: round(lowDCF.enterpriseValue),
    highEV: round(highDCF.enterpriseValue),
    baseEV: round(baseEV),
    sensitivity: round(sensitivity),
  };
}

// ============================================================================
// MAIN SENSITIVITY ANALYSIS FUNCTION
// ============================================================================

export function computeSensitivityAnalysis(
  inputs: AnalysisSession,
  options: {
    wacc?: number;
    terminalGrowth?: number;
    variationRange?: number[];
  } = {}
): SensitivityAnalysis {
  const wacc = options.wacc ?? 0.10;
  const terminalGrowth = options.terminalGrowth ?? 0.025;
  const variationRange = options.variationRange ?? [-20, -10, 0, 10, 20];

  // Compute scenarios
  const scenarios: ScenarioResult[] = [
    computeScenario(inputs, "bull", wacc, terminalGrowth),
    computeScenario(inputs, "base", wacc, terminalGrowth),
    computeScenario(inputs, "bear", wacc, terminalGrowth),
  ];

  // Probability-weighted EV
  const probabilityWeightedEV = round(
    scenarios.reduce((sum, s) => sum + s.valuation.enterpriseValue * s.probability, 0)
  );

  // Sensitivity matrices
  const revenueGrowthSensitivity = computeSensitivityForVariable(
    inputs,
    "Revenue Growth",
    inputs.revenueGrowthAssumption,
    variationRange,
    (inp, val) => ({ ...inp, revenueGrowthAssumption: val }),
    wacc
  );

  // For WACC sensitivity, we need to vary the discount rate directly
  const waccSensitivity = [-2, -1, 0, 1, 2].map((waccDelta) => {
    const newWacc = wacc + waccDelta / 100;
    const forecast = computeForecast(inputs);
    const dcf = calculateDCF(inputs, forecast, { wacc: newWacc });
    const baseDCF = calculateDCF(inputs, forecast, { wacc });

    return {
      variable: "WACC",
      baseValue: round(wacc * 100, 1),
      newValue: round(newWacc * 100, 1),
      percentChange: waccDelta,
      evImpact: round(dcf.enterpriseValue - baseDCF.enterpriseValue),
      evPercentChange: round(((dcf.enterpriseValue - baseDCF.enterpriseValue) / baseDCF.enterpriseValue) * 100, 2),
    };
  });

  // Terminal growth sensitivity
  const terminalGrowthSensitivity = [-1, -0.5, 0, 0.5, 1].map((tgDelta) => {
    const newTg = Math.max(0, terminalGrowth + tgDelta / 100);
    const forecast = computeForecast(inputs);
    const dcf = calculateDCF(inputs, forecast, { wacc, terminalGrowthRate: newTg });
    const baseDCF = calculateDCF(inputs, forecast, { wacc, terminalGrowthRate: terminalGrowth });

    return {
      variable: "Terminal Growth",
      baseValue: round(terminalGrowth * 100, 1),
      newValue: round(newTg * 100, 1),
      percentChange: tgDelta,
      evImpact: round(dcf.enterpriseValue - baseDCF.enterpriseValue),
      evPercentChange: round(((dcf.enterpriseValue - baseDCF.enterpriseValue) / baseDCF.enterpriseValue) * 100, 2),
    };
  });

  // Margin sensitivity (via COGS)
  const baseCogsPct = inputs.cogsPctOptional ?? ((inputs.currentCOGS / inputs.currentRevenue) * 100);
  const marginSensitivity = computeSensitivityForVariable(
    inputs,
    "Gross Margin",
    baseCogsPct,
    variationRange.map((v) => -v), // Inverse because lower COGS = higher margin
    (inp, val) => ({ ...inp, cogsPctOptional: Math.max(0, Math.min(100, val)) }),
    wacc
  );

  // Tornado chart data
  const tornado: TornadoItem[] = [
    computeTornadoItem(
      inputs,
      "Revenue Growth",
      inputs.revenueGrowthAssumption,
      -25,
      25,
      (inp, val) => ({ ...inp, revenueGrowthAssumption: Math.max(0, val) }),
      wacc
    ),
    computeTornadoItem(
      inputs,
      "COGS %",
      baseCogsPct,
      -15,
      15,
      (inp, val) => ({ ...inp, cogsPctOptional: Math.max(0, Math.min(100, val)) }),
      wacc
    ),
    computeTornadoItem(
      inputs,
      "Capex",
      inputs.annualCapex,
      -30,
      30,
      (inp, val) => ({ ...inp, annualCapex: Math.max(0, val) }),
      wacc
    ),
    computeTornadoItem(
      inputs,
      "Tax Rate",
      inputs.taxRatePct,
      -20,
      20,
      (inp, val) => ({ ...inp, taxRatePct: Math.max(0, Math.min(100, val)) }),
      wacc
    ),
  ].sort((a, b) => b.sensitivity - a.sensitivity);

  return {
    scenarios,
    tornado,
    sensitivityMatrix: {
      revenueGrowth: revenueGrowthSensitivity,
      wacc: waccSensitivity,
      terminalGrowth: terminalGrowthSensitivity,
      margin: marginSensitivity,
    },
    probabilityWeightedEV,
  };
}

// ============================================================================
// BREAKEVEN ANALYSIS
// ============================================================================

export interface BreakevenResult {
  breakEvenRevenue: number;
  breakEvenUnits?: number;
  marginOfSafety: number;
  marginOfSafetyPct: number;
  contributionMarginRatio: number;
  operatingLeverageAtBreakeven: number;
}

export function computeBreakeven(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  options: {
    unitPrice?: number;
    variableCostPerUnit?: number;
  } = {}
): BreakevenResult {
  const firstYear = forecast.yearly[0];
  if (!firstYear) {
    return {
      breakEvenRevenue: 0,
      marginOfSafety: 0,
      marginOfSafetyPct: 0,
      contributionMarginRatio: 0,
      operatingLeverageAtBreakeven: 0,
    };
  }

  const revenue = firstYear.revenue;
  const cogs = firstYear.cogs;
  const opex = firstYear.opex;
  const interest = firstYear.interest;

  // Estimate variable costs (assume 70% of COGS)
  const variableCosts = cogs * 0.7;
  const fixedCosts = cogs * 0.3 + opex + interest;

  // Contribution Margin Ratio = (Revenue - Variable Costs) / Revenue
  const contributionMargin = revenue - variableCosts;
  const cmRatio = revenue > 0 ? contributionMargin / revenue : 0;

  // Break-even Revenue = Fixed Costs / CM Ratio
  const breakEvenRevenue = cmRatio > 0 ? fixedCosts / cmRatio : 0;

  // Margin of Safety = Actual Revenue - Break-even Revenue
  const marginOfSafety = revenue - breakEvenRevenue;
  const marginOfSafetyPct = revenue > 0 ? (marginOfSafety / revenue) * 100 : 0;

  // Break-even units if unit economics provided
  let breakEvenUnits: number | undefined;
  if (options.unitPrice && options.variableCostPerUnit) {
    const unitCM = options.unitPrice - options.variableCostPerUnit;
    if (unitCM > 0) {
      breakEvenUnits = Math.ceil(fixedCosts / unitCM);
    }
  }

  // Operating leverage at break-even (theoretically infinite, cap at high value)
  const operatingLeverageAtBreakeven = marginOfSafety > 0 ? contributionMargin / marginOfSafety : 999;

  return {
    breakEvenRevenue: round(breakEvenRevenue),
    breakEvenUnits,
    marginOfSafety: round(marginOfSafety),
    marginOfSafetyPct: round(marginOfSafetyPct, 1),
    contributionMarginRatio: round(cmRatio * 100, 1),
    operatingLeverageAtBreakeven: round(Math.min(operatingLeverageAtBreakeven, 999), 2),
  };
}
