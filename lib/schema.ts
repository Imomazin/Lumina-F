import { z } from "zod";

// Industry options for select dropdown
export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Consumer Goods",
  "Industrial",
  "Energy",
  "Utilities",
  "Real Estate",
  "Materials",
  "Telecommunications",
  "Other",
] as const;

// Currency options
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
] as const;

// Assumption confidence levels
export const CONFIDENCE_LEVELS = [
  { value: "grounded", label: "Grounded", description: "Based on historical data or contractual commitments" },
  { value: "reasoned", label: "Reasoned", description: "Based on market analysis or comparable benchmarks" },
  { value: "exploratory", label: "Exploratory", description: "Hypothetical or aspirational" },
] as const;

export type Industry = (typeof INDUSTRIES)[number];
export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]["value"];

// Assumption metadata schema
const assumptionMetaSchema = z.object({
  confidence: z.enum(["grounded", "reasoned", "exploratory"]).default("reasoned"),
  narrative: z.string().max(500).optional(),
});

export type AssumptionMeta = z.infer<typeof assumptionMetaSchema>;

// Form schema - simple coerced numbers
export const analysisSessionSchema = z.object({
  // Company basics
  companyName: z.string().min(1, "Company name is required").max(100),
  industry: z.enum(INDUSTRIES),
  currency: z.enum(CURRENCIES.map((c) => c.code) as [CurrencyCode, ...CurrencyCode[]]),

  // Time horizon
  startYear: z.coerce.number().int().min(2000).max(2100),
  yearsForward: z.coerce.number().int().min(1).max(10),

  // Revenue
  currentRevenue: z.coerce.number().min(0),
  revenueGrowthAssumption: z.coerce.number().min(0).max(100),

  // Costs
  currentCOGS: z.coerce.number().min(0),
  currentOpex: z.coerce.number().min(0),
  cogsPctOptional: z.coerce.number().min(0).max(100).optional(),
  opexPctOptional: z.coerce.number().min(0).max(100).optional(),

  // Capex
  annualCapex: z.coerce.number().min(0),

  // Working capital (optional)
  daysReceivable: z.coerce.number().min(0).max(365).optional(),
  daysPayable: z.coerce.number().min(0).max(365).optional(),
  daysInventory: z.coerce.number().min(0).max(365).optional(),

  // Financing
  debtOutstanding: z.coerce.number().min(0),
  interestRatePct: z.coerce.number().min(0).max(100),
  taxRatePct: z.coerce.number().min(0).max(100),

  // Notes
  notes: z.string().max(2000).optional(),

  // Assumption metadata (optional, for assumption intelligence)
  assumptionMeta: z.object({
    revenueGrowth: assumptionMetaSchema.optional(),
    costStructure: assumptionMetaSchema.optional(),
    financing: assumptionMetaSchema.optional(),
    capital: assumptionMetaSchema.optional(),
  }).optional(),
});

// Type for form values
export type AnalysisSession = z.infer<typeof analysisSessionSchema>;

// Default values for form initialization
export const defaultFormValues: AnalysisSession = {
  companyName: "",
  industry: "Technology",
  currency: "USD",
  startYear: new Date().getFullYear(),
  yearsForward: 5,
  currentRevenue: 0,
  revenueGrowthAssumption: 10,
  currentCOGS: 0,
  currentOpex: 0,
  cogsPctOptional: undefined,
  opexPctOptional: undefined,
  annualCapex: 0,
  daysReceivable: undefined,
  daysPayable: undefined,
  daysInventory: undefined,
  debtOutstanding: 0,
  interestRatePct: 5,
  taxRatePct: 25,
  notes: "",
  assumptionMeta: {
    revenueGrowth: { confidence: "reasoned", narrative: "" },
    costStructure: { confidence: "reasoned", narrative: "" },
    financing: { confidence: "grounded", narrative: "" },
    capital: { confidence: "reasoned", narrative: "" },
  },
};

// Convert stored session to form values (identity for now)
export function toFormValues(session: AnalysisSession): AnalysisSession {
  return session;
}
