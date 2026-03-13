"use client";

import { FinancialModel } from "@/lib/models/financial-model";
import { AnalysisResult } from "@/lib/analysis/financial-engine";

// Local format helpers
function formatCurrency(value: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$",
  };
  const symbol = symbols[currency] || "$";
  const absValue = Math.abs(value);
  if (absValue >= 1e9) return `${symbol}${(value / 1e9).toFixed(1)}B`;
  if (absValue >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
  if (absValue >= 1e3) return `${symbol}${(value / 1e3).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

interface ExcelCell {
  value: string | number;
  type: "string" | "number" | "formula" | "header";
  style?: "bold" | "currency" | "percent" | "date";
}

interface ExcelSheet {
  name: string;
  data: ExcelCell[][];
}

interface ExcelWorkbook {
  sheets: ExcelSheet[];
}

// Generate CSV content for a sheet (simplified Excel-compatible format)
function generateSheetCSV(sheet: ExcelSheet): string {
  return sheet.data
    .map((row) =>
      row
        .map((cell) => {
          const val = cell.value;
          if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    )
    .join("\n");
}

// Generate full workbook content
function generateWorkbookContent(workbook: ExcelWorkbook): string {
  // For multi-sheet, we'll create a combined CSV with sheet separators
  return workbook.sheets
    .map((sheet) => {
      return `=== ${sheet.name} ===\n${generateSheetCSV(sheet)}`;
    })
    .join("\n\n");
}

// Export model summary
export function exportModelSummary(
  model: FinancialModel,
  analysis: AnalysisResult,
  currency: string
): void {
  const yearlyData = analysis.baseCase.yearlyFinancials;
  const years = yearlyData.length;
  const yearHeaders = yearlyData.map(y => `Year ${y.year}`);
  const dcf = analysis.baseCase.dcfValuation;
  const cagr = analysis.baseCase.cagr;

  const workbook: ExcelWorkbook = {
    sheets: [
      // Company Profile Sheet
      {
        name: "Company Profile",
        data: [
          [{ value: "Company Profile", type: "header" }],
          [{ value: "", type: "string" }],
          [{ value: "Field", type: "header" }, { value: "Value", type: "header" }],
          [{ value: "Company Name", type: "string" }, { value: model.profile.companyName, type: "string" }],
          [{ value: "Industry", type: "string" }, { value: model.profile.industry, type: "string" }],
          [{ value: "Company Stage", type: "string" }, { value: model.profile.companyStage, type: "string" }],
          [{ value: "Revenue Model", type: "string" }, { value: model.profile.revenueModel, type: "string" }],
          [{ value: "Currency", type: "string" }, { value: model.profile.currency, type: "string" }],
          [{ value: "Forecast Years", type: "string" }, { value: model.profile.forecastYears.toString(), type: "string" }],
        ],
      },

      // Income Statement Sheet
      {
        name: "Income Statement",
        data: [
          [{ value: "Income Statement Projections", type: "header" }],
          [{ value: "", type: "string" }],
          [
            { value: "Metric", type: "header" },
            ...yearHeaders.map((y) => ({ value: y, type: "header" as const })),
          ],
          [
            { value: "Revenue", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatCurrency(y.revenue, currency),
              type: "number" as const,
            })),
          ],
          [
            { value: "YoY Growth", type: "string" },
            ...yearlyData.map((y, i) => ({
              value: i === 0 ? "N/A" : formatPercent((y.revenue - yearlyData[i - 1].revenue) / yearlyData[i - 1].revenue),
              type: "string" as const,
            })),
          ],
          [
            { value: "Gross Profit", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatCurrency(y.grossProfit, currency),
              type: "number" as const,
            })),
          ],
          [
            { value: "Gross Margin", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatPercent(y.grossMargin),
              type: "string" as const,
            })),
          ],
          [
            { value: "EBITDA", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatCurrency(y.ebitda, currency),
              type: "number" as const,
            })),
          ],
          [
            { value: "EBITDA Margin", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatPercent(y.ebitdaMargin),
              type: "string" as const,
            })),
          ],
          [
            { value: "EBIT", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatCurrency(y.ebit, currency),
              type: "number" as const,
            })),
          ],
          [
            { value: "Net Income", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatCurrency(y.netIncome, currency),
              type: "number" as const,
            })),
          ],
          [
            { value: "Net Margin", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatPercent(y.netMargin),
              type: "string" as const,
            })),
          ],
        ],
      },

      // Cash Flow Sheet
      {
        name: "Cash Flows",
        data: [
          [{ value: "Cash Flow Projections", type: "header" }],
          [{ value: "", type: "string" }],
          [
            { value: "Metric", type: "header" },
            ...yearHeaders.map((y) => ({ value: y, type: "header" as const })),
          ],
          [
            { value: "Operating Cash Flow", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatCurrency(y.operatingCashFlow, currency),
              type: "number" as const,
            })),
          ],
          [
            { value: "Free Cash Flow", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatCurrency(y.freeCashFlow, currency),
              type: "number" as const,
            })),
          ],
          [
            { value: "FCF Margin", type: "string" },
            ...yearlyData.map((y) => ({
              value: formatPercent(y.freeCashFlow / y.revenue),
              type: "string" as const,
            })),
          ],
        ],
      },

      // Valuation Sheet
      {
        name: "Valuation Summary",
        data: [
          [{ value: "DCF Valuation Summary", type: "header" }],
          [{ value: "", type: "string" }],
          [{ value: "Metric", type: "header" }, { value: "Value", type: "header" }],
          [{ value: "Enterprise Value", type: "string" }, { value: formatCurrency(dcf.enterpriseValue, currency), type: "string" }],
          [{ value: "Equity Value", type: "string" }, { value: formatCurrency(dcf.equityValue, currency), type: "string" }],
          [{ value: "Sum of PV FCF", type: "string" }, { value: formatCurrency(dcf.sumPVFCF, currency), type: "string" }],
          [{ value: "Terminal Value", type: "string" }, { value: formatCurrency(dcf.terminalValue, currency), type: "string" }],
          [{ value: "PV of Terminal Value", type: "string" }, { value: formatCurrency(dcf.terminalValuePV, currency), type: "string" }],
          [{ value: "WACC", type: "string" }, { value: `${dcf.wacc.toFixed(1)}%`, type: "string" }],
          [{ value: "", type: "string" }],
          [{ value: "Key Multiples", type: "header" }],
          [{ value: "EV/Revenue (Year 1)", type: "string" }, { value: `${(dcf.enterpriseValue / yearlyData[0].revenue).toFixed(1)}x`, type: "string" }],
          [{ value: "EV/EBITDA (Year 1)", type: "string" }, { value: yearlyData[0].ebitda > 0 ? `${(dcf.enterpriseValue / yearlyData[0].ebitda).toFixed(1)}x` : "N/A", type: "string" }],
          [{ value: "", type: "string" }],
          [{ value: "Growth Metrics (CAGR)", type: "header" }],
          [{ value: "Revenue CAGR", type: "string" }, { value: formatPercent(cagr.revenue), type: "string" }],
          [{ value: "EBITDA CAGR", type: "string" }, { value: formatPercent(cagr.ebitda), type: "string" }],
          [{ value: "Net Income CAGR", type: "string" }, { value: formatPercent(cagr.netIncome), type: "string" }],
          [{ value: "FCF CAGR", type: "string" }, { value: formatPercent(cagr.fcf), type: "string" }],
        ],
      },

      // Scenarios Sheet
      {
        name: "Scenario Analysis",
        data: [
          [{ value: "Scenario Analysis", type: "header" }],
          [{ value: "", type: "string" }],
          [
            { value: "Scenario", type: "header" },
            { value: "Enterprise Value", type: "header" },
            { value: "Probability", type: "header" },
            { value: "IRR", type: "header" },
          ],
          ...analysis.scenarios.map((scenario) => [
            { value: scenario.scenarioName, type: "string" as const },
            { value: formatCurrency(scenario.dcfValuation.enterpriseValue, currency), type: "string" as const },
            { value: `${scenario.probability}%`, type: "string" as const },
            { value: `${(scenario.irr * 100).toFixed(1)}%`, type: "string" as const },
          ]),
        ],
      },
    ],
  };

  // Generate content and download
  const content = generateWorkbookContent(workbook);
  downloadFile(
    content,
    `${model.profile.companyName.replace(/\s+/g, "_")}_Financial_Model.csv`,
    "text/csv"
  );
}

// Export detailed projections
export function exportDetailedProjections(
  model: FinancialModel,
  analysis: AnalysisResult,
  currency: string
): void {
  const yearlyData = analysis.baseCase.yearlyFinancials;
  const yearHeaders = yearlyData.map(y => `Year ${y.year}`);
  const dcf = analysis.baseCase.dcfValuation;

  const rows: string[][] = [
    ["Financial Projections - " + model.profile.companyName],
    ["Generated: " + new Date().toLocaleDateString()],
    [],
    ["INCOME STATEMENT", ...yearHeaders],
    ["Revenue", ...yearlyData.map((y) => y.revenue.toFixed(0))],
    ["Cost of Goods Sold", ...yearlyData.map((y) => y.costOfGoodsSold.toFixed(0))],
    ["Gross Profit", ...yearlyData.map((y) => y.grossProfit.toFixed(0))],
    ["Operating Expenses", ...yearlyData.map((y) => y.operatingExpenses.toFixed(0))],
    ["EBITDA", ...yearlyData.map((y) => y.ebitda.toFixed(0))],
    ["Depreciation", ...yearlyData.map((y) => y.depreciation.toFixed(0))],
    ["Amortization", ...yearlyData.map((y) => y.amortization.toFixed(0))],
    ["EBIT", ...yearlyData.map((y) => y.ebit.toFixed(0))],
    ["Interest Expense", ...yearlyData.map((y) => y.interestExpense.toFixed(0))],
    ["EBT", ...yearlyData.map((y) => y.ebt.toFixed(0))],
    ["Taxes", ...yearlyData.map((y) => y.taxes.toFixed(0))],
    ["Net Income", ...yearlyData.map((y) => y.netIncome.toFixed(0))],
    [],
    ["MARGINS", ...yearHeaders],
    ["Gross Margin", ...yearlyData.map((y) => formatPercent(y.grossMargin))],
    ["EBITDA Margin", ...yearlyData.map((y) => formatPercent(y.ebitdaMargin))],
    ["EBIT Margin", ...yearlyData.map((y) => formatPercent(y.ebitMargin))],
    ["Net Margin", ...yearlyData.map((y) => formatPercent(y.netMargin))],
    [],
    ["CASH FLOW", ...yearHeaders],
    ["Operating Cash Flow", ...yearlyData.map((y) => y.operatingCashFlow.toFixed(0))],
    ["CapEx", ...yearlyData.map((y) => y.capitalExpenditures.toFixed(0))],
    ["Free Cash Flow", ...yearlyData.map((y) => y.freeCashFlow.toFixed(0))],
    [],
    ["DCF VALUATION"],
    ["Enterprise Value", dcf.enterpriseValue.toFixed(0)],
    ["Equity Value", dcf.equityValue.toFixed(0)],
    ["WACC", `${dcf.wacc.toFixed(2)}%`],
  ];

  const csvContent = rows.map((row) => row.join(",")).join("\n");
  downloadFile(
    csvContent,
    `${model.profile.companyName.replace(/\s+/g, "_")}_Detailed_Projections.csv`,
    "text/csv"
  );
}

// Export for investor presentation
export function exportInvestorDeck(
  model: FinancialModel,
  analysis: AnalysisResult,
  currency: string
): void {
  const yearlyData = analysis.baseCase.yearlyFinancials;
  const dcf = analysis.baseCase.dcfValuation;
  const cagr = analysis.baseCase.cagr;
  const lastYear = yearlyData[yearlyData.length - 1];
  const firstYear = yearlyData[0];

  const slides: string[][] = [
    ["INVESTOR PRESENTATION - " + model.profile.companyName.toUpperCase()],
    [""],
    ["EXECUTIVE SUMMARY"],
    [""],
    [`Company: ${model.profile.companyName}`],
    [`Industry: ${model.profile.industry}`],
    [`Stage: ${model.profile.companyStage}`],
    [`Revenue Model: ${model.profile.revenueModel}`],
    [""],
    ["KEY FINANCIAL HIGHLIGHTS"],
    [""],
    [`Year 1 Revenue: ${formatCurrency(firstYear.revenue, currency)}`],
    [`Year ${yearlyData.length} Revenue: ${formatCurrency(lastYear.revenue, currency)}`],
    [`Revenue CAGR: ${formatPercent(cagr.revenue)}`],
    [`Year ${yearlyData.length} EBITDA Margin: ${formatPercent(lastYear.ebitdaMargin)}`],
    [""],
    ["VALUATION"],
    [""],
    [`Enterprise Value: ${formatCurrency(dcf.enterpriseValue, currency)}`],
    [`Equity Value: ${formatCurrency(dcf.equityValue, currency)}`],
    [`EV/Revenue: ${(dcf.enterpriseValue / firstYear.revenue).toFixed(1)}x`],
    [`WACC: ${dcf.wacc.toFixed(1)}%`],
    [""],
    ["INVESTMENT THESIS"],
    [""],
    [`• Strong ${formatPercent(cagr.revenue)} revenue CAGR through projection period`],
    [`• Path to ${formatPercent(lastYear.ebitdaMargin)} EBITDA margin`],
    [`• ${model.profile.companyStage} stage company with clear growth trajectory`],
    [""],
    ["---"],
    [`Generated by Lumina Finance on ${new Date().toLocaleDateString()}`],
    ["CONFIDENTIAL - For Discussion Purposes Only"],
  ];

  const content = slides.map((row) => row.join("")).join("\n");
  downloadFile(
    content,
    `${model.profile.companyName.replace(/\s+/g, "_")}_Investor_Summary.txt`,
    "text/plain"
  );
}

// Helper to download file
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export all formats
export function exportAll(
  model: FinancialModel,
  analysis: AnalysisResult,
  currency: string
): void {
  exportModelSummary(model, analysis, currency);
  setTimeout(() => exportDetailedProjections(model, analysis, currency), 500);
  setTimeout(() => exportInvestorDeck(model, analysis, currency), 1000);
}
