/**
 * Web Worker for Heavy Financial Calculations
 *
 * Offloads CPU-intensive calculations to a background thread
 * to keep the UI responsive during complex operations
 */

// Types for worker messages
export interface WorkerMessage {
  type: WorkerMessageType;
  id: string;
  payload: any;
}

export type WorkerMessageType =
  | 'MONTE_CARLO'
  | 'SENSITIVITY_MATRIX'
  | 'BATCH_VALUATION'
  | 'OPTIMIZATION'
  | 'BOOTSTRAP'
  | 'SCENARIO_ANALYSIS';

export interface WorkerResponse {
  id: string;
  type: WorkerMessageType;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

// ============================================================================
// MONTE CARLO SIMULATION
// ============================================================================

interface MonteCarloParams {
  baseValue: number;
  volatility: number;
  growth: number;
  years: number;
  iterations: number;
  distribution: 'normal' | 'lognormal' | 'triangular' | 'uniform';
  correlations?: Record<string, number>;
}

function runMonteCarlo(params: MonteCarloParams): {
  simulations: number[][];
  statistics: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    percentiles: Record<number, number>;
    var95: number;
    var99: number;
    skewness: number;
    kurtosis: number;
  };
  histogram: { bin: number; count: number }[];
} {
  const { baseValue, volatility, growth, years, iterations, distribution } = params;
  const simulations: number[][] = [];
  const finalValues: number[] = [];

  // Run simulations
  for (let i = 0; i < iterations; i++) {
    const path: number[] = [baseValue];
    let currentValue = baseValue;

    for (let year = 0; year < years; year++) {
      const randomShock = generateRandom(distribution, volatility);
      const yearlyGrowth = 1 + (growth / 100) + randomShock;
      currentValue = currentValue * yearlyGrowth;
      path.push(Math.max(0, currentValue));
    }

    simulations.push(path);
    finalValues.push(path[path.length - 1]);
  }

  // Sort final values for percentile calculations
  const sorted = [...finalValues].sort((a, b) => a - b);

  // Calculate statistics
  const mean = finalValues.reduce((a, b) => a + b, 0) / iterations;
  const median = sorted[Math.floor(iterations / 2)];
  const variance = finalValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / iterations;
  const stdDev = Math.sqrt(variance);

  // Percentiles
  const getPercentile = (p: number) => sorted[Math.floor((p / 100) * iterations)];

  // Skewness and kurtosis
  const skewness = finalValues.reduce((sum, v) => sum + Math.pow((v - mean) / stdDev, 3), 0) / iterations;
  const kurtosis = finalValues.reduce((sum, v) => sum + Math.pow((v - mean) / stdDev, 4), 0) / iterations - 3;

  // Generate histogram
  const numBins = 50;
  const min = sorted[0];
  const max = sorted[iterations - 1];
  const binWidth = (max - min) / numBins;
  const histogram: { bin: number; count: number }[] = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = finalValues.filter(v => v >= binStart && v < binEnd).length;
    histogram.push({ bin: binStart + binWidth / 2, count });
  }

  return {
    simulations: simulations.slice(0, 100), // Only return first 100 paths for visualization
    statistics: {
      mean,
      median,
      stdDev,
      min,
      max,
      percentiles: {
        5: getPercentile(5),
        10: getPercentile(10),
        25: getPercentile(25),
        50: median,
        75: getPercentile(75),
        90: getPercentile(90),
        95: getPercentile(95),
        99: getPercentile(99),
      },
      var95: mean - getPercentile(5),
      var99: mean - getPercentile(1),
      skewness,
      kurtosis,
    },
    histogram,
  };
}

function generateRandom(distribution: string, volatility: number): number {
  switch (distribution) {
    case 'normal':
      return boxMullerNormal() * volatility;
    case 'lognormal':
      return Math.exp(boxMullerNormal() * volatility) - 1;
    case 'triangular':
      return triangularRandom(-volatility, 0, volatility);
    case 'uniform':
      return (Math.random() - 0.5) * 2 * volatility;
    default:
      return boxMullerNormal() * volatility;
  }
}

function boxMullerNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function triangularRandom(min: number, mode: number, max: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);

  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

// ============================================================================
// SENSITIVITY MATRIX
// ============================================================================

interface SensitivityParams {
  baseValue: number;
  variables: {
    name: string;
    base: number;
    range: number[];
    impact: (base: number, value: number) => number;
  }[];
}

function calculateSensitivityMatrix(params: SensitivityParams): {
  matrix: number[][];
  rowLabels: string[];
  columnLabels: string[];
  tornado: { variable: string; low: number; high: number; range: number }[];
} {
  const { baseValue, variables } = params;

  // Two-way sensitivity (first two variables)
  const var1 = variables[0];
  const var2 = variables[1] || variables[0];

  const matrix: number[][] = [];
  const rowLabels: string[] = [];
  const columnLabels: string[] = var2.range.map(v => v.toString());

  var1.range.forEach(v1 => {
    rowLabels.push(v1.toString());
    const row: number[] = [];

    var2.range.forEach(v2 => {
      let result = baseValue;
      result = var1.impact(result, v1);
      if (var2 !== var1) {
        result = var2.impact(result, v2);
      }
      row.push(result);
    });

    matrix.push(row);
  });

  // Tornado chart data
  const tornado = variables.map(variable => {
    const minIdx = 0;
    const maxIdx = variable.range.length - 1;
    const low = variable.impact(baseValue, variable.range[minIdx]);
    const high = variable.impact(baseValue, variable.range[maxIdx]);

    return {
      variable: variable.name,
      low,
      high,
      range: Math.abs(high - low),
    };
  }).sort((a, b) => b.range - a.range);

  return { matrix, rowLabels, columnLabels, tornado };
}

// ============================================================================
// BATCH VALUATION
// ============================================================================

interface BatchValuationParams {
  companies: {
    id: string;
    revenue: number;
    ebitda: number;
    growthRate: number;
    wacc: number;
    terminalGrowth: number;
  }[];
}

function runBatchValuation(params: BatchValuationParams): {
  valuations: {
    id: string;
    dcfValue: number;
    evToRevenue: number;
    evToEbitda: number;
    impliedGrowth: number;
  }[];
  aggregates: {
    totalValue: number;
    averageMultiple: number;
    medianMultiple: number;
  };
} {
  const valuations = params.companies.map(company => {
    // Simplified DCF
    const years = 5;
    let fcfSum = 0;

    for (let i = 1; i <= years; i++) {
      const fcf = company.ebitda * Math.pow(1 + company.growthRate / 100, i);
      fcfSum += fcf / Math.pow(1 + company.wacc / 100, i);
    }

    const terminalFCF = company.ebitda * Math.pow(1 + company.growthRate / 100, years);
    const terminalValue = terminalFCF * (1 + company.terminalGrowth / 100) /
      ((company.wacc - company.terminalGrowth) / 100);
    const pvTerminal = terminalValue / Math.pow(1 + company.wacc / 100, years);

    const dcfValue = fcfSum + pvTerminal;
    const evToRevenue = dcfValue / company.revenue;
    const evToEbitda = dcfValue / company.ebitda;

    // Implied growth from current multiple
    const impliedGrowth = (evToEbitda - 5) * 2; // Simplified formula

    return {
      id: company.id,
      dcfValue: Math.round(dcfValue),
      evToRevenue: Math.round(evToRevenue * 10) / 10,
      evToEbitda: Math.round(evToEbitda * 10) / 10,
      impliedGrowth: Math.round(impliedGrowth * 10) / 10,
    };
  });

  const multiples = valuations.map(v => v.evToEbitda);
  const sortedMultiples = [...multiples].sort((a, b) => a - b);

  return {
    valuations,
    aggregates: {
      totalValue: valuations.reduce((sum, v) => sum + v.dcfValue, 0),
      averageMultiple: multiples.reduce((a, b) => a + b, 0) / multiples.length,
      medianMultiple: sortedMultiples[Math.floor(sortedMultiples.length / 2)],
    },
  };
}

// ============================================================================
// OPTIMIZATION
// ============================================================================

interface OptimizationParams {
  objective: 'maximize_irr' | 'minimize_risk' | 'maximize_sharpe';
  constraints: {
    maxLeverage: number;
    minCoverage: number;
    maxConcentration: number;
  };
  variables: {
    name: string;
    min: number;
    max: number;
    current: number;
  }[];
  evaluator: string; // Serialized function
}

function runOptimization(params: OptimizationParams): {
  optimal: Record<string, number>;
  improvement: number;
  iterations: number;
  convergence: number[];
} {
  // Simple gradient-free optimization using coordinate descent
  const { variables, constraints } = params;
  let current: Record<string, number> = {};
  let bestScore = -Infinity;
  const convergence: number[] = [];

  // Initialize
  variables.forEach(v => {
    current[v.name] = v.current;
  });

  const maxIterations = 100;
  const stepSizes = variables.map(v => (v.max - v.min) / 10);

  for (let iter = 0; iter < maxIterations; iter++) {
    let improved = false;

    for (let i = 0; i < variables.length; i++) {
      const variable = variables[i];
      const stepSize = stepSizes[i] * Math.pow(0.9, iter);

      // Try increasing
      const testUp = { ...current };
      testUp[variable.name] = Math.min(variable.max, current[variable.name] + stepSize);
      const scoreUp = evaluatePortfolio(testUp, constraints);

      // Try decreasing
      const testDown = { ...current };
      testDown[variable.name] = Math.max(variable.min, current[variable.name] - stepSize);
      const scoreDown = evaluatePortfolio(testDown, constraints);

      // Take best move
      if (scoreUp > bestScore && scoreUp > scoreDown) {
        current = testUp;
        bestScore = scoreUp;
        improved = true;
      } else if (scoreDown > bestScore) {
        current = testDown;
        bestScore = scoreDown;
        improved = true;
      }
    }

    convergence.push(bestScore);

    if (!improved) break;
  }

  const initialScore = evaluatePortfolio(
    Object.fromEntries(variables.map(v => [v.name, v.current])),
    constraints
  );

  return {
    optimal: current,
    improvement: ((bestScore - initialScore) / Math.abs(initialScore)) * 100,
    iterations: convergence.length,
    convergence,
  };
}

function evaluatePortfolio(
  weights: Record<string, number>,
  constraints: OptimizationParams['constraints']
): number {
  // Simplified portfolio evaluation
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalizedWeights = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / totalWeight])
  );

  // Check constraints
  const maxWeight = Math.max(...Object.values(normalizedWeights));
  if (maxWeight > constraints.maxConcentration / 100) {
    return -Infinity; // Constraint violated
  }

  // Simulated return and risk
  const expectedReturn = Object.values(normalizedWeights).reduce(
    (sum, w, i) => sum + w * (10 + i * 2), 0
  );
  const risk = Math.sqrt(
    Object.values(normalizedWeights).reduce((sum, w) => sum + w * w, 0)
  ) * 15;

  // Sharpe-like ratio
  return (expectedReturn - 3) / risk;
}

// ============================================================================
// SCENARIO ANALYSIS
// ============================================================================

interface ScenarioParams {
  baseCase: Record<string, number>;
  scenarios: {
    name: string;
    adjustments: Record<string, number>; // Multipliers or additions
  }[];
  calculate: string; // Serialized function
}

function runScenarioAnalysis(params: ScenarioParams): {
  results: {
    scenario: string;
    inputs: Record<string, number>;
    outputs: Record<string, number>;
  }[];
  comparison: {
    metric: string;
    values: Record<string, number>;
    delta: Record<string, number>;
  }[];
} {
  const { baseCase, scenarios } = params;

  // Calculate base case
  const baseOutputs = calculateScenario(baseCase);

  const results = [
    {
      scenario: 'Base Case',
      inputs: baseCase,
      outputs: baseOutputs,
    },
    ...scenarios.map(scenario => {
      const inputs: Record<string, number> = { ...baseCase };

      // Apply adjustments
      Object.entries(scenario.adjustments).forEach(([key, adj]) => {
        if (key in inputs) {
          inputs[key] = inputs[key] * adj;
        }
      });

      return {
        scenario: scenario.name,
        inputs,
        outputs: calculateScenario(inputs),
      };
    }),
  ];

  // Build comparison
  const metrics = Object.keys(baseOutputs);
  const comparison = metrics.map(metric => {
    const values: Record<string, number> = {};
    const delta: Record<string, number> = {};

    results.forEach(result => {
      values[result.scenario] = result.outputs[metric];
      delta[result.scenario] = ((result.outputs[metric] - baseOutputs[metric]) / baseOutputs[metric]) * 100;
    });

    return { metric, values, delta };
  });

  return { results, comparison };
}

function calculateScenario(inputs: Record<string, number>): Record<string, number> {
  // Simplified financial calculations
  const revenue = inputs.revenue || 100;
  const growth = inputs.growth || 10;
  const margin = inputs.margin || 20;

  const year5Revenue = revenue * Math.pow(1 + growth / 100, 5);
  const ebitda = year5Revenue * (margin / 100);
  const fcf = ebitda * 0.6;
  const valuation = fcf * 10;

  return {
    revenue: Math.round(year5Revenue),
    ebitda: Math.round(ebitda),
    fcf: Math.round(fcf),
    valuation: Math.round(valuation),
    irr: Math.round((Math.pow(valuation / (revenue * 5), 1/5) - 1) * 100 * 10) / 10,
  };
}

// ============================================================================
// WORKER MESSAGE HANDLER
// ============================================================================

self.onmessage = function(event: MessageEvent<WorkerMessage>) {
  const { type, id, payload } = event.data;
  const startTime = performance.now();

  try {
    let result: any;

    switch (type) {
      case 'MONTE_CARLO':
        result = runMonteCarlo(payload);
        break;

      case 'SENSITIVITY_MATRIX':
        result = calculateSensitivityMatrix(payload);
        break;

      case 'BATCH_VALUATION':
        result = runBatchValuation(payload);
        break;

      case 'OPTIMIZATION':
        result = runOptimization(payload);
        break;

      case 'SCENARIO_ANALYSIS':
        result = runScenarioAnalysis(payload);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const response: WorkerResponse = {
      id,
      type,
      success: true,
      result,
      duration: performance.now() - startTime,
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      type,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: performance.now() - startTime,
    };

    self.postMessage(response);
  }
};

// Export types for the main thread
export type { MonteCarloParams, SensitivityParams, BatchValuationParams, OptimizationParams, ScenarioParams };
