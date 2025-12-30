/**
 * Comparable Company Analysis (Comps)
 *
 * Professional-grade trading comparables analysis with:
 * - Peer group construction
 * - Multiple calculation and normalization
 * - Statistical analysis
 * - Implied valuation ranges
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ComparableCompany {
  id: string;
  name: string;
  ticker?: string;
  industry: string;
  subIndustry?: string;

  // Market Data
  marketCap: number;
  enterpriseValue: number;
  stockPrice?: number;
  sharesOutstanding?: number;

  // Financial Metrics (LTM)
  revenue: number;
  revenueGrowth: number;
  grossProfit: number;
  ebitda: number;
  ebit: number;
  netIncome: number;

  // Balance Sheet
  totalDebt: number;
  cash: number;
  totalAssets?: number;
  totalEquity?: number;

  // Margins
  grossMargin: number;
  ebitdaMargin: number;
  netMargin: number;

  // Growth Rates
  revenueGrowth1Y: number;
  revenueGrowth3Y?: number;
  ebitdaGrowth1Y?: number;

  // Other Metrics
  employees?: number;
  founded?: number;
  headquarters?: string;
}

export interface CompsAnalysisResult {
  // Peer Summary
  peerGroup: {
    count: number;
    medianMarketCap: number;
    medianRevenue: number;
    marketCapRange: { min: number; max: number };
  };

  // Trading Multiples
  multiples: MultipleAnalysis[];

  // Target Valuation
  targetValuation: {
    metric: string;
    targetValue: number;
    impliedEV: {
      low: number;
      median: number;
      mean: number;
      high: number;
    };
    impliedEquity: {
      low: number;
      median: number;
      mean: number;
      high: number;
    };
  }[];

  // Statistical Summary
  statistics: {
    metric: string;
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
    count: number;
  }[];

  // Peer Comparison Table
  comparisonTable: {
    company: string;
    ticker?: string;
    marketCap: number;
    evRevenue: number;
    evEbitda: number;
    peRatio: number;
    revenueGrowth: number;
    ebitdaMargin: number;
  }[];

  // Correlation Analysis
  correlations: {
    xMetric: string;
    yMetric: string;
    correlation: number;
    rSquared: number;
  }[];
}

export interface MultipleAnalysis {
  name: string;
  displayName: string;
  values: { company: string; value: number }[];
  statistics: {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
    percentile25: number;
    percentile75: number;
  };
  outliers: string[];
}

export interface CompsInputs {
  target: {
    name: string;
    revenue: number;
    ebitda: number;
    netIncome: number;
    totalDebt: number;
    cash: number;
    revenueGrowth: number;
    ebitdaMargin: number;
  };
  peers: ComparableCompany[];
  options?: {
    excludeOutliers?: boolean;
    outlierThreshold?: number; // Standard deviations
    weightByMarketCap?: boolean;
    minPeers?: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function safeDiv(numerator: number, denominator: number, fallback: number = 0): number {
  return denominator !== 0 ? numerator / denominator : fallback;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
}

function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : numerator / denom;
}

// ============================================================================
// MULTIPLE CALCULATIONS
// ============================================================================

export function calculateMultiples(company: ComparableCompany): Record<string, number> {
  return {
    evRevenue: round(safeDiv(company.enterpriseValue, company.revenue), 2),
    evEbitda: round(safeDiv(company.enterpriseValue, company.ebitda), 1),
    evEbit: round(safeDiv(company.enterpriseValue, company.ebit), 1),
    peRatio: round(safeDiv(company.marketCap, company.netIncome), 1),
    priceToSales: round(safeDiv(company.marketCap, company.revenue), 2),
    priceToBook: round(safeDiv(company.marketCap, company.totalEquity || company.marketCap * 0.5), 2),
    evToGrossProfit: round(safeDiv(company.enterpriseValue, company.grossProfit), 2),
  };
}

// ============================================================================
// COMPS ANALYSIS ENGINE
// ============================================================================

export function runCompsAnalysis(inputs: CompsInputs): CompsAnalysisResult {
  const { target, peers, options = {} } = inputs;
  const {
    excludeOutliers = true,
    outlierThreshold = 2.5,
    weightByMarketCap = false,
  } = options;

  // Filter out invalid peers
  const validPeers = peers.filter(p =>
    p.revenue > 0 && p.ebitda !== 0 && p.marketCap > 0
  );

  // =========================================================================
  // CALCULATE MULTIPLES FOR ALL PEERS
  // =========================================================================
  const peerMultiples = validPeers.map(peer => ({
    company: peer.name,
    ticker: peer.ticker,
    marketCap: peer.marketCap,
    ...calculateMultiples(peer),
    revenueGrowth: peer.revenueGrowth1Y,
    ebitdaMargin: peer.ebitdaMargin,
  }));

  // =========================================================================
  // MULTIPLE ANALYSIS
  // =========================================================================
  const multipleTypes = [
    { name: 'evRevenue', displayName: 'EV / Revenue' },
    { name: 'evEbitda', displayName: 'EV / EBITDA' },
    { name: 'evEbit', displayName: 'EV / EBIT' },
    { name: 'peRatio', displayName: 'P / E' },
    { name: 'priceToSales', displayName: 'P / Sales' },
  ];

  const multiples: MultipleAnalysis[] = multipleTypes.map(({ name, displayName }) => {
    let values = peerMultiples
      .map(p => ({ company: p.company, value: (p as any)[name] as number }))
      .filter(v => v.value > 0 && isFinite(v.value));

    // Detect and optionally exclude outliers
    const outliers: string[] = [];
    if (excludeOutliers && values.length > 3) {
      const allValues = values.map(v => v.value);
      const avg = mean(allValues);
      const std = stdDev(allValues);

      values = values.filter(v => {
        const isOutlier = Math.abs(v.value - avg) > outlierThreshold * std;
        if (isOutlier) outliers.push(v.company);
        return !isOutlier;
      });
    }

    const allValues = values.map(v => v.value);

    return {
      name,
      displayName,
      values,
      statistics: {
        mean: round(mean(allValues), 2),
        median: round(median(allValues), 2),
        min: round(Math.min(...allValues), 2),
        max: round(Math.max(...allValues), 2),
        stdDev: round(stdDev(allValues), 2),
        percentile25: round(percentile(allValues, 25), 2),
        percentile75: round(percentile(allValues, 75), 2),
      },
      outliers,
    };
  });

  // =========================================================================
  // TARGET VALUATION
  // =========================================================================
  const targetValuation = [
    {
      metric: 'Revenue',
      targetValue: target.revenue,
      multipleAnalysis: multiples.find(m => m.name === 'evRevenue')!,
    },
    {
      metric: 'EBITDA',
      targetValue: target.ebitda,
      multipleAnalysis: multiples.find(m => m.name === 'evEbitda')!,
    },
  ].map(({ metric, targetValue, multipleAnalysis }) => {
    const stats = multipleAnalysis.statistics;

    const impliedEV = {
      low: round(targetValue * stats.percentile25),
      median: round(targetValue * stats.median),
      mean: round(targetValue * stats.mean),
      high: round(targetValue * stats.percentile75),
    };

    const netDebt = target.totalDebt - target.cash;
    const impliedEquity = {
      low: round(impliedEV.low - netDebt),
      median: round(impliedEV.median - netDebt),
      mean: round(impliedEV.mean - netDebt),
      high: round(impliedEV.high - netDebt),
    };

    return {
      metric,
      targetValue,
      impliedEV,
      impliedEquity,
    };
  });

  // =========================================================================
  // STATISTICAL SUMMARY
  // =========================================================================
  const statistics = multiples.map(m => ({
    metric: m.displayName,
    mean: m.statistics.mean,
    median: m.statistics.median,
    min: m.statistics.min,
    max: m.statistics.max,
    stdDev: m.statistics.stdDev,
    count: m.values.length,
  }));

  // =========================================================================
  // COMPARISON TABLE
  // =========================================================================
  const comparisonTable = peerMultiples.map(p => ({
    company: p.company,
    ticker: p.ticker,
    marketCap: p.marketCap,
    evRevenue: p.evRevenue,
    evEbitda: p.evEbitda,
    peRatio: p.peRatio,
    revenueGrowth: p.revenueGrowth,
    ebitdaMargin: p.ebitdaMargin,
  })).sort((a, b) => b.marketCap - a.marketCap);

  // =========================================================================
  // CORRELATION ANALYSIS
  // =========================================================================
  const correlations: CompsAnalysisResult['correlations'] = [];

  // Growth vs EV/Revenue
  const growthValues = peerMultiples.map(p => p.revenueGrowth);
  const evRevValues = peerMultiples.map(p => p.evRevenue);
  const evEbitdaValues = peerMultiples.map(p => p.evEbitda);
  const marginValues = peerMultiples.map(p => p.ebitdaMargin);

  correlations.push({
    xMetric: 'Revenue Growth',
    yMetric: 'EV/Revenue',
    correlation: round(correlation(growthValues, evRevValues), 2),
    rSquared: round(Math.pow(correlation(growthValues, evRevValues), 2), 2),
  });

  correlations.push({
    xMetric: 'EBITDA Margin',
    yMetric: 'EV/Revenue',
    correlation: round(correlation(marginValues, evRevValues), 2),
    rSquared: round(Math.pow(correlation(marginValues, evRevValues), 2), 2),
  });

  correlations.push({
    xMetric: 'Revenue Growth',
    yMetric: 'EV/EBITDA',
    correlation: round(correlation(growthValues, evEbitdaValues), 2),
    rSquared: round(Math.pow(correlation(growthValues, evEbitdaValues), 2), 2),
  });

  // =========================================================================
  // PEER GROUP SUMMARY
  // =========================================================================
  const marketCaps = validPeers.map(p => p.marketCap);
  const revenues = validPeers.map(p => p.revenue);

  const peerGroup = {
    count: validPeers.length,
    medianMarketCap: round(median(marketCaps)),
    medianRevenue: round(median(revenues)),
    marketCapRange: {
      min: round(Math.min(...marketCaps)),
      max: round(Math.max(...marketCaps)),
    },
  };

  return {
    peerGroup,
    multiples,
    targetValuation,
    statistics,
    comparisonTable,
    correlations,
  };
}

// ============================================================================
// INDUSTRY PEER DATABASE
// ============================================================================

export interface IndustryPeerTemplate {
  industry: string;
  typicalMultiples: {
    evRevenue: { low: number; median: number; high: number };
    evEbitda: { low: number; median: number; high: number };
  };
  keyMetrics: string[];
  description: string;
}

export const INDUSTRY_TEMPLATES: IndustryPeerTemplate[] = [
  {
    industry: 'Enterprise Software (SaaS)',
    typicalMultiples: {
      evRevenue: { low: 5, median: 10, high: 20 },
      evEbitda: { low: 15, median: 25, high: 40 },
    },
    keyMetrics: ['ARR Growth', 'Net Revenue Retention', 'Rule of 40'],
    description: 'High-growth B2B software companies with recurring revenue',
  },
  {
    industry: 'Consumer Internet',
    typicalMultiples: {
      evRevenue: { low: 3, median: 6, high: 12 },
      evEbitda: { low: 12, median: 18, high: 30 },
    },
    keyMetrics: ['MAU Growth', 'ARPU', 'Engagement'],
    description: 'Consumer-facing internet platforms and marketplaces',
  },
  {
    industry: 'Fintech',
    typicalMultiples: {
      evRevenue: { low: 4, median: 8, high: 15 },
      evEbitda: { low: 15, median: 22, high: 35 },
    },
    keyMetrics: ['TPV Growth', 'Take Rate', 'Net Revenue Retention'],
    description: 'Financial technology and payments companies',
  },
  {
    industry: 'Healthcare IT',
    typicalMultiples: {
      evRevenue: { low: 3, median: 5, high: 10 },
      evEbitda: { low: 12, median: 18, high: 25 },
    },
    keyMetrics: ['Bookings', 'Customer Retention', 'HIPAA Compliance'],
    description: 'Healthcare technology and services',
  },
  {
    industry: 'E-commerce',
    typicalMultiples: {
      evRevenue: { low: 0.5, median: 1.5, high: 3 },
      evEbitda: { low: 8, median: 12, high: 20 },
    },
    keyMetrics: ['GMV Growth', 'Take Rate', 'CAC/LTV'],
    description: 'Online retail and marketplace platforms',
  },
  {
    industry: 'Industrial Technology',
    typicalMultiples: {
      evRevenue: { low: 1, median: 2.5, high: 5 },
      evEbitda: { low: 8, median: 12, high: 18 },
    },
    keyMetrics: ['Backlog', 'Book-to-Bill', 'Recurring Revenue %'],
    description: 'Industrial software and IoT solutions',
  },
  {
    industry: 'Media & Entertainment',
    typicalMultiples: {
      evRevenue: { low: 1.5, median: 3, high: 6 },
      evEbitda: { low: 8, median: 12, high: 18 },
    },
    keyMetrics: ['Subscriber Growth', 'ARPU', 'Churn Rate'],
    description: 'Streaming, gaming, and digital media',
  },
  {
    industry: 'Traditional Software',
    typicalMultiples: {
      evRevenue: { low: 2, median: 4, high: 8 },
      evEbitda: { low: 10, median: 15, high: 22 },
    },
    keyMetrics: ['License Revenue', 'Maintenance Attach', 'Customer Count'],
    description: 'On-premise and perpetual license software',
  },
];

export function getIndustryTemplate(industry: string): IndustryPeerTemplate | undefined {
  return INDUSTRY_TEMPLATES.find(
    t => t.industry.toLowerCase().includes(industry.toLowerCase())
  );
}

// ============================================================================
// VALUATION FOOTBALL FIELD
// ============================================================================

export interface FootballFieldData {
  method: string;
  low: number;
  mid: number;
  high: number;
  current?: number;
}

export function generateFootballField(
  compsResult: CompsAnalysisResult,
  dcfValue?: { low: number; mid: number; high: number },
  ltmValue?: number
): FootballFieldData[] {
  const data: FootballFieldData[] = [];

  // Add comps-based valuations
  compsResult.targetValuation.forEach(tv => {
    data.push({
      method: `Comps (${tv.metric})`,
      low: tv.impliedEquity.low,
      mid: tv.impliedEquity.median,
      high: tv.impliedEquity.high,
    });
  });

  // Add DCF if provided
  if (dcfValue) {
    data.push({
      method: 'DCF',
      low: dcfValue.low,
      mid: dcfValue.mid,
      high: dcfValue.high,
    });
  }

  // Add 52-week range if LTM value provided
  if (ltmValue) {
    data.push({
      method: '52-Week Range',
      low: ltmValue * 0.7,
      mid: ltmValue,
      high: ltmValue * 1.3,
      current: ltmValue,
    });
  }

  return data;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

export function formatCompsSummary(result: CompsAnalysisResult): string {
  const lines: string[] = [];

  lines.push('=== COMPARABLE COMPANY ANALYSIS ===');
  lines.push('');
  lines.push(`Peer Group: ${result.peerGroup.count} companies`);
  lines.push(`Median Market Cap: $${(result.peerGroup.medianMarketCap / 1e6).toFixed(0)}M`);
  lines.push(`Median Revenue: $${(result.peerGroup.medianRevenue / 1e6).toFixed(0)}M`);
  lines.push('');
  lines.push('--- TRADING MULTIPLES ---');

  result.statistics.forEach(stat => {
    lines.push(`${stat.metric}: ${stat.median}x (${stat.min}x - ${stat.max}x)`);
  });

  lines.push('');
  lines.push('--- IMPLIED VALUATION ---');

  result.targetValuation.forEach(tv => {
    lines.push(`Based on ${tv.metric}:`);
    lines.push(`  EV: $${(tv.impliedEV.low / 1e6).toFixed(0)}M - $${(tv.impliedEV.high / 1e6).toFixed(0)}M`);
    lines.push(`  Equity: $${(tv.impliedEquity.low / 1e6).toFixed(0)}M - $${(tv.impliedEquity.high / 1e6).toFixed(0)}M`);
  });

  return lines.join('\n');
}
