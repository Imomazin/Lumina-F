/**
 * Monte Carlo Simulation Engine
 *
 * Probabilistic forecasting with thousands of simulations
 * for risk analysis and confidence intervals
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SimulationInput {
  name: string;
  baseValue: number;
  distribution: 'normal' | 'triangular' | 'uniform' | 'lognormal';
  params: {
    // For normal: mean, stdDev
    // For triangular: min, mode, max
    // For uniform: min, max
    // For lognormal: mean, stdDev
    min?: number;
    max?: number;
    mean?: number;
    stdDev?: number;
    mode?: number;
  };
}

export interface SimulationResult {
  name: string;
  iterations: number;
  values: number[];
  statistics: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    p5: number;
    p10: number;
    p25: number;
    p75: number;
    p90: number;
    p95: number;
    skewness: number;
    kurtosis: number;
  };
  histogram: { bin: number; count: number; percentage: number }[];
  confidenceIntervals: {
    ci90: { lower: number; upper: number };
    ci95: { lower: number; upper: number };
    ci99: { lower: number; upper: number };
  };
}

export interface MonteCarloConfig {
  iterations: number;
  seed?: number;
  correlations?: { var1: string; var2: string; correlation: number }[];
}

export interface ProjectionSimulation {
  years: number[];
  revenue: SimulationResult;
  ebitda: SimulationResult;
  netIncome: SimulationResult;
  fcf: SimulationResult;
  terminalValue: SimulationResult;
  enterpriseValue: SimulationResult;
  equityValue: SimulationResult;
  irr: SimulationResult;
}

// ============================================================================
// RANDOM NUMBER GENERATORS
// ============================================================================

class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  // Box-Muller transform for normal distribution
  nextNormal(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  }

  // Triangular distribution
  nextTriangular(min: number, mode: number, max: number): number {
    const u = this.next();
    const fc = (mode - min) / (max - min);

    if (u < fc) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  // Uniform distribution
  nextUniform(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // Lognormal distribution
  nextLognormal(mean: number, stdDev: number): number {
    const normalValue = this.nextNormal(0, 1);
    const mu = Math.log(mean * mean / Math.sqrt(stdDev * stdDev + mean * mean));
    const sigma = Math.sqrt(Math.log(1 + (stdDev * stdDev) / (mean * mean)));
    return Math.exp(mu + sigma * normalValue);
  }
}

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

function calculateMean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateMedian(sortedValues: number[]): number {
  const mid = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2 !== 0
    ? sortedValues[mid]
    : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
}

function calculateStdDev(values: number[], mean: number): number {
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length);
}

function calculatePercentile(sortedValues: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sortedValues[lower];

  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower);
}

function calculateSkewness(values: number[], mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  const n = values.length;
  const skew = values.reduce((sum, v) => sum + Math.pow((v - mean) / stdDev, 3), 0);
  return (n / ((n - 1) * (n - 2))) * skew;
}

function calculateKurtosis(values: number[], mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  const n = values.length;
  const kurt = values.reduce((sum, v) => sum + Math.pow((v - mean) / stdDev, 4), 0);
  return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * kurt -
    (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
}

function createHistogram(values: number[], bins: number = 30): { bin: number; count: number; percentage: number }[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins;

  const histogram: { bin: number; count: number; percentage: number }[] = [];

  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = values.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length;

    histogram.push({
      bin: binStart + binWidth / 2,
      count,
      percentage: (count / values.length) * 100
    });
  }

  return histogram;
}

// ============================================================================
// MONTE CARLO SIMULATION
// ============================================================================

export function generateRandomValue(input: SimulationInput, rng: SeededRandom): number {
  switch (input.distribution) {
    case 'normal':
      return rng.nextNormal(
        input.params.mean ?? input.baseValue,
        input.params.stdDev ?? input.baseValue * 0.15
      );
    case 'triangular':
      return rng.nextTriangular(
        input.params.min ?? input.baseValue * 0.7,
        input.params.mode ?? input.baseValue,
        input.params.max ?? input.baseValue * 1.3
      );
    case 'uniform':
      return rng.nextUniform(
        input.params.min ?? input.baseValue * 0.8,
        input.params.max ?? input.baseValue * 1.2
      );
    case 'lognormal':
      return rng.nextLognormal(
        input.params.mean ?? input.baseValue,
        input.params.stdDev ?? input.baseValue * 0.2
      );
    default:
      return input.baseValue;
  }
}

export function runSimulation(
  name: string,
  inputs: SimulationInput[],
  calculateOutput: (values: Record<string, number>) => number,
  config: MonteCarloConfig
): SimulationResult {
  const rng = new SeededRandom(config.seed);
  const values: number[] = [];

  for (let i = 0; i < config.iterations; i++) {
    const inputValues: Record<string, number> = {};

    for (const input of inputs) {
      inputValues[input.name] = generateRandomValue(input, rng);
    }

    values.push(calculateOutput(inputValues));
  }

  // Sort for percentile calculations
  const sortedValues = [...values].sort((a, b) => a - b);

  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values, mean);

  return {
    name,
    iterations: config.iterations,
    values,
    statistics: {
      mean,
      median: calculateMedian(sortedValues),
      stdDev,
      min: sortedValues[0],
      max: sortedValues[sortedValues.length - 1],
      p5: calculatePercentile(sortedValues, 5),
      p10: calculatePercentile(sortedValues, 10),
      p25: calculatePercentile(sortedValues, 25),
      p75: calculatePercentile(sortedValues, 75),
      p90: calculatePercentile(sortedValues, 90),
      p95: calculatePercentile(sortedValues, 95),
      skewness: calculateSkewness(values, mean, stdDev),
      kurtosis: calculateKurtosis(values, mean, stdDev),
    },
    histogram: createHistogram(values),
    confidenceIntervals: {
      ci90: { lower: calculatePercentile(sortedValues, 5), upper: calculatePercentile(sortedValues, 95) },
      ci95: { lower: calculatePercentile(sortedValues, 2.5), upper: calculatePercentile(sortedValues, 97.5) },
      ci99: { lower: calculatePercentile(sortedValues, 0.5), upper: calculatePercentile(sortedValues, 99.5) },
    },
  };
}

// ============================================================================
// FINANCIAL PROJECTION SIMULATION
// ============================================================================

export interface ProjectionInputs {
  baseRevenue: number;
  revenueGrowthRate: number;
  revenueGrowthVolatility: number;
  grossMargin: number;
  grossMarginVolatility: number;
  operatingExpenseRatio: number;
  opexVolatility: number;
  taxRate: number;
  capexRatio: number;
  nwcRatio: number;
  terminalGrowthRate: number;
  discountRate: number;
  projectionYears: number;
}

export function runProjectionSimulation(
  inputs: ProjectionInputs,
  iterations: number = 10000
): ProjectionSimulation {
  const rng = new SeededRandom();

  const years = Array.from({ length: inputs.projectionYears }, (_, i) => i + 1);

  const revenueResults: number[][] = [];
  const ebitdaResults: number[][] = [];
  const netIncomeResults: number[][] = [];
  const fcfResults: number[][] = [];
  const terminalValueResults: number[] = [];
  const enterpriseValueResults: number[] = [];
  const equityValueResults: number[] = [];
  const irrResults: number[] = [];

  for (let sim = 0; sim < iterations; sim++) {
    const yearlyRevenue: number[] = [];
    const yearlyEbitda: number[] = [];
    const yearlyNetIncome: number[] = [];
    const yearlyFcf: number[] = [];

    let revenue = inputs.baseRevenue;

    for (let year = 0; year < inputs.projectionYears; year++) {
      // Revenue with random growth
      const growthRate = rng.nextNormal(inputs.revenueGrowthRate, inputs.revenueGrowthVolatility);
      revenue = revenue * (1 + growthRate / 100);
      yearlyRevenue.push(revenue);

      // Gross profit with random margin
      const margin = rng.nextNormal(inputs.grossMargin, inputs.grossMarginVolatility);
      const grossProfit = revenue * (margin / 100);

      // Operating expenses with random ratio
      const opexRatio = rng.nextNormal(inputs.operatingExpenseRatio, inputs.opexVolatility);
      const opex = revenue * (opexRatio / 100);

      const ebitda = grossProfit - opex;
      yearlyEbitda.push(ebitda);

      // Simplified: assume D&A is 3% of revenue
      const da = revenue * 0.03;
      const ebit = ebitda - da;

      // Net income
      const netIncome = ebit * (1 - inputs.taxRate / 100);
      yearlyNetIncome.push(netIncome);

      // Free cash flow
      const capex = revenue * (inputs.capexRatio / 100);
      const nwcChange = year === 0
        ? revenue * (inputs.nwcRatio / 100) * 0.1
        : (revenue - yearlyRevenue[year - 1]) * (inputs.nwcRatio / 100);
      const fcf = netIncome + da - capex - nwcChange;
      yearlyFcf.push(fcf);
    }

    revenueResults.push(yearlyRevenue);
    ebitdaResults.push(yearlyEbitda);
    netIncomeResults.push(yearlyNetIncome);
    fcfResults.push(yearlyFcf);

    // Terminal value
    const terminalFcf = yearlyFcf[yearlyFcf.length - 1];
    const terminalGrowth = rng.nextNormal(inputs.terminalGrowthRate, 0.5);
    const discountRate = rng.nextNormal(inputs.discountRate, 1);

    const terminalValue = (terminalFcf * (1 + terminalGrowth / 100)) /
      ((discountRate / 100) - (terminalGrowth / 100));
    terminalValueResults.push(terminalValue);

    // Enterprise value (DCF)
    let enterpriseValue = 0;
    for (let year = 0; year < inputs.projectionYears; year++) {
      enterpriseValue += yearlyFcf[year] / Math.pow(1 + discountRate / 100, year + 1);
    }
    enterpriseValue += terminalValue / Math.pow(1 + discountRate / 100, inputs.projectionYears);
    enterpriseValueResults.push(enterpriseValue);

    // Equity value (simplified: no debt adjustment for simulation)
    equityValueResults.push(enterpriseValue);

    // IRR calculation (simplified)
    const totalCashFlows = [-inputs.baseRevenue * 2, ...yearlyFcf];
    totalCashFlows[totalCashFlows.length - 1] += terminalValue;
    const irr = calculateIRR(totalCashFlows);
    irrResults.push(irr * 100);
  }

  // Helper to create result for a specific year
  const createYearlyResult = (name: string, yearlyData: number[][], yearIndex: number): SimulationResult => {
    const values = yearlyData.map(data => data[yearIndex]);
    const sortedValues = [...values].sort((a, b) => a - b);
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values, mean);

    return {
      name: `${name} Year ${yearIndex + 1}`,
      iterations,
      values,
      statistics: {
        mean,
        median: calculateMedian(sortedValues),
        stdDev,
        min: sortedValues[0],
        max: sortedValues[sortedValues.length - 1],
        p5: calculatePercentile(sortedValues, 5),
        p10: calculatePercentile(sortedValues, 10),
        p25: calculatePercentile(sortedValues, 25),
        p75: calculatePercentile(sortedValues, 75),
        p90: calculatePercentile(sortedValues, 90),
        p95: calculatePercentile(sortedValues, 95),
        skewness: calculateSkewness(values, mean, stdDev),
        kurtosis: calculateKurtosis(values, mean, stdDev),
      },
      histogram: createHistogram(values),
      confidenceIntervals: {
        ci90: { lower: calculatePercentile(sortedValues, 5), upper: calculatePercentile(sortedValues, 95) },
        ci95: { lower: calculatePercentile(sortedValues, 2.5), upper: calculatePercentile(sortedValues, 97.5) },
        ci99: { lower: calculatePercentile(sortedValues, 0.5), upper: calculatePercentile(sortedValues, 99.5) },
      },
    };
  };

  const createSimpleResult = (name: string, values: number[]): SimulationResult => {
    const sortedValues = [...values].sort((a, b) => a - b);
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values, mean);

    return {
      name,
      iterations,
      values,
      statistics: {
        mean,
        median: calculateMedian(sortedValues),
        stdDev,
        min: sortedValues[0],
        max: sortedValues[sortedValues.length - 1],
        p5: calculatePercentile(sortedValues, 5),
        p10: calculatePercentile(sortedValues, 10),
        p25: calculatePercentile(sortedValues, 25),
        p75: calculatePercentile(sortedValues, 75),
        p90: calculatePercentile(sortedValues, 90),
        p95: calculatePercentile(sortedValues, 95),
        skewness: calculateSkewness(values, mean, stdDev),
        kurtosis: calculateKurtosis(values, mean, stdDev),
      },
      histogram: createHistogram(values),
      confidenceIntervals: {
        ci90: { lower: calculatePercentile(sortedValues, 5), upper: calculatePercentile(sortedValues, 95) },
        ci95: { lower: calculatePercentile(sortedValues, 2.5), upper: calculatePercentile(sortedValues, 97.5) },
        ci99: { lower: calculatePercentile(sortedValues, 0.5), upper: calculatePercentile(sortedValues, 99.5) },
      },
    };
  };

  // Use last year for summary results
  const lastYear = inputs.projectionYears - 1;

  return {
    years,
    revenue: createYearlyResult('Revenue', revenueResults, lastYear),
    ebitda: createYearlyResult('EBITDA', ebitdaResults, lastYear),
    netIncome: createYearlyResult('Net Income', netIncomeResults, lastYear),
    fcf: createYearlyResult('Free Cash Flow', fcfResults, lastYear),
    terminalValue: createSimpleResult('Terminal Value', terminalValueResults),
    enterpriseValue: createSimpleResult('Enterprise Value', enterpriseValueResults),
    equityValue: createSimpleResult('Equity Value', equityValueResults),
    irr: createSimpleResult('IRR', irrResults),
  };
}

// Simple IRR calculation using Newton-Raphson
function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 0.0001;

  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      dnpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;
  }

  return rate;
}

// ============================================================================
// SENSITIVITY TORNADO ANALYSIS
// ============================================================================

export interface TornadoVariable {
  name: string;
  baseValue: number;
  lowValue: number;
  highValue: number;
  lowResult: number;
  highResult: number;
  impact: number;
}

export function runTornadoAnalysis(
  variables: { name: string; baseValue: number; range: number }[],
  calculateOutput: (values: Record<string, number>) => number
): TornadoVariable[] {
  const baseValues: Record<string, number> = {};
  variables.forEach(v => { baseValues[v.name] = v.baseValue; });

  const baseResult = calculateOutput(baseValues);

  const results: TornadoVariable[] = variables.map(variable => {
    const lowValues = { ...baseValues, [variable.name]: variable.baseValue * (1 - variable.range / 100) };
    const highValues = { ...baseValues, [variable.name]: variable.baseValue * (1 + variable.range / 100) };

    const lowResult = calculateOutput(lowValues);
    const highResult = calculateOutput(highValues);

    return {
      name: variable.name,
      baseValue: variable.baseValue,
      lowValue: lowValues[variable.name],
      highValue: highValues[variable.name],
      lowResult,
      highResult,
      impact: Math.abs(highResult - lowResult),
    };
  });

  // Sort by impact
  return results.sort((a, b) => b.impact - a.impact);
}
