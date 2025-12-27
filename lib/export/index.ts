/**
 * Export Utilities
 *
 * Generate PDF, Excel, PowerPoint, and CSV exports
 */

import { AnalysisSession } from "@/lib/schema";
import { ForecastResult, ValuationMetrics } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = "pdf" | "excel" | "powerpoint" | "csv";

export interface ExportOptions {
  format: ExportFormat;
  includeCharts?: boolean;
  includeAssumptions?: boolean;
  includeValuation?: boolean;
  includeSensitivity?: boolean;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// ============================================================================
// CSV EXPORT
// ============================================================================

export function generateCSV(
  inputs: AnalysisSession,
  forecast: ForecastResult
): string {
  const rows: string[][] = [];

  // Header
  rows.push([`${inputs.companyName} - Financial Projection`]);
  rows.push([`Generated: ${new Date().toISOString()}`]);
  rows.push([]);

  // Assumptions
  rows.push(["Key Assumptions"]);
  rows.push(["Revenue Growth", `${inputs.revenueGrowthAssumption}%`]);
  rows.push(["Tax Rate", `${inputs.taxRatePct}%`]);
  rows.push(["Interest Rate", `${inputs.interestRatePct}%`]);
  rows.push([]);

  // Yearly projections
  rows.push([
    "Year",
    "Revenue",
    "COGS",
    "Gross Profit",
    "Opex",
    "EBIT",
    "Interest",
    "EBT",
    "Tax",
    "Net Income",
    "Free Cash Flow",
  ]);

  forecast.yearly.forEach((year) => {
    rows.push([
      year.year.toString(),
      year.revenue.toFixed(2),
      year.cogs.toFixed(2),
      year.grossProfit.toFixed(2),
      year.opex.toFixed(2),
      year.ebit.toFixed(2),
      year.interest.toFixed(2),
      year.ebt.toFixed(2),
      year.tax.toFixed(2),
      year.netIncome.toFixed(2),
      year.cashProxy.toFixed(2),
    ]);
  });

  rows.push([]);

  // Summary
  rows.push(["Summary"]);
  rows.push(["Total Revenue (Year 1)", forecast.summary.revenueYear1.toFixed(2)]);
  rows.push([
    `Total Revenue (Year ${inputs.yearsForward})`,
    forecast.summary.revenueYearN.toFixed(2),
  ]);
  rows.push(["Total Net Income", forecast.summary.totalNetIncome.toFixed(2)]);
  rows.push(["Total Cash Generation", forecast.summary.totalCashProxy.toFixed(2)]);
  rows.push([]);

  // Ratios
  rows.push(["Key Ratios (Average)"]);
  rows.push(["Gross Margin", `${forecast.ratios.grossMarginPct.toFixed(2)}%`]);
  rows.push(["EBIT Margin", `${forecast.ratios.ebitMarginPct.toFixed(2)}%`]);
  rows.push(["Net Margin", `${forecast.ratios.netMarginPct.toFixed(2)}%`]);

  // Convert to CSV string
  return rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ============================================================================
// EXCEL EXPORT (XML format for compatibility)
// ============================================================================

export function generateExcelXML(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics
): string {
  const currency = inputs.currency;

  const worksheets = `
    <Worksheet ss:Name="Projection">
      <Table>
        <Column ss:Width="120"/>
        <Column ss:Width="100"/>
        <Column ss:Width="100"/>
        <Column ss:Width="100"/>
        <Column ss:Width="100"/>
        <Column ss:Width="100"/>
        <Column ss:Width="100"/>

        <Row>
          <Cell><Data ss:Type="String">${inputs.companyName} - Financial Projection</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Generated: ${new Date().toLocaleDateString()}</Data></Cell>
        </Row>
        <Row></Row>

        <Row ss:StyleID="Header">
          <Cell><Data ss:Type="String">Year</Data></Cell>
          <Cell><Data ss:Type="String">Revenue</Data></Cell>
          <Cell><Data ss:Type="String">Gross Profit</Data></Cell>
          <Cell><Data ss:Type="String">EBIT</Data></Cell>
          <Cell><Data ss:Type="String">Net Income</Data></Cell>
          <Cell><Data ss:Type="String">FCF</Data></Cell>
        </Row>

        ${forecast.yearly
          .map(
            (year) => `
          <Row>
            <Cell><Data ss:Type="Number">${year.year}</Data></Cell>
            <Cell><Data ss:Type="Number">${year.revenue}</Data></Cell>
            <Cell><Data ss:Type="Number">${year.grossProfit}</Data></Cell>
            <Cell><Data ss:Type="Number">${year.ebit}</Data></Cell>
            <Cell><Data ss:Type="Number">${year.netIncome}</Data></Cell>
            <Cell><Data ss:Type="Number">${year.cashProxy}</Data></Cell>
          </Row>
        `
          )
          .join("")}

        <Row></Row>
        <Row>
          <Cell><Data ss:Type="String">Total Net Income</Data></Cell>
          <Cell><Data ss:Type="Number">${forecast.summary.totalNetIncome}</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Total Cash Generation</Data></Cell>
          <Cell><Data ss:Type="Number">${forecast.summary.totalCashProxy}</Data></Cell>
        </Row>
      </Table>
    </Worksheet>

    <Worksheet ss:Name="Assumptions">
      <Table>
        <Column ss:Width="180"/>
        <Column ss:Width="120"/>

        <Row ss:StyleID="Header">
          <Cell><Data ss:Type="String">Assumption</Data></Cell>
          <Cell><Data ss:Type="String">Value</Data></Cell>
        </Row>

        <Row>
          <Cell><Data ss:Type="String">Company Name</Data></Cell>
          <Cell><Data ss:Type="String">${inputs.companyName}</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Currency</Data></Cell>
          <Cell><Data ss:Type="String">${currency}</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Projection Period</Data></Cell>
          <Cell><Data ss:Type="String">${inputs.yearsForward} years</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Revenue Growth Rate</Data></Cell>
          <Cell><Data ss:Type="String">${inputs.revenueGrowthAssumption}%</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Starting Revenue</Data></Cell>
          <Cell><Data ss:Type="Number">${inputs.currentRevenue}</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">COGS</Data></Cell>
          <Cell><Data ss:Type="Number">${inputs.currentCOGS}</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Operating Expenses</Data></Cell>
          <Cell><Data ss:Type="Number">${inputs.currentOpex}</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Debt Outstanding</Data></Cell>
          <Cell><Data ss:Type="Number">${inputs.debtOutstanding}</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Interest Rate</Data></Cell>
          <Cell><Data ss:Type="String">${inputs.interestRatePct}%</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Tax Rate</Data></Cell>
          <Cell><Data ss:Type="String">${inputs.taxRatePct}%</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Annual CapEx</Data></Cell>
          <Cell><Data ss:Type="Number">${inputs.annualCapex}</Data></Cell>
        </Row>
      </Table>
    </Worksheet>

    ${
      valuation
        ? `
    <Worksheet ss:Name="Valuation">
      <Table>
        <Column ss:Width="180"/>
        <Column ss:Width="120"/>

        <Row ss:StyleID="Header">
          <Cell><Data ss:Type="String">Metric</Data></Cell>
          <Cell><Data ss:Type="String">Value</Data></Cell>
        </Row>

        <Row>
          <Cell><Data ss:Type="String">Enterprise Value</Data></Cell>
          <Cell><Data ss:Type="Number">${valuation.dcf.enterpriseValue}</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Equity Value</Data></Cell>
          <Cell><Data ss:Type="Number">${valuation.dcf.equityValue}</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">WACC</Data></Cell>
          <Cell><Data ss:Type="String">${valuation.dcf.wacc}%</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">Terminal Value</Data></Cell>
          <Cell><Data ss:Type="Number">${valuation.dcf.terminalValue}</Data></Cell>
        </Row>
        <Row></Row>
        <Row>
          <Cell><Data ss:Type="String">EV/Revenue</Data></Cell>
          <Cell><Data ss:Type="String">${valuation.dcf.impliedMultiples.evToRevenue.toFixed(1)}x</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">EV/EBITDA</Data></Cell>
          <Cell><Data ss:Type="String">${valuation.dcf.impliedMultiples.evToEbitda.toFixed(1)}x</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">P/E Ratio</Data></Cell>
          <Cell><Data ss:Type="String">${valuation.dcf.impliedMultiples.priceToEarnings.toFixed(1)}x</Data></Cell>
        </Row>
        <Row></Row>
        <Row>
          <Cell><Data ss:Type="String">ROE</Data></Cell>
          <Cell><Data ss:Type="String">${valuation.returnMetrics.roe.toFixed(1)}%</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">ROIC</Data></Cell>
          <Cell><Data ss:Type="String">${valuation.returnMetrics.roic.toFixed(1)}%</Data></Cell>
        </Row>
        <Row>
          <Cell><Data ss:Type="String">EVA</Data></Cell>
          <Cell><Data ss:Type="Number">${valuation.eva}</Data></Cell>
        </Row>
      </Table>
    </Worksheet>
    `
        : ""
    }
  `;

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default"/>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#EEEEEE" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  ${worksheets}
</Workbook>`;
}

// ============================================================================
// DOWNLOAD HELPERS
// ============================================================================

export function downloadCSV(
  inputs: AnalysisSession,
  forecast: ForecastResult
): void {
  const csv = generateCSV(inputs, forecast);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${inputs.companyName.replace(/\s+/g, "_")}_projection.csv`);
}

export function downloadExcel(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics
): void {
  const xml = generateExcelXML(inputs, forecast, valuation);
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  downloadBlob(blob, `${inputs.companyName.replace(/\s+/g, "_")}_projection.xls`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// API EXPORT (for programmatic access)
// ============================================================================

export function generateAPIResponse(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  valuation?: ValuationMetrics
): Record<string, unknown> {
  return {
    meta: {
      companyName: inputs.companyName,
      currency: inputs.currency,
      projectionPeriod: inputs.yearsForward,
      generatedAt: new Date().toISOString(),
    },
    assumptions: {
      revenueGrowth: inputs.revenueGrowthAssumption,
      currentRevenue: inputs.currentRevenue,
      currentCOGS: inputs.currentCOGS,
      currentOpex: inputs.currentOpex,
      debtOutstanding: inputs.debtOutstanding,
      interestRate: inputs.interestRatePct,
      taxRate: inputs.taxRatePct,
      annualCapex: inputs.annualCapex,
    },
    projections: forecast.yearly.map((year) => ({
      year: year.year,
      revenue: year.revenue,
      cogs: year.cogs,
      grossProfit: year.grossProfit,
      opex: year.opex,
      ebit: year.ebit,
      interest: year.interest,
      ebt: year.ebt,
      tax: year.tax,
      netIncome: year.netIncome,
      freeCashFlow: year.cashProxy,
    })),
    summary: {
      revenueYear1: forecast.summary.revenueYear1,
      revenueYearN: forecast.summary.revenueYearN,
      totalNetIncome: forecast.summary.totalNetIncome,
      totalFreeCashFlow: forecast.summary.totalCashProxy,
    },
    ratios: {
      grossMargin: forecast.ratios.grossMarginPct,
      ebitMargin: forecast.ratios.ebitMarginPct,
      netMargin: forecast.ratios.netMarginPct,
    },
    ...(valuation && {
      valuation: {
        dcf: {
          enterpriseValue: valuation.dcf.enterpriseValue,
          equityValue: valuation.dcf.equityValue,
          wacc: valuation.dcf.wacc,
          terminalValue: valuation.dcf.terminalValue,
          impliedMultiples: valuation.dcf.impliedMultiples,
        },
        returns: valuation.returnMetrics,
        leverage: valuation.leverage,
        eva: valuation.eva,
      },
    }),
  };
}
