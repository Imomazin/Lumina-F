/**
 * AI Insights Engine
 *
 * GPT-powered financial analysis and recommendations
 */

import OpenAI from "openai";
import { AnalysisSession } from "@/lib/schema";
import { ForecastResult, ValuationMetrics, SensitivityAnalysis } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

// ============================================================================
// TYPES
// ============================================================================

export interface AIInsight {
  id: string;
  type: "strength" | "risk" | "opportunity" | "recommendation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: string;
}

export interface AIAnalysisResult {
  summary: string;
  insights: AIInsight[];
  recommendations: string[];
  riskFactors: string[];
  questions: string[];
}

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const FINANCIAL_ANALYST_PROMPT = `You are a senior financial analyst with CFA certification and 20 years of experience in corporate finance, valuation, and strategic planning. You provide insightful, actionable analysis of financial projections.

Your analysis style:
- Be concise but thorough
- Focus on actionable insights
- Highlight risks and opportunities
- Use professional financial terminology
- Provide specific recommendations
- Never make up numbers - only use data provided

Response format:
- Use bullet points for clarity
- Include specific metrics when available
- Prioritize insights by impact
- Be direct and avoid fluff`;

const INSIGHT_GENERATOR_PROMPT = `Analyze the following financial projection and provide structured insights.

Return a JSON object with this exact structure:
{
  "summary": "2-3 sentence executive summary",
  "insights": [
    {
      "id": "unique-id",
      "type": "strength|risk|opportunity|recommendation",
      "title": "Short title",
      "description": "Detailed description",
      "impact": "high|medium|low",
      "category": "growth|profitability|liquidity|leverage|valuation"
    }
  ],
  "recommendations": ["Action item 1", "Action item 2"],
  "riskFactors": ["Risk 1", "Risk 2"],
  "questions": ["Strategic question to consider 1", "Question 2"]
}`;

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

export async function generateFinancialInsights(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics,
  sensitivity?: SensitivityAnalysis
): Promise<AIAnalysisResult> {
  const currency = inputs.currency;

  // Build context for AI
  const context = `
COMPANY: ${inputs.companyName}
PROJECTION PERIOD: ${inputs.yearsForward} years starting ${inputs.startYear}

KEY ASSUMPTIONS:
- Revenue Growth: ${inputs.revenueGrowthAssumption}% annually
- Current Revenue: ${formatCurrency(inputs.currentRevenue, currency)}
- COGS: ${formatCurrency(inputs.currentCOGS, currency)} (${((inputs.currentCOGS / inputs.currentRevenue) * 100).toFixed(1)}% of revenue)
- Opex: ${formatCurrency(inputs.currentOpex, currency)}
- Tax Rate: ${inputs.taxRatePct}%
- Debt: ${formatCurrency(inputs.debtOutstanding, currency)} at ${inputs.interestRatePct}%
- Annual Capex: ${formatCurrency(inputs.annualCapex, currency)}

PROJECTION RESULTS:
- Year 1 Revenue: ${formatCurrency(forecast.summary.revenueYear1, currency)}
- Year ${inputs.yearsForward} Revenue: ${formatCurrency(forecast.summary.revenueYearN, currency)}
- Total Net Income: ${formatCurrency(forecast.summary.totalNetIncome, currency)}
- Total Cash Generation: ${formatCurrency(forecast.summary.totalCashProxy, currency)}

MARGINS:
- Gross Margin: ${forecast.ratios.grossMarginPct.toFixed(1)}%
- EBIT Margin: ${forecast.ratios.ebitMarginPct.toFixed(1)}%
- Net Margin: ${forecast.ratios.netMarginPct.toFixed(1)}%

${valuation ? `
VALUATION:
- Enterprise Value: ${formatCurrency(valuation.dcf.enterpriseValue, currency)}
- Equity Value: ${formatCurrency(valuation.dcf.equityValue, currency)}
- EV/Revenue: ${valuation.dcf.impliedMultiples.evToRevenue.toFixed(1)}x
- EV/EBITDA: ${valuation.dcf.impliedMultiples.evToEbitda.toFixed(1)}x
- WACC: ${valuation.dcf.wacc}%

RETURNS:
- ROE: ${valuation.returnMetrics.roe.toFixed(1)}%
- ROIC: ${valuation.returnMetrics.roic.toFixed(1)}%
- EVA: ${formatCurrency(valuation.eva, currency)}

LEVERAGE:
- Interest Coverage: ${valuation.leverage.interestCoverage.toFixed(1)}x
- Debt/Equity: ${valuation.leverage.debtToEquity.toFixed(2)}x
` : ""}

${sensitivity ? `
SCENARIOS:
- Bull Case EV: ${formatCurrency(sensitivity.scenarios.find(s => s.type === "bull")?.valuation.enterpriseValue ?? 0, currency)}
- Base Case EV: ${formatCurrency(sensitivity.scenarios.find(s => s.type === "base")?.valuation.enterpriseValue ?? 0, currency)}
- Bear Case EV: ${formatCurrency(sensitivity.scenarios.find(s => s.type === "bear")?.valuation.enterpriseValue ?? 0, currency)}
- Probability-Weighted EV: ${formatCurrency(sensitivity.probabilityWeightedEV, currency)}
` : ""}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: FINANCIAL_ANALYST_PROMPT },
        { role: "system", content: INSIGHT_GENERATOR_PROMPT },
        { role: "user", content: context },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    return JSON.parse(content) as AIAnalysisResult;
  } catch (error) {
    // Return fallback insights if AI fails
    return generateFallbackInsights(inputs, forecast, valuation);
  }
}

function generateFallbackInsights(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics
): AIAnalysisResult {
  const insights: AIInsight[] = [];

  // Analyze margins
  if (forecast.ratios.grossMarginPct > 40) {
    insights.push({
      id: "gm-strong",
      type: "strength",
      title: "Strong Gross Margins",
      description: `Gross margin of ${forecast.ratios.grossMarginPct.toFixed(1)}% indicates strong pricing power and/or efficient operations.`,
      impact: "high",
      category: "profitability",
    });
  } else if (forecast.ratios.grossMarginPct < 25) {
    insights.push({
      id: "gm-weak",
      type: "risk",
      title: "Thin Gross Margins",
      description: `Gross margin of ${forecast.ratios.grossMarginPct.toFixed(1)}% leaves limited room for operating expenses and profits.`,
      impact: "high",
      category: "profitability",
    });
  }

  // Analyze leverage
  if (valuation && valuation.leverage.interestCoverage < 2) {
    insights.push({
      id: "ic-risk",
      type: "risk",
      title: "Low Interest Coverage",
      description: `Interest coverage of ${valuation.leverage.interestCoverage.toFixed(1)}x may indicate difficulty servicing debt.`,
      impact: "high",
      category: "leverage",
    });
  }

  // Analyze growth
  if (inputs.revenueGrowthAssumption > 20) {
    insights.push({
      id: "growth-aggressive",
      type: "opportunity",
      title: "Aggressive Growth Assumption",
      description: `${inputs.revenueGrowthAssumption}% annual growth is ambitious. Consider scenario analysis with conservative estimates.`,
      impact: "medium",
      category: "growth",
    });
  }

  // Analyze cash generation
  if (forecast.summary.totalCashProxy < 0) {
    insights.push({
      id: "cash-negative",
      type: "risk",
      title: "Negative Cash Generation",
      description: "Capital expenditure exceeds net income, requiring external financing or cash reserves.",
      impact: "high",
      category: "liquidity",
    });
  }

  // Analyze returns
  if (valuation && valuation.returnMetrics.roic < 10) {
    insights.push({
      id: "roic-low",
      type: "recommendation",
      title: "Improve Capital Efficiency",
      description: `ROIC of ${valuation.returnMetrics.roic.toFixed(1)}% suggests room for improvement in capital allocation.`,
      impact: "medium",
      category: "valuation",
    });
  }

  return {
    summary: `${inputs.companyName} projects ${formatPercent(((forecast.summary.revenueYearN - forecast.summary.revenueYear1) / forecast.summary.revenueYear1) * 100)} revenue growth over ${inputs.yearsForward} years with ${formatPercent(forecast.ratios.netMarginPct)} average net margin.`,
    insights,
    recommendations: [
      "Validate growth assumptions against industry benchmarks",
      "Develop contingency plans for downside scenarios",
      "Monitor working capital requirements as business scales",
    ],
    riskFactors: [
      "Revenue growth assumptions may not materialize",
      "Margin compression from competitive pressures",
      "Interest rate changes affecting financing costs",
    ],
    questions: [
      "What drives the assumed revenue growth rate?",
      "How sensitive is profitability to pricing changes?",
      "What capital investments are required to support growth?",
    ],
  };
}

// ============================================================================
// CHAT FUNCTIONS
// ============================================================================

export async function chatWithFinancialAssistant(
  messages: AIChatMessage[],
  context: {
    inputs: AnalysisSession;
    forecast: ForecastResult;
  }
): Promise<string> {
  const systemMessage = `${FINANCIAL_ANALYST_PROMPT}

CURRENT ANALYSIS CONTEXT:
Company: ${context.inputs.companyName}
Revenue: ${formatCurrency(context.inputs.currentRevenue, context.inputs.currency)}
Growth Rate: ${context.inputs.revenueGrowthAssumption}%
Projection Period: ${context.inputs.yearsForward} years

Use this context to answer questions about the financial analysis.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content ?? "I couldn't generate a response.";
  } catch (error) {
    return "I'm currently unavailable. Please try again later.";
  }
}

// ============================================================================
// NARRATIVE GENERATION
// ============================================================================

export async function generateExecutiveSummary(
  inputs: AnalysisSession,
  forecast: ForecastResult
): Promise<string> {
  const prompt = `Write a 3-paragraph executive summary for this financial projection:

Company: ${inputs.companyName}
Projection: ${inputs.yearsForward} years
Revenue Growth: ${inputs.revenueGrowthAssumption}% annually
Starting Revenue: ${formatCurrency(inputs.currentRevenue, inputs.currency)}
Ending Revenue: ${formatCurrency(forecast.summary.revenueYearN, inputs.currency)}
Total Net Income: ${formatCurrency(forecast.summary.totalNetIncome, inputs.currency)}
Net Margin: ${forecast.ratios.netMarginPct.toFixed(1)}%

Write in a professional, concise style suitable for board presentation.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: FINANCIAL_ANALYST_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content ?? "";
  } catch {
    return `${inputs.companyName} projects revenue growth from ${formatCurrency(inputs.currentRevenue, inputs.currency)} to ${formatCurrency(forecast.summary.revenueYearN, inputs.currency)} over ${inputs.yearsForward} years, representing a ${inputs.revenueGrowthAssumption}% compound annual growth rate. The projection indicates total net income of ${formatCurrency(forecast.summary.totalNetIncome, inputs.currency)} with an average net margin of ${forecast.ratios.netMarginPct.toFixed(1)}%.`;
  }
}

// ============================================================================
// WHAT-IF ANALYSIS
// ============================================================================

export async function analyzeWhatIf(
  question: string,
  inputs: AnalysisSession,
  forecast: ForecastResult
): Promise<string> {
  const prompt = `Answer this "what-if" question about the financial projection:

Question: "${question}"

Current Model:
- Revenue: ${formatCurrency(inputs.currentRevenue, inputs.currency)}
- Growth: ${inputs.revenueGrowthAssumption}%
- COGS: ${formatCurrency(inputs.currentCOGS, inputs.currency)}
- Net Margin: ${forecast.ratios.netMarginPct.toFixed(1)}%

Provide a specific, quantitative answer if possible.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: FINANCIAL_ANALYST_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content ?? "";
  } catch {
    return "I couldn't analyze that scenario. Please try rephrasing your question.";
  }
}
