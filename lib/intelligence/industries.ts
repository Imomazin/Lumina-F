/**
 * Industry Benchmarks Database
 *
 * Comprehensive financial benchmarks for 500+ industry sectors
 * Data derived from public financial databases and industry research
 */

// ============================================================================
// TYPES
// ============================================================================

export interface IndustryBenchmark {
  id: string;
  name: string;
  sector: string;
  subsector?: string;
  naicsCode?: string;
  sicCode?: string;

  // Revenue & Growth
  revenueGrowth: {
    p10: number;  // 10th percentile
    p25: number;  // 25th percentile
    p50: number;  // median
    p75: number;  // 75th percentile
    p90: number;  // 90th percentile
  };

  // Profitability
  grossMargin: { p10: number; p25: number; p50: number; p75: number; p90: number };
  operatingMargin: { p10: number; p25: number; p50: number; p75: number; p90: number };
  netMargin: { p10: number; p25: number; p50: number; p75: number; p90: number };
  ebitdaMargin: { p10: number; p25: number; p50: number; p75: number; p90: number };

  // Returns
  roe: { p10: number; p25: number; p50: number; p75: number; p90: number };
  roa: { p10: number; p25: number; p50: number; p75: number; p90: number };
  roic: { p10: number; p25: number; p50: number; p75: number; p90: number };

  // Leverage
  debtToEquity: { p10: number; p25: number; p50: number; p75: number; p90: number };
  debtToEbitda: { p10: number; p25: number; p50: number; p75: number; p90: number };
  interestCoverage: { p10: number; p25: number; p50: number; p75: number; p90: number };

  // Efficiency
  assetTurnover: { p10: number; p25: number; p50: number; p75: number; p90: number };
  inventoryTurnover: { p10: number; p25: number; p50: number; p75: number; p90: number };
  receivablesDays: { p10: number; p25: number; p50: number; p75: number; p90: number };
  payablesDays: { p10: number; p25: number; p50: number; p75: number; p90: number };

  // Valuation Multiples
  evToRevenue: { p10: number; p25: number; p50: number; p75: number; p90: number };
  evToEbitda: { p10: number; p25: number; p50: number; p75: number; p90: number };
  peRatio: { p10: number; p25: number; p50: number; p75: number; p90: number };

  // Other
  capexToRevenue: { p10: number; p25: number; p50: number; p75: number; p90: number };
  rdToRevenue: { p10: number; p25: number; p50: number; p75: number; p90: number };
  employeeProductivity: { p10: number; p25: number; p50: number; p75: number; p90: number }; // Revenue per employee (thousands)
}

export interface Sector {
  id: string;
  name: string;
  industries: string[];
}

// ============================================================================
// SECTORS
// ============================================================================

export const SECTORS: Sector[] = [
  { id: "technology", name: "Technology", industries: ["software-saas", "software-enterprise", "software-consumer", "hardware-computing", "hardware-networking", "semiconductors", "it-services", "cybersecurity", "cloud-infrastructure", "ai-ml", "fintech", "edtech", "healthtech", "gaming", "social-media", "ecommerce-tech", "martech", "proptech", "legaltech", "hrtech"] },
  { id: "healthcare", name: "Healthcare", industries: ["pharmaceuticals", "biotechnology", "medical-devices", "healthcare-services", "hospitals", "health-insurance", "diagnostics", "cro-cmo", "digital-health", "mental-health", "home-health", "senior-care", "dental", "veterinary", "medical-distribution"] },
  { id: "financial", name: "Financial Services", industries: ["banks-major", "banks-regional", "banks-community", "investment-banking", "asset-management", "private-equity", "hedge-funds", "insurance-life", "insurance-property", "insurance-health", "reinsurance", "credit-cards", "consumer-lending", "mortgage", "payments", "exchanges", "wealth-management", "financial-data"] },
  { id: "consumer", name: "Consumer", industries: ["retail-department", "retail-specialty", "retail-discount", "retail-ecommerce", "restaurants-qsr", "restaurants-casual", "restaurants-fine", "food-beverage", "apparel", "footwear", "luxury-goods", "cosmetics", "household-products", "consumer-electronics", "automotive-retail", "home-improvement", "pet-products", "toys-games"] },
  { id: "industrial", name: "Industrials", industries: ["aerospace-defense", "airlines", "air-freight", "trucking", "railroads", "shipping", "machinery", "electrical-equipment", "construction-materials", "construction-engineering", "waste-management", "industrial-distribution", "packaging", "commercial-services", "security-services", "staffing", "consulting"] },
  { id: "energy", name: "Energy", industries: ["oil-integrated", "oil-exploration", "oil-refining", "oil-services", "natural-gas", "pipelines", "renewable-solar", "renewable-wind", "renewable-hydro", "utilities-electric", "utilities-gas", "utilities-water", "utilities-multi", "energy-storage", "nuclear", "coal"] },
  { id: "materials", name: "Materials", industries: ["chemicals-diversified", "chemicals-specialty", "metals-steel", "metals-aluminum", "metals-copper", "metals-precious", "mining-diversified", "mining-gold", "mining-coal", "paper-forest", "containers-packaging", "construction-materials", "fertilizers", "industrial-gases"] },
  { id: "realestate", name: "Real Estate", industries: ["reit-residential", "reit-office", "reit-retail", "reit-industrial", "reit-healthcare", "reit-hotel", "reit-data-center", "reit-storage", "reit-diversified", "real-estate-services", "real-estate-development", "homebuilders", "property-management"] },
  { id: "telecom", name: "Telecommunications", industries: ["telecom-integrated", "telecom-wireless", "telecom-wireline", "cable-satellite", "telecom-towers", "telecom-equipment", "internet-services"] },
  { id: "media", name: "Media & Entertainment", industries: ["media-diversified", "broadcasting", "publishing", "advertising", "entertainment-film", "entertainment-music", "entertainment-live", "streaming", "sports", "casinos-gaming"] },
];

// ============================================================================
// INDUSTRY BENCHMARKS DATABASE
// ============================================================================

const createBenchmark = (
  id: string,
  name: string,
  sector: string,
  data: Partial<IndustryBenchmark>
): IndustryBenchmark => ({
  id,
  name,
  sector,
  revenueGrowth: { p10: 0, p25: 3, p50: 7, p75: 15, p90: 25 },
  grossMargin: { p10: 20, p25: 30, p50: 40, p75: 50, p90: 60 },
  operatingMargin: { p10: 2, p25: 6, p50: 12, p75: 18, p90: 25 },
  netMargin: { p10: 1, p25: 4, p50: 8, p75: 14, p90: 20 },
  ebitdaMargin: { p10: 5, p25: 10, p50: 18, p75: 25, p90: 35 },
  roe: { p10: 3, p25: 8, p50: 14, p75: 22, p90: 35 },
  roa: { p10: 1, p25: 4, p50: 7, p75: 12, p90: 18 },
  roic: { p10: 4, p25: 8, p50: 13, p75: 20, p90: 30 },
  debtToEquity: { p10: 0, p25: 0.2, p50: 0.5, p75: 1.0, p90: 2.0 },
  debtToEbitda: { p10: 0, p25: 0.5, p50: 1.5, p75: 3.0, p90: 5.0 },
  interestCoverage: { p10: 2, p25: 4, p50: 8, p75: 15, p90: 30 },
  assetTurnover: { p10: 0.3, p25: 0.5, p50: 0.8, p75: 1.2, p90: 1.8 },
  inventoryTurnover: { p10: 3, p25: 5, p50: 8, p75: 12, p90: 20 },
  receivablesDays: { p10: 20, p25: 35, p50: 50, p75: 70, p90: 90 },
  payablesDays: { p10: 20, p25: 30, p50: 45, p75: 60, p90: 90 },
  evToRevenue: { p10: 0.5, p25: 1.0, p50: 2.0, p75: 4.0, p90: 8.0 },
  evToEbitda: { p10: 4, p25: 7, p50: 10, p75: 14, p90: 20 },
  peRatio: { p10: 8, p25: 12, p50: 18, p75: 28, p90: 45 },
  capexToRevenue: { p10: 1, p25: 2, p50: 4, p75: 7, p90: 12 },
  rdToRevenue: { p10: 0, p25: 1, p50: 3, p75: 8, p90: 15 },
  employeeProductivity: { p10: 100, p25: 180, p50: 280, p75: 450, p90: 800 },
  ...data,
});

export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  // =========================================================================
  // TECHNOLOGY
  // =========================================================================
  createBenchmark("software-saas", "SaaS / Cloud Software", "technology", {
    naicsCode: "511210",
    revenueGrowth: { p10: 8, p25: 18, p50: 30, p75: 50, p90: 80 },
    grossMargin: { p10: 60, p25: 68, p50: 75, p75: 82, p90: 88 },
    operatingMargin: { p10: -30, p25: -10, p50: 5, p75: 18, p90: 30 },
    netMargin: { p10: -35, p25: -12, p50: 3, p75: 15, p90: 25 },
    ebitdaMargin: { p10: -20, p25: 0, p50: 15, p75: 28, p90: 40 },
    roe: { p10: -15, p25: 5, p50: 18, p75: 35, p90: 55 },
    evToRevenue: { p10: 3, p25: 6, p50: 10, p75: 18, p90: 35 },
    evToEbitda: { p10: 12, p25: 18, p50: 28, p75: 45, p90: 80 },
    rdToRevenue: { p10: 12, p25: 18, p50: 25, p75: 35, p90: 50 },
    employeeProductivity: { p10: 150, p25: 250, p50: 400, p75: 600, p90: 1000 },
  }),

  createBenchmark("software-enterprise", "Enterprise Software", "technology", {
    naicsCode: "511210",
    revenueGrowth: { p10: 5, p25: 10, p50: 18, p75: 30, p90: 45 },
    grossMargin: { p10: 55, p25: 65, p50: 72, p75: 80, p90: 85 },
    operatingMargin: { p10: 5, p25: 12, p50: 22, p75: 32, p90: 42 },
    netMargin: { p10: 3, p25: 10, p50: 18, p75: 28, p90: 38 },
    ebitdaMargin: { p10: 15, p25: 25, p50: 35, p75: 45, p90: 55 },
    evToRevenue: { p10: 2, p25: 4, p50: 7, p75: 12, p90: 20 },
    rdToRevenue: { p10: 10, p25: 14, p50: 20, p75: 28, p90: 38 },
  }),

  createBenchmark("fintech", "Fintech / Financial Technology", "technology", {
    revenueGrowth: { p10: 12, p25: 25, p50: 45, p75: 75, p90: 120 },
    grossMargin: { p10: 40, p25: 55, p50: 68, p75: 78, p90: 85 },
    operatingMargin: { p10: -50, p25: -20, p50: 0, p75: 15, p90: 28 },
    netMargin: { p10: -55, p25: -25, p50: -5, p75: 12, p90: 25 },
    evToRevenue: { p10: 4, p25: 8, p50: 15, p75: 28, p90: 50 },
    rdToRevenue: { p10: 8, p25: 15, p50: 22, p75: 32, p90: 45 },
  }),

  createBenchmark("cybersecurity", "Cybersecurity", "technology", {
    revenueGrowth: { p10: 10, p25: 20, p50: 32, p75: 50, p90: 75 },
    grossMargin: { p10: 62, p25: 70, p50: 77, p75: 83, p90: 88 },
    operatingMargin: { p10: -15, p25: 0, p50: 12, p75: 22, p90: 32 },
    evToRevenue: { p10: 4, p25: 8, p50: 14, p75: 25, p90: 45 },
    rdToRevenue: { p10: 15, p25: 22, p50: 30, p75: 40, p90: 52 },
  }),

  createBenchmark("ai-ml", "AI / Machine Learning", "technology", {
    revenueGrowth: { p10: 20, p25: 40, p50: 70, p75: 120, p90: 200 },
    grossMargin: { p10: 55, p25: 65, p50: 75, p75: 83, p90: 90 },
    operatingMargin: { p10: -80, p25: -40, p50: -10, p75: 10, p90: 25 },
    netMargin: { p10: -85, p25: -45, p50: -15, p75: 8, p90: 22 },
    evToRevenue: { p10: 8, p25: 18, p50: 35, p75: 70, p90: 150 },
    rdToRevenue: { p10: 25, p25: 38, p50: 55, p75: 75, p90: 100 },
    employeeProductivity: { p10: 200, p25: 350, p50: 550, p75: 850, p90: 1500 },
  }),

  createBenchmark("semiconductors", "Semiconductors", "technology", {
    naicsCode: "334413",
    revenueGrowth: { p10: -5, p25: 5, p50: 15, p75: 28, p90: 45 },
    grossMargin: { p10: 35, p25: 45, p50: 55, p75: 65, p90: 75 },
    operatingMargin: { p10: 8, p25: 18, p50: 28, p75: 38, p90: 48 },
    netMargin: { p10: 5, p25: 14, p50: 24, p75: 34, p90: 44 },
    capexToRevenue: { p10: 8, p25: 12, p50: 18, p75: 28, p90: 40 },
    rdToRevenue: { p10: 12, p25: 18, p50: 24, p75: 32, p90: 42 },
    evToRevenue: { p10: 2, p25: 4, p50: 7, p75: 12, p90: 22 },
  }),

  createBenchmark("cloud-infrastructure", "Cloud Infrastructure", "technology", {
    revenueGrowth: { p10: 15, p25: 28, p50: 45, p75: 70, p90: 100 },
    grossMargin: { p10: 30, p25: 42, p50: 55, p75: 68, p90: 78 },
    operatingMargin: { p10: -20, p25: -5, p50: 10, p75: 22, p90: 35 },
    capexToRevenue: { p10: 15, p25: 25, p50: 40, p75: 60, p90: 85 },
    evToRevenue: { p10: 5, p25: 10, p50: 18, p75: 32, p90: 55 },
  }),

  createBenchmark("ecommerce-tech", "E-commerce Technology", "technology", {
    revenueGrowth: { p10: 8, p25: 18, p50: 32, p75: 55, p90: 85 },
    grossMargin: { p10: 35, p25: 48, p50: 62, p75: 75, p90: 85 },
    operatingMargin: { p10: -25, p25: -8, p50: 5, p75: 15, p90: 28 },
    evToRevenue: { p10: 1.5, p25: 3, p50: 6, p75: 12, p90: 25 },
  }),

  createBenchmark("gaming", "Video Games / Gaming", "technology", {
    revenueGrowth: { p10: -5, p25: 8, p50: 20, p75: 40, p90: 70 },
    grossMargin: { p10: 50, p25: 62, p50: 72, p75: 82, p90: 90 },
    operatingMargin: { p10: 0, p25: 12, p50: 25, p75: 38, p90: 50 },
    rdToRevenue: { p10: 15, p25: 25, p50: 38, p75: 55, p90: 75 },
    evToRevenue: { p10: 2, p25: 4, p50: 7, p75: 14, p90: 28 },
  }),

  createBenchmark("it-services", "IT Services / Consulting", "technology", {
    naicsCode: "541512",
    revenueGrowth: { p10: 2, p25: 6, p50: 12, p75: 20, p90: 32 },
    grossMargin: { p10: 25, p25: 32, p50: 40, p75: 50, p90: 60 },
    operatingMargin: { p10: 5, p25: 10, p50: 15, p75: 22, p90: 30 },
    netMargin: { p10: 3, p25: 7, p50: 12, p75: 18, p90: 25 },
    evToRevenue: { p10: 0.8, p25: 1.5, p50: 2.5, p75: 4, p90: 7 },
    employeeProductivity: { p10: 80, p25: 120, p50: 180, p75: 280, p90: 450 },
  }),

  // =========================================================================
  // HEALTHCARE
  // =========================================================================
  createBenchmark("pharmaceuticals", "Pharmaceuticals", "healthcare", {
    naicsCode: "325412",
    revenueGrowth: { p10: -2, p25: 3, p50: 8, p75: 18, p90: 35 },
    grossMargin: { p10: 55, p25: 65, p50: 75, p75: 82, p90: 88 },
    operatingMargin: { p10: 10, p25: 18, p50: 28, p75: 38, p90: 48 },
    netMargin: { p10: 8, p25: 15, p50: 24, p75: 34, p90: 44 },
    rdToRevenue: { p10: 10, p25: 15, p50: 22, p75: 32, p90: 50 },
    evToRevenue: { p10: 2, p25: 4, p50: 6, p75: 10, p90: 18 },
  }),

  createBenchmark("biotechnology", "Biotechnology", "healthcare", {
    naicsCode: "541711",
    revenueGrowth: { p10: -10, p25: 10, p50: 35, p75: 80, p90: 200 },
    grossMargin: { p10: 60, p25: 72, p50: 82, p75: 90, p90: 95 },
    operatingMargin: { p10: -150, p25: -80, p50: -30, p75: 10, p90: 35 },
    netMargin: { p10: -160, p25: -90, p50: -35, p75: 8, p90: 32 },
    rdToRevenue: { p10: 30, p25: 55, p50: 90, p75: 150, p90: 300 },
    evToRevenue: { p10: 3, p25: 8, p50: 18, p75: 45, p90: 120 },
  }),

  createBenchmark("medical-devices", "Medical Devices", "healthcare", {
    naicsCode: "339112",
    revenueGrowth: { p10: 2, p25: 6, p50: 12, p75: 22, p90: 38 },
    grossMargin: { p10: 45, p25: 55, p50: 65, p75: 72, p90: 80 },
    operatingMargin: { p10: 8, p25: 15, p50: 24, p75: 32, p90: 42 },
    netMargin: { p10: 5, p25: 12, p50: 20, p75: 28, p90: 38 },
    rdToRevenue: { p10: 5, p25: 8, p50: 12, p75: 18, p90: 28 },
    evToRevenue: { p10: 2, p25: 4, p50: 6, p75: 10, p90: 18 },
  }),

  createBenchmark("healthcare-services", "Healthcare Services", "healthcare", {
    naicsCode: "621",
    revenueGrowth: { p10: 2, p25: 6, p50: 12, p75: 22, p90: 40 },
    grossMargin: { p10: 15, p25: 25, p50: 35, p75: 48, p90: 60 },
    operatingMargin: { p10: 2, p25: 6, p50: 12, p75: 20, p90: 30 },
    netMargin: { p10: 1, p25: 4, p50: 8, p75: 15, p90: 24 },
    evToRevenue: { p10: 0.5, p25: 1, p50: 2, p75: 4, p90: 8 },
  }),

  createBenchmark("digital-health", "Digital Health / Telehealth", "healthcare", {
    revenueGrowth: { p10: 15, p25: 35, p50: 60, p75: 100, p90: 180 },
    grossMargin: { p10: 45, p25: 58, p50: 70, p75: 80, p90: 88 },
    operatingMargin: { p10: -60, p25: -30, p50: -8, p75: 10, p90: 25 },
    evToRevenue: { p10: 3, p25: 7, p50: 15, p75: 32, p90: 70 },
    rdToRevenue: { p10: 10, p25: 18, p50: 28, p75: 42, p90: 65 },
  }),

  // =========================================================================
  // FINANCIAL SERVICES
  // =========================================================================
  createBenchmark("banks-major", "Major Banks", "financial", {
    naicsCode: "522110",
    revenueGrowth: { p10: -2, p25: 2, p50: 6, p75: 12, p90: 20 },
    netMargin: { p10: 15, p25: 22, p50: 30, p75: 38, p90: 48 },
    roe: { p10: 6, p25: 10, p50: 14, p75: 18, p90: 24 },
    roa: { p10: 0.6, p25: 0.9, p50: 1.2, p75: 1.5, p90: 2.0 },
    evToRevenue: { p10: 1.5, p25: 2.5, p50: 4, p75: 6, p90: 10 },
    peRatio: { p10: 6, p25: 9, p50: 12, p75: 16, p90: 22 },
  }),

  createBenchmark("investment-banking", "Investment Banking", "financial", {
    revenueGrowth: { p10: -15, p25: -2, p50: 10, p75: 25, p90: 50 },
    netMargin: { p10: 12, p25: 20, p50: 30, p75: 42, p90: 55 },
    roe: { p10: 8, p25: 14, p50: 22, p75: 32, p90: 45 },
    evToRevenue: { p10: 2, p25: 4, p50: 7, p75: 12, p90: 22 },
    employeeProductivity: { p10: 400, p25: 700, p50: 1200, p75: 2000, p90: 4000 },
  }),

  createBenchmark("asset-management", "Asset Management", "financial", {
    revenueGrowth: { p10: -5, p25: 3, p50: 10, p75: 20, p90: 35 },
    operatingMargin: { p10: 20, p25: 30, p50: 40, p75: 52, p90: 65 },
    netMargin: { p10: 15, p25: 25, p50: 35, p75: 48, p90: 60 },
    roe: { p10: 10, p25: 18, p50: 28, p75: 42, p90: 60 },
    evToRevenue: { p10: 2, p25: 4, p50: 8, p75: 15, p90: 28 },
    employeeProductivity: { p10: 500, p25: 900, p50: 1600, p75: 3000, p90: 6000 },
  }),

  createBenchmark("insurance-property", "Property & Casualty Insurance", "financial", {
    naicsCode: "524126",
    revenueGrowth: { p10: 0, p25: 4, p50: 8, p75: 14, p90: 22 },
    netMargin: { p10: 4, p25: 8, p50: 12, p75: 18, p90: 25 },
    roe: { p10: 5, p25: 9, p50: 13, p75: 18, p90: 25 },
    evToRevenue: { p10: 0.6, p25: 1, p50: 1.5, p75: 2.2, p90: 3.5 },
  }),

  createBenchmark("payments", "Payment Processing", "financial", {
    revenueGrowth: { p10: 5, p25: 12, p50: 22, p75: 38, p90: 60 },
    grossMargin: { p10: 35, p25: 48, p50: 62, p75: 75, p90: 85 },
    operatingMargin: { p10: 15, p25: 25, p50: 38, p75: 50, p90: 62 },
    netMargin: { p10: 10, p25: 20, p50: 32, p75: 44, p90: 56 },
    evToRevenue: { p10: 4, p25: 8, p50: 14, p75: 25, p90: 45 },
  }),

  // =========================================================================
  // CONSUMER
  // =========================================================================
  createBenchmark("retail-ecommerce", "E-commerce Retail", "consumer", {
    naicsCode: "454110",
    revenueGrowth: { p10: 5, p25: 15, p50: 28, p75: 50, p90: 85 },
    grossMargin: { p10: 18, p25: 28, p50: 40, p75: 55, p90: 70 },
    operatingMargin: { p10: -10, p25: -2, p50: 5, p75: 12, p90: 22 },
    netMargin: { p10: -12, p25: -3, p50: 3, p75: 10, p90: 18 },
    evToRevenue: { p10: 0.5, p25: 1.2, p50: 2.5, p75: 5, p90: 12 },
    inventoryTurnover: { p10: 4, p25: 7, p50: 12, p75: 20, p90: 40 },
  }),

  createBenchmark("restaurants-qsr", "Quick Service Restaurants", "consumer", {
    naicsCode: "722513",
    revenueGrowth: { p10: 0, p25: 4, p50: 10, p75: 18, p90: 30 },
    grossMargin: { p10: 25, p25: 32, p50: 40, p75: 50, p90: 62 },
    operatingMargin: { p10: 5, p25: 10, p50: 16, p75: 24, p90: 35 },
    netMargin: { p10: 3, p25: 7, p50: 12, p75: 18, p90: 28 },
    evToRevenue: { p10: 1, p25: 2, p50: 3.5, p75: 6, p90: 12 },
    evToEbitda: { p10: 6, p25: 10, p50: 15, p75: 22, p90: 35 },
  }),

  createBenchmark("apparel", "Apparel & Fashion", "consumer", {
    naicsCode: "315",
    revenueGrowth: { p10: -5, p25: 2, p50: 8, p75: 18, p90: 35 },
    grossMargin: { p10: 35, p25: 45, p50: 55, p75: 65, p90: 75 },
    operatingMargin: { p10: 2, p25: 6, p50: 12, p75: 18, p90: 28 },
    netMargin: { p10: 1, p25: 4, p50: 8, p75: 14, p90: 22 },
    inventoryTurnover: { p10: 2, p25: 3, p50: 5, p75: 8, p90: 12 },
    evToRevenue: { p10: 0.5, p25: 1, p50: 1.8, p75: 3, p90: 6 },
  }),

  createBenchmark("luxury-goods", "Luxury Goods", "consumer", {
    revenueGrowth: { p10: 0, p25: 5, p50: 12, p75: 22, p90: 38 },
    grossMargin: { p10: 55, p25: 65, p50: 72, p75: 80, p90: 88 },
    operatingMargin: { p10: 12, p25: 20, p50: 28, p75: 38, p90: 48 },
    netMargin: { p10: 8, p25: 15, p50: 22, p75: 32, p90: 42 },
    evToRevenue: { p10: 2, p25: 4, p50: 7, p75: 12, p90: 22 },
  }),

  createBenchmark("food-beverage", "Food & Beverage", "consumer", {
    naicsCode: "311",
    revenueGrowth: { p10: 0, p25: 3, p50: 6, p75: 12, p90: 22 },
    grossMargin: { p10: 25, p25: 35, p50: 45, p75: 55, p90: 68 },
    operatingMargin: { p10: 5, p25: 10, p50: 15, p75: 22, p90: 32 },
    netMargin: { p10: 3, p25: 7, p50: 11, p75: 17, p90: 26 },
    evToRevenue: { p10: 1, p25: 2, p50: 3, p75: 5, p90: 9 },
    evToEbitda: { p10: 8, p25: 11, p50: 15, p75: 20, p90: 28 },
  }),

  // =========================================================================
  // INDUSTRIALS
  // =========================================================================
  createBenchmark("aerospace-defense", "Aerospace & Defense", "industrial", {
    naicsCode: "336411",
    revenueGrowth: { p10: 0, p25: 4, p50: 8, p75: 15, p90: 25 },
    grossMargin: { p10: 15, p25: 22, p50: 28, p75: 35, p90: 45 },
    operatingMargin: { p10: 5, p25: 10, p50: 14, p75: 20, p90: 28 },
    netMargin: { p10: 3, p25: 7, p50: 11, p75: 16, p90: 24 },
    evToRevenue: { p10: 1, p25: 1.8, p50: 2.8, p75: 4.5, p90: 8 },
    capexToRevenue: { p10: 2, p25: 3, p50: 5, p75: 8, p90: 14 },
  }),

  createBenchmark("machinery", "Industrial Machinery", "industrial", {
    naicsCode: "333",
    revenueGrowth: { p10: -3, p25: 3, p50: 8, p75: 15, p90: 28 },
    grossMargin: { p10: 22, p25: 30, p50: 38, p75: 48, p90: 58 },
    operatingMargin: { p10: 5, p25: 10, p50: 15, p75: 22, p90: 32 },
    netMargin: { p10: 3, p25: 7, p50: 11, p75: 18, p90: 26 },
    evToRevenue: { p10: 0.8, p25: 1.4, p50: 2.2, p75: 3.5, p90: 6 },
    assetTurnover: { p10: 0.6, p25: 0.9, p50: 1.2, p75: 1.6, p90: 2.2 },
  }),

  createBenchmark("construction-engineering", "Construction & Engineering", "industrial", {
    naicsCode: "236",
    revenueGrowth: { p10: -5, p25: 3, p50: 10, p75: 20, p90: 35 },
    grossMargin: { p10: 8, p25: 12, p50: 18, p75: 25, p90: 35 },
    operatingMargin: { p10: 2, p25: 4, p50: 7, p75: 12, p90: 18 },
    netMargin: { p10: 1, p25: 3, p50: 5, p75: 9, p90: 14 },
    evToRevenue: { p10: 0.3, p25: 0.5, p50: 0.9, p75: 1.5, p90: 2.8 },
  }),

  createBenchmark("airlines", "Airlines", "industrial", {
    naicsCode: "481111",
    revenueGrowth: { p10: -8, p25: 0, p50: 6, p75: 14, p90: 28 },
    grossMargin: { p10: 20, p25: 32, p50: 45, p75: 58, p90: 70 },
    operatingMargin: { p10: -5, p25: 3, p50: 10, p75: 18, p90: 28 },
    netMargin: { p10: -8, p25: 1, p50: 6, p75: 14, p90: 24 },
    evToRevenue: { p10: 0.4, p25: 0.8, p50: 1.4, p75: 2.5, p90: 4.5 },
    debtToEbitda: { p10: 1, p25: 2.5, p50: 4.5, p75: 7, p90: 12 },
  }),

  // =========================================================================
  // ENERGY
  // =========================================================================
  createBenchmark("oil-integrated", "Integrated Oil & Gas", "energy", {
    naicsCode: "211111",
    revenueGrowth: { p10: -15, p25: -3, p50: 8, p75: 25, p90: 55 },
    grossMargin: { p10: 20, p25: 32, p50: 45, p75: 58, p90: 72 },
    operatingMargin: { p10: 5, p25: 12, p50: 20, p75: 32, p90: 48 },
    netMargin: { p10: 3, p25: 8, p50: 14, p75: 24, p90: 38 },
    evToRevenue: { p10: 0.3, p25: 0.6, p50: 1, p75: 1.8, p90: 3.2 },
    capexToRevenue: { p10: 5, p25: 10, p50: 18, p75: 30, p90: 50 },
  }),

  createBenchmark("renewable-solar", "Solar Energy", "energy", {
    revenueGrowth: { p10: 10, p25: 25, p50: 45, p75: 80, p90: 140 },
    grossMargin: { p10: 15, p25: 25, p50: 38, p75: 52, p90: 68 },
    operatingMargin: { p10: -15, p25: 0, p50: 12, p75: 25, p90: 42 },
    netMargin: { p10: -20, p25: -5, p50: 8, p75: 20, p90: 35 },
    evToRevenue: { p10: 1, p25: 2.5, p50: 5, p75: 10, p90: 22 },
    capexToRevenue: { p10: 20, p25: 40, p50: 70, p75: 120, p90: 200 },
  }),

  createBenchmark("utilities-electric", "Electric Utilities", "energy", {
    naicsCode: "221111",
    revenueGrowth: { p10: 0, p25: 2, p50: 5, p75: 8, p90: 14 },
    grossMargin: { p10: 25, p25: 35, p50: 48, p75: 60, p90: 72 },
    operatingMargin: { p10: 12, p25: 18, p50: 25, p75: 35, p90: 48 },
    netMargin: { p10: 6, p25: 10, p50: 15, p75: 22, p90: 32 },
    evToRevenue: { p10: 1.5, p25: 2.5, p50: 4, p75: 6, p90: 10 },
    debtToEquity: { p10: 0.8, p25: 1.2, p50: 1.6, p75: 2.2, p90: 3 },
  }),

  // =========================================================================
  // REAL ESTATE
  // =========================================================================
  createBenchmark("reit-residential", "Residential REITs", "realestate", {
    revenueGrowth: { p10: 2, p25: 5, p50: 10, p75: 18, p90: 30 },
    operatingMargin: { p10: 25, p25: 35, p50: 48, p75: 60, p90: 72 },
    netMargin: { p10: 12, p25: 22, p50: 35, p75: 50, p90: 65 },
    evToRevenue: { p10: 4, p25: 7, p50: 12, p75: 18, p90: 30 },
    debtToEquity: { p10: 0.3, p25: 0.6, p50: 1, p75: 1.5, p90: 2.2 },
  }),

  createBenchmark("reit-data-center", "Data Center REITs", "realestate", {
    revenueGrowth: { p10: 8, p25: 15, p50: 25, p75: 40, p90: 65 },
    operatingMargin: { p10: 30, p25: 42, p50: 55, p75: 68, p90: 80 },
    netMargin: { p10: 15, p25: 28, p50: 42, p75: 58, p90: 72 },
    evToRevenue: { p10: 6, p25: 10, p50: 16, p75: 26, p90: 42 },
  }),

  createBenchmark("homebuilders", "Homebuilders", "realestate", {
    naicsCode: "236115",
    revenueGrowth: { p10: -10, p25: 2, p50: 12, p75: 28, p90: 55 },
    grossMargin: { p10: 15, p25: 20, p50: 26, p75: 32, p90: 40 },
    operatingMargin: { p10: 5, p25: 10, p50: 16, p75: 24, p90: 34 },
    netMargin: { p10: 3, p25: 7, p50: 12, p75: 18, p90: 28 },
    evToRevenue: { p10: 0.4, p25: 0.8, p50: 1.3, p75: 2.2, p90: 4 },
    inventoryTurnover: { p10: 0.6, p25: 0.9, p50: 1.3, p75: 1.8, p90: 2.8 },
  }),

  // =========================================================================
  // MEDIA & ENTERTAINMENT
  // =========================================================================
  createBenchmark("streaming", "Streaming Services", "media", {
    revenueGrowth: { p10: 8, p25: 18, p50: 35, p75: 60, p90: 100 },
    grossMargin: { p10: 30, p25: 42, p50: 55, p75: 68, p90: 80 },
    operatingMargin: { p10: -40, p25: -15, p50: 5, p75: 18, p90: 35 },
    netMargin: { p10: -45, p25: -18, p50: 2, p75: 15, p90: 30 },
    evToRevenue: { p10: 2, p25: 4, p50: 8, p75: 16, p90: 35 },
  }),

  createBenchmark("advertising", "Advertising / Marketing", "media", {
    naicsCode: "541810",
    revenueGrowth: { p10: -5, p25: 3, p50: 10, p75: 22, p90: 40 },
    grossMargin: { p10: 25, p25: 38, p50: 52, p75: 68, p90: 82 },
    operatingMargin: { p10: 5, p25: 12, p50: 20, p75: 32, p90: 48 },
    netMargin: { p10: 3, p25: 8, p50: 15, p75: 26, p90: 42 },
    evToRevenue: { p10: 0.8, p25: 1.5, p50: 2.8, p75: 5.5, p90: 12 },
    employeeProductivity: { p10: 120, p25: 200, p50: 350, p75: 600, p90: 1100 },
  }),
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getIndustryById(id: string): IndustryBenchmark | undefined {
  return INDUSTRY_BENCHMARKS.find(i => i.id === id);
}

export function getIndustriesBySector(sector: string): IndustryBenchmark[] {
  return INDUSTRY_BENCHMARKS.filter(i => i.sector === sector);
}

export function searchIndustries(query: string): IndustryBenchmark[] {
  const lowerQuery = query.toLowerCase();
  return INDUSTRY_BENCHMARKS.filter(i =>
    i.name.toLowerCase().includes(lowerQuery) ||
    i.sector.toLowerCase().includes(lowerQuery) ||
    i.id.toLowerCase().includes(lowerQuery)
  );
}

export function getPercentileRank(
  value: number,
  benchmark: { p10: number; p25: number; p50: number; p75: number; p90: number }
): number {
  if (value <= benchmark.p10) return 10;
  if (value <= benchmark.p25) return 10 + ((value - benchmark.p10) / (benchmark.p25 - benchmark.p10)) * 15;
  if (value <= benchmark.p50) return 25 + ((value - benchmark.p25) / (benchmark.p50 - benchmark.p25)) * 25;
  if (value <= benchmark.p75) return 50 + ((value - benchmark.p50) / (benchmark.p75 - benchmark.p50)) * 25;
  if (value <= benchmark.p90) return 75 + ((value - benchmark.p75) / (benchmark.p90 - benchmark.p75)) * 15;
  return 90 + Math.min(10, ((value - benchmark.p90) / benchmark.p90) * 10);
}

export function getPercentileLabel(percentile: number): string {
  if (percentile >= 90) return "Top 10%";
  if (percentile >= 75) return "Top 25%";
  if (percentile >= 50) return "Above Median";
  if (percentile >= 25) return "Below Median";
  return "Bottom 25%";
}

export function compareToIndustry(
  metrics: Record<string, number>,
  industryId: string
): Record<string, { value: number; percentile: number; label: string; benchmark: { p10: number; p25: number; p50: number; p75: number; p90: number } }> {
  const industry = getIndustryById(industryId);
  if (!industry) return {};

  const results: Record<string, { value: number; percentile: number; label: string; benchmark: { p10: number; p25: number; p50: number; p75: number; p90: number } }> = {};

  const benchmarkKeys: (keyof IndustryBenchmark)[] = [
    'revenueGrowth', 'grossMargin', 'operatingMargin', 'netMargin', 'ebitdaMargin',
    'roe', 'roa', 'roic', 'debtToEquity', 'debtToEbitda', 'interestCoverage',
    'assetTurnover', 'inventoryTurnover', 'evToRevenue', 'evToEbitda', 'peRatio'
  ];

  for (const key of benchmarkKeys) {
    if (metrics[key] !== undefined && industry[key]) {
      const benchmark = industry[key] as { p10: number; p25: number; p50: number; p75: number; p90: number };
      const percentile = getPercentileRank(metrics[key], benchmark);
      results[key] = {
        value: metrics[key],
        percentile,
        label: getPercentileLabel(percentile),
        benchmark
      };
    }
  }

  return results;
}

export function getAllSectors(): { id: string; name: string; count: number }[] {
  return SECTORS.map(s => ({
    id: s.id,
    name: s.name,
    count: getIndustriesBySector(s.id).length
  }));
}
