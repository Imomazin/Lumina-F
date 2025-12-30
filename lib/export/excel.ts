/**
 * Excel Import/Export Module
 *
 * Comprehensive Excel file handling for financial models
 * Supports importing data and exporting complete financial reports
 */

import { AnalysisSession } from '../schema';
import { ForecastResult } from '../finance/forecast';
import { ThreeStatementModel } from '../finance/statements';
import { ValuationMetrics } from '../finance/valuation';

// ============================================================================
// TYPES
// ============================================================================

export interface ExcelExportOptions {
  includeInputs: boolean;
  includeForecast: boolean;
  includeStatements: boolean;
  includeValuation: boolean;
  includeCharts: boolean;
  includeSensitivity: boolean;
  format: 'xlsx' | 'csv';
  sheetNames?: {
    inputs?: string;
    forecast?: string;
    incomeStatement?: string;
    balanceSheet?: string;
    cashFlow?: string;
    valuation?: string;
    sensitivity?: string;
  };
}

export interface ExcelImportResult {
  success: boolean;
  data?: Partial<AnalysisSession>;
  errors: ImportError[];
  warnings: ImportWarning[];
  mappedFields: FieldMapping[];
}

export interface ImportError {
  row?: number;
  column?: string;
  field?: string;
  message: string;
}

export interface ImportWarning {
  row?: number;
  column?: string;
  field?: string;
  message: string;
  suggestion?: string;
}

export interface FieldMapping {
  excelColumn: string;
  systemField: string;
  value: any;
  transformed: boolean;
}

export interface ExcelWorkbook {
  sheets: ExcelSheet[];
  metadata: {
    title: string;
    author: string;
    created: string;
    modified: string;
  };
}

export interface ExcelSheet {
  name: string;
  rows: ExcelRow[];
  columns: ExcelColumn[];
  mergedCells?: MergedCell[];
}

export interface ExcelRow {
  index: number;
  cells: ExcelCell[];
  height?: number;
  hidden?: boolean;
}

export interface ExcelColumn {
  index: number;
  width: number;
  hidden?: boolean;
}

export interface ExcelCell {
  row: number;
  column: number;
  value: string | number | boolean | null;
  formula?: string;
  format?: CellFormat;
  style?: CellStyle;
}

export interface CellFormat {
  type: 'text' | 'number' | 'currency' | 'percent' | 'date';
  decimals?: number;
  currencySymbol?: string;
  dateFormat?: string;
}

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
  border?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
}

export interface MergedCell {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

const COLUMN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function columnIndexToLetter(index: number): string {
  let letter = '';
  while (index >= 0) {
    letter = COLUMN_LETTERS[index % 26] + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

function columnLetterToIndex(letter: string): number {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index - 1;
}

// ============================================================================
// FIELD MAPPINGS
// ============================================================================

const IMPORT_FIELD_MAPPINGS: Record<string, string[]> = {
  companyName: ['company name', 'company', 'name', 'entity'],
  industry: ['industry', 'sector', 'business type'],
  currency: ['currency', 'ccy', 'curr'],
  currentRevenue: ['revenue', 'current revenue', 'sales', 'total revenue', 'annual revenue'],
  revenueGrowthAssumption: ['growth', 'revenue growth', 'growth rate', 'yoy growth', 'cagr'],
  currentCOGS: ['cogs', 'cost of goods sold', 'cost of sales', 'direct costs'],
  currentOpex: ['opex', 'operating expenses', 'sg&a', 'operating costs'],
  annualCapex: ['capex', 'capital expenditure', 'capital expenditures', 'cap ex'],
  debtOutstanding: ['debt', 'total debt', 'outstanding debt', 'loans'],
  interestRatePct: ['interest rate', 'interest', 'rate', 'debt rate'],
  taxRatePct: ['tax rate', 'tax', 'effective tax rate', 'corporate tax'],
  daysReceivable: ['dso', 'days receivable', 'receivable days', 'days sales outstanding'],
  daysPayable: ['dpo', 'days payable', 'payable days', 'days payable outstanding'],
  daysInventory: ['dio', 'days inventory', 'inventory days', 'days inventory outstanding'],
  startYear: ['start year', 'base year', 'current year', 'year'],
  yearsForward: ['years', 'forecast years', 'projection years', 'years forward'],
};

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export function generateExcelWorkbook(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  statements?: ThreeStatementModel,
  valuation?: ValuationMetrics,
  options: Partial<ExcelExportOptions> = {}
): ExcelWorkbook {
  const defaultOptions: ExcelExportOptions = {
    includeInputs: true,
    includeForecast: true,
    includeStatements: true,
    includeValuation: true,
    includeCharts: false,
    includeSensitivity: true,
    format: 'xlsx',
    ...options,
  };

  const sheets: ExcelSheet[] = [];
  const sheetNames = defaultOptions.sheetNames || {};

  // Cover Sheet
  sheets.push(createCoverSheet(inputs));

  // Inputs Sheet
  if (defaultOptions.includeInputs) {
    sheets.push(createInputsSheet(inputs, sheetNames.inputs || 'Inputs'));
  }

  // Forecast Sheet
  if (defaultOptions.includeForecast) {
    sheets.push(createForecastSheet(inputs, forecast, sheetNames.forecast || 'Forecast'));
  }

  // Three Statements
  if (defaultOptions.includeStatements && statements) {
    sheets.push(createIncomeStatementSheet(statements, sheetNames.incomeStatement || 'Income Statement'));
    sheets.push(createBalanceSheetSheet(statements, sheetNames.balanceSheet || 'Balance Sheet'));
    sheets.push(createCashFlowSheet(statements, sheetNames.cashFlow || 'Cash Flow'));
  }

  // Valuation Sheet
  if (defaultOptions.includeValuation && valuation) {
    sheets.push(createValuationSheet(valuation, sheetNames.valuation || 'Valuation'));
  }

  // Sensitivity Sheet
  if (defaultOptions.includeSensitivity && valuation) {
    sheets.push(createSensitivitySheet(inputs, valuation, sheetNames.sensitivity || 'Sensitivity'));
  }

  return {
    sheets,
    metadata: {
      title: `${inputs.companyName || 'Financial'} Model`,
      author: 'Lumina F',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
  };
}

function createCoverSheet(inputs: AnalysisSession): ExcelSheet {
  const rows: ExcelRow[] = [];

  // Title
  rows.push(createRow(0, [
    createCell(0, 0, inputs.companyName || 'Financial Model', { bold: true, fontSize: 24 }),
  ]));

  // Subtitle
  rows.push(createRow(1, [
    createCell(1, 0, 'Financial Analysis & Valuation Model', { bold: true, fontSize: 14 }),
  ]));

  // Empty row
  rows.push(createRow(2, []));

  // Summary info
  rows.push(createRow(3, [
    createCell(3, 0, 'Industry:', { bold: true }),
    createCell(3, 1, inputs.industry || 'N/A'),
  ]));

  rows.push(createRow(4, [
    createCell(4, 0, 'Currency:', { bold: true }),
    createCell(4, 1, inputs.currency || 'USD'),
  ]));

  rows.push(createRow(5, [
    createCell(5, 0, 'Base Year:', { bold: true }),
    createCell(5, 1, inputs.startYear),
  ]));

  rows.push(createRow(6, [
    createCell(6, 0, 'Forecast Period:', { bold: true }),
    createCell(6, 1, `${inputs.yearsForward} years`),
  ]));

  rows.push(createRow(7, [
    createCell(7, 0, 'Generated:', { bold: true }),
    createCell(7, 1, new Date().toLocaleDateString()),
  ]));

  // Empty row
  rows.push(createRow(8, []));

  // Contents
  rows.push(createRow(9, [
    createCell(9, 0, 'Contents:', { bold: true, fontSize: 12 }),
  ]));

  const contents = [
    '• Inputs - Model assumptions and parameters',
    '• Forecast - Revenue and profit projections',
    '• Income Statement - P&L projections',
    '• Balance Sheet - Asset and liability projections',
    '• Cash Flow - Cash flow statement projections',
    '• Valuation - DCF and valuation metrics',
    '• Sensitivity - Sensitivity analysis tables',
  ];

  contents.forEach((item, index) => {
    rows.push(createRow(10 + index, [
      createCell(10 + index, 0, item),
    ]));
  });

  return {
    name: 'Cover',
    rows,
    columns: [{ index: 0, width: 30 }, { index: 1, width: 40 }],
  };
}

function createInputsSheet(inputs: AnalysisSession, name: string): ExcelSheet {
  const rows: ExcelRow[] = [];

  // Headers
  rows.push(createRow(0, [
    createCell(0, 0, 'Parameter', { bold: true, backgroundColor: '#1a1a2e' }),
    createCell(0, 1, 'Value', { bold: true, backgroundColor: '#1a1a2e' }),
    createCell(0, 2, 'Unit', { bold: true, backgroundColor: '#1a1a2e' }),
    createCell(0, 3, 'Notes', { bold: true, backgroundColor: '#1a1a2e' }),
  ]));

  const inputRows: [string, any, string, string][] = [
    ['Company Name', inputs.companyName || '', '', ''],
    ['Industry', inputs.industry || '', '', ''],
    ['Currency', inputs.currency || 'USD', '', ''],
    ['', '', '', ''],
    ['FINANCIAL INPUTS', '', '', ''],
    ['Current Revenue', inputs.currentRevenue, inputs.currency || 'USD', 'Annual revenue'],
    ['Revenue Growth Rate', inputs.revenueGrowthAssumption, '%', 'Annual growth assumption'],
    ['', '', '', ''],
    ['COST STRUCTURE', '', '', ''],
    ['Cost of Goods Sold', inputs.currentCOGS, inputs.currency || 'USD', 'Direct costs'],
    ['Operating Expenses', inputs.currentOpex, inputs.currency || 'USD', 'SG&A and other opex'],
    ['Annual CapEx', inputs.annualCapex, inputs.currency || 'USD', 'Capital expenditure'],
    ['', '', '', ''],
    ['WORKING CAPITAL', '', '', ''],
    ['Days Receivable', inputs.daysReceivable ?? 30, 'days', 'DSO'],
    ['Days Payable', inputs.daysPayable ?? 30, 'days', 'DPO'],
    ['Days Inventory', inputs.daysInventory ?? 45, 'days', 'DIO'],
    ['', '', '', ''],
    ['FINANCING', '', '', ''],
    ['Debt Outstanding', inputs.debtOutstanding, inputs.currency || 'USD', 'Total debt'],
    ['Interest Rate', inputs.interestRatePct, '%', 'Blended interest rate'],
    ['Tax Rate', inputs.taxRatePct, '%', 'Effective tax rate'],
    ['', '', '', ''],
    ['FORECAST HORIZON', '', '', ''],
    ['Start Year', inputs.startYear, '', 'Base year'],
    ['Years Forward', inputs.yearsForward, 'years', 'Projection period'],
  ];

  inputRows.forEach((row, index) => {
    const rowIndex = index + 1;
    const isSectionHeader = row[0].toUpperCase() === row[0] && row[0] !== '';
    rows.push(createRow(rowIndex, [
      createCell(rowIndex, 0, row[0], isSectionHeader ? { bold: true } : {}),
      createCell(rowIndex, 1, row[1], { alignment: 'right' }),
      createCell(rowIndex, 2, row[2]),
      createCell(rowIndex, 3, row[3], { italic: true }),
    ]));
  });

  return {
    name,
    rows,
    columns: [
      { index: 0, width: 25 },
      { index: 1, width: 20 },
      { index: 2, width: 10 },
      { index: 3, width: 30 },
    ],
  };
}

function createForecastSheet(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  name: string
): ExcelSheet {
  const rows: ExcelRow[] = [];
  const years = forecast.yearly.map((_, i) => inputs.startYear + i);

  // Header row
  const headerCells = [
    createCell(0, 0, 'Metric', { bold: true, backgroundColor: '#1a1a2e' }),
    ...years.map((year, i) =>
      createCell(0, i + 1, year.toString(), { bold: true, backgroundColor: '#1a1a2e', alignment: 'center' })
    ),
  ];
  rows.push(createRow(0, headerCells));

  // Data rows
  const metrics: [string, (y: typeof forecast.yearly[0]) => number, CellFormat?][] = [
    ['Revenue', y => y.revenue, { type: 'currency' }],
    ['COGS', y => y.cogs, { type: 'currency' }],
    ['Gross Profit', y => y.revenue - y.cogs, { type: 'currency' }],
    ['Gross Margin', y => ((y.revenue - y.cogs) / y.revenue) * 100, { type: 'percent' }],
    ['Operating Expenses', y => y.opex, { type: 'currency' }],
    ['EBIT', y => y.ebit, { type: 'currency' }],
    ['Operating Margin', y => (y.ebit / y.revenue) * 100, { type: 'percent' }],
    ['Interest', y => y.interest, { type: 'currency' }],
    ['EBT', y => y.ebt, { type: 'currency' }],
    ['Taxes', y => y.taxes, { type: 'currency' }],
    ['Net Income', y => y.netIncome, { type: 'currency' }],
    ['Net Margin', y => (y.netIncome / y.revenue) * 100, { type: 'percent' }],
  ];

  metrics.forEach(([label, getValue, format], mIndex) => {
    const rowIndex = mIndex + 1;
    const cells = [
      createCell(rowIndex, 0, label, label.includes('Margin') ? { italic: true } : {}),
      ...forecast.yearly.map((y, i) =>
        createCell(rowIndex, i + 1, formatValue(getValue(y), format), { alignment: 'right' })
      ),
    ];
    rows.push(createRow(rowIndex, cells));
  });

  return {
    name,
    rows,
    columns: [
      { index: 0, width: 20 },
      ...years.map((_, i) => ({ index: i + 1, width: 15 })),
    ],
  };
}

function createIncomeStatementSheet(statements: ThreeStatementModel, name: string): ExcelSheet {
  const rows: ExcelRow[] = [];
  const years = statements.incomeStatements.map(s => s.year);

  // Header
  const headerCells = [
    createCell(0, 0, 'Income Statement', { bold: true, backgroundColor: '#1a1a2e' }),
    ...years.map((year, i) =>
      createCell(0, i + 1, year.toString(), { bold: true, backgroundColor: '#1a1a2e', alignment: 'center' })
    ),
  ];
  rows.push(createRow(0, headerCells));

  const items: [string, keyof typeof statements.incomeStatements[0], boolean?][] = [
    ['Revenue', 'revenue'],
    ['Cost of Goods Sold', 'costOfGoodsSold'],
    ['Gross Profit', 'grossProfit', true],
    ['Gross Margin %', 'grossMargin'],
    ['', 'revenue'], // Spacer
    ['R&D', 'researchAndDevelopment'],
    ['Sales & Marketing', 'salesAndMarketing'],
    ['G&A', 'generalAndAdministrative'],
    ['Total Operating Expenses', 'totalOperatingExpenses'],
    ['', 'revenue'], // Spacer
    ['Operating Income (EBIT)', 'operatingIncome', true],
    ['Operating Margin %', 'operatingMargin'],
    ['', 'revenue'], // Spacer
    ['Interest Expense', 'interestExpense'],
    ['Income Before Tax', 'incomeBeforeTax'],
    ['Tax Expense', 'incomeTaxExpense'],
    ['', 'revenue'], // Spacer
    ['Net Income', 'netIncome', true],
    ['Net Margin %', 'netMargin'],
    ['', 'revenue'], // Spacer
    ['EBITDA', 'ebitda', true],
    ['EBITDA Margin %', 'ebitdaMargin'],
  ];

  items.forEach(([label, key, isBold], index) => {
    const rowIndex = index + 1;
    if (label === '') {
      rows.push(createRow(rowIndex, []));
    } else {
      const cells = [
        createCell(rowIndex, 0, label, isBold ? { bold: true } : {}),
        ...statements.incomeStatements.map((stmt, i) => {
          const value = stmt[key];
          const isPercent = label.includes('%');
          return createCell(rowIndex, i + 1,
            isPercent ? `${value}%` : formatCurrency(value as number),
            { alignment: 'right', bold: isBold }
          );
        }),
      ];
      rows.push(createRow(rowIndex, cells));
    }
  });

  return {
    name,
    rows,
    columns: [
      { index: 0, width: 25 },
      ...years.map((_, i) => ({ index: i + 1, width: 15 })),
    ],
  };
}

function createBalanceSheetSheet(statements: ThreeStatementModel, name: string): ExcelSheet {
  const rows: ExcelRow[] = [];
  const years = statements.balanceSheets.map(s => s.year);

  // Header
  rows.push(createRow(0, [
    createCell(0, 0, 'Balance Sheet', { bold: true, backgroundColor: '#1a1a2e' }),
    ...years.map((year, i) =>
      createCell(0, i + 1, year.toString(), { bold: true, backgroundColor: '#1a1a2e', alignment: 'center' })
    ),
  ]));

  const items: [string, (bs: typeof statements.balanceSheets[0]) => number, boolean?][] = [
    ['ASSETS', () => 0, true],
    ['Cash & Equivalents', bs => bs.assets.current.cashAndEquivalents],
    ['Accounts Receivable', bs => bs.assets.current.accountsReceivable],
    ['Inventory', bs => bs.assets.current.inventory],
    ['Prepaid Expenses', bs => bs.assets.current.prepaidExpenses],
    ['Total Current Assets', bs => bs.assets.current.totalCurrentAssets, true],
    ['', () => 0],
    ['Net PP&E', bs => bs.assets.nonCurrent.netPPE],
    ['Goodwill', bs => bs.assets.nonCurrent.goodwill],
    ['Intangible Assets', bs => bs.assets.nonCurrent.intangibleAssets],
    ['Total Non-Current Assets', bs => bs.assets.nonCurrent.totalNonCurrentAssets, true],
    ['', () => 0],
    ['TOTAL ASSETS', bs => bs.assets.totalAssets, true],
    ['', () => 0],
    ['LIABILITIES', () => 0, true],
    ['Accounts Payable', bs => bs.liabilities.current.accountsPayable],
    ['Accrued Expenses', bs => bs.liabilities.current.accruedExpenses],
    ['Short-Term Debt', bs => bs.liabilities.current.shortTermDebt],
    ['Deferred Revenue', bs => bs.liabilities.current.deferredRevenue],
    ['Total Current Liabilities', bs => bs.liabilities.current.totalCurrentLiabilities, true],
    ['', () => 0],
    ['Long-Term Debt', bs => bs.liabilities.nonCurrent.longTermDebt],
    ['Deferred Tax Liabilities', bs => bs.liabilities.nonCurrent.deferredTaxLiabilities],
    ['Total Non-Current Liabilities', bs => bs.liabilities.nonCurrent.totalNonCurrentLiabilities, true],
    ['', () => 0],
    ['TOTAL LIABILITIES', bs => bs.liabilities.totalLiabilities, true],
    ['', () => 0],
    ['EQUITY', () => 0, true],
    ['Common Stock', bs => bs.equity.commonStock],
    ['Additional Paid-In Capital', bs => bs.equity.additionalPaidInCapital],
    ['Retained Earnings', bs => bs.equity.retainedEarnings],
    ['Total Equity', bs => bs.equity.totalEquity, true],
    ['', () => 0],
    ['TOTAL LIAB + EQUITY', bs => bs.totalLiabilitiesAndEquity, true],
  ];

  items.forEach(([label, getValue, isBold], index) => {
    const rowIndex = index + 1;
    if (label === '') {
      rows.push(createRow(rowIndex, []));
    } else {
      const isHeader = label === 'ASSETS' || label === 'LIABILITIES' || label === 'EQUITY';
      const cells = [
        createCell(rowIndex, 0, label, isBold ? { bold: true } : {}),
        ...statements.balanceSheets.map((bs, i) => {
          const value = getValue(bs);
          return createCell(rowIndex, i + 1,
            isHeader ? '' : formatCurrency(value),
            { alignment: 'right', bold: isBold }
          );
        }),
      ];
      rows.push(createRow(rowIndex, cells));
    }
  });

  return {
    name,
    rows,
    columns: [
      { index: 0, width: 28 },
      ...years.map((_, i) => ({ index: i + 1, width: 15 })),
    ],
  };
}

function createCashFlowSheet(statements: ThreeStatementModel, name: string): ExcelSheet {
  const rows: ExcelRow[] = [];
  const years = statements.cashFlowStatements.map(s => s.year);

  rows.push(createRow(0, [
    createCell(0, 0, 'Cash Flow Statement', { bold: true, backgroundColor: '#1a1a2e' }),
    ...years.map((year, i) =>
      createCell(0, i + 1, year.toString(), { bold: true, backgroundColor: '#1a1a2e', alignment: 'center' })
    ),
  ]));

  const items: [string, (cf: typeof statements.cashFlowStatements[0]) => number, boolean?][] = [
    ['OPERATING ACTIVITIES', () => 0, true],
    ['Net Income', cf => cf.operating.netIncome],
    ['Depreciation & Amortization', cf => cf.operating.depreciationAndAmortization],
    ['Stock-Based Compensation', cf => cf.operating.stockBasedCompensation],
    ['Change in A/R', cf => cf.operating.changeInAccountsReceivable],
    ['Change in Inventory', cf => cf.operating.changeInInventory],
    ['Change in A/P', cf => cf.operating.changeInAccountsPayable],
    ['Net Cash from Operations', cf => cf.operating.netCashFromOperating, true],
    ['', () => 0],
    ['INVESTING ACTIVITIES', () => 0, true],
    ['Capital Expenditures', cf => cf.investing.capitalExpenditures],
    ['Net Cash from Investing', cf => cf.investing.netCashFromInvesting, true],
    ['', () => 0],
    ['FINANCING ACTIVITIES', () => 0, true],
    ['Debt Repayments', cf => cf.financing.debtRepayments],
    ['Net Cash from Financing', cf => cf.financing.netCashFromFinancing, true],
    ['', () => 0],
    ['Net Change in Cash', cf => cf.netChangeInCash, true],
    ['Beginning Cash', cf => cf.beginningCash],
    ['Ending Cash', cf => cf.endingCash, true],
    ['', () => 0],
    ['KEY METRICS', () => 0, true],
    ['Free Cash Flow', cf => cf.freeCashFlow, true],
    ['FCF Margin %', cf => cf.freeCashFlowMargin],
  ];

  items.forEach(([label, getValue, isBold], index) => {
    const rowIndex = index + 1;
    if (label === '') {
      rows.push(createRow(rowIndex, []));
    } else {
      const isHeader = label.startsWith('OPERATING') || label.startsWith('INVESTING') ||
                       label.startsWith('FINANCING') || label.startsWith('KEY');
      const cells = [
        createCell(rowIndex, 0, label, isBold ? { bold: true } : {}),
        ...statements.cashFlowStatements.map((cf, i) => {
          const value = getValue(cf);
          return createCell(rowIndex, i + 1,
            isHeader ? '' : (label.includes('%') ? `${value}%` : formatCurrency(value)),
            { alignment: 'right', bold: isBold }
          );
        }),
      ];
      rows.push(createRow(rowIndex, cells));
    }
  });

  return {
    name,
    rows,
    columns: [
      { index: 0, width: 28 },
      ...years.map((_, i) => ({ index: i + 1, width: 15 })),
    ],
  };
}

function createValuationSheet(valuation: ValuationMetrics, name: string): ExcelSheet {
  const rows: ExcelRow[] = [];

  rows.push(createRow(0, [
    createCell(0, 0, 'Valuation Summary', { bold: true, fontSize: 16 }),
  ]));

  rows.push(createRow(1, []));

  // DCF Section
  rows.push(createRow(2, [
    createCell(2, 0, 'DCF VALUATION', { bold: true, backgroundColor: '#1a1a2e' }),
    createCell(2, 1, '', { backgroundColor: '#1a1a2e' }),
  ]));

  const dcfItems: [string, number | string][] = [
    ['WACC', `${valuation.dcf.wacc}%`],
    ['Enterprise Value', formatCurrency(valuation.dcf.enterpriseValue)],
    ['Equity Value', formatCurrency(valuation.dcf.equityValue)],
    ['Terminal Value', formatCurrency(valuation.dcf.terminalValue)],
    ['Terminal Value (PV)', formatCurrency(valuation.dcf.terminalValuePV)],
    ['', ''],
    ['Implied Multiples', ''],
    ['EV/Revenue', `${valuation.dcf.impliedMultiples.evToRevenue}x`],
    ['EV/EBITDA', `${valuation.dcf.impliedMultiples.evToEbitda}x`],
    ['P/E', `${valuation.dcf.impliedMultiples.priceToEarnings}x`],
  ];

  dcfItems.forEach(([label, value], index) => {
    const rowIndex = index + 3;
    rows.push(createRow(rowIndex, [
      createCell(rowIndex, 0, label, label === 'Implied Multiples' ? { bold: true } : {}),
      createCell(rowIndex, 1, value, { alignment: 'right' }),
    ]));
  });

  // Return Metrics Section
  const returnStart = 3 + dcfItems.length + 1;
  rows.push(createRow(returnStart, [
    createCell(returnStart, 0, 'RETURN METRICS', { bold: true, backgroundColor: '#1a1a2e' }),
    createCell(returnStart, 1, '', { backgroundColor: '#1a1a2e' }),
  ]));

  const returnItems: [string, number][] = [
    ['ROA', valuation.returnMetrics.roa],
    ['ROE', valuation.returnMetrics.roe],
    ['ROIC', valuation.returnMetrics.roic],
    ['ROCE', valuation.returnMetrics.roce],
    ['EVA', valuation.eva],
  ];

  returnItems.forEach(([label, value], index) => {
    const rowIndex = returnStart + index + 1;
    rows.push(createRow(rowIndex, [
      createCell(rowIndex, 0, label),
      createCell(rowIndex, 1, label === 'EVA' ? formatCurrency(value) : `${value}%`, { alignment: 'right' }),
    ]));
  });

  return {
    name,
    rows,
    columns: [
      { index: 0, width: 25 },
      { index: 1, width: 20 },
    ],
  };
}

function createSensitivitySheet(
  inputs: AnalysisSession,
  valuation: ValuationMetrics,
  name: string
): ExcelSheet {
  const rows: ExcelRow[] = [];

  rows.push(createRow(0, [
    createCell(0, 0, 'Sensitivity Analysis', { bold: true, fontSize: 16 }),
  ]));

  rows.push(createRow(1, [
    createCell(1, 0, 'Enterprise Value sensitivity to WACC and Terminal Growth', { italic: true }),
  ]));

  rows.push(createRow(2, []));

  // WACC sensitivity table
  const baseWacc = valuation.dcf.wacc / 100;
  const waccRange = [-0.02, -0.01, 0, 0.01, 0.02];
  const growthRange = [-0.01, -0.005, 0, 0.005, 0.01];
  const baseGrowth = 0.025; // 2.5%

  // Header row
  rows.push(createRow(3, [
    createCell(3, 0, 'EV ($)', { bold: true, backgroundColor: '#1a1a2e' }),
    ...growthRange.map((g, i) =>
      createCell(3, i + 1, `${((baseGrowth + g) * 100).toFixed(1)}%`, { bold: true, backgroundColor: '#1a1a2e', alignment: 'center' })
    ),
  ]));

  // Data rows
  waccRange.forEach((w, wIndex) => {
    const rowIndex = 4 + wIndex;
    const wacc = baseWacc + w;
    const cells = [
      createCell(rowIndex, 0, `${(wacc * 100).toFixed(1)}%`, { bold: true }),
      ...growthRange.map((g, gIndex) => {
        const growth = baseGrowth + g;
        // Simplified sensitivity calculation
        const adjustmentFactor = (1 + (w * -10)) * (1 + (g * 5));
        const ev = Math.round(valuation.dcf.enterpriseValue * adjustmentFactor);
        return createCell(rowIndex, gIndex + 1, formatCurrency(ev), {
          alignment: 'right',
          backgroundColor: w === 0 && g === 0 ? '#2a2a4e' : undefined,
        });
      }),
    ];
    rows.push(createRow(rowIndex, cells));
  });

  rows.push(createRow(9, []));
  rows.push(createRow(10, [
    createCell(10, 0, 'Rows: WACC, Columns: Terminal Growth Rate', { italic: true }),
  ]));

  return {
    name,
    rows,
    columns: [
      { index: 0, width: 15 },
      ...growthRange.map((_, i) => ({ index: i + 1, width: 15 })),
    ],
  };
}

// ============================================================================
// IMPORT FUNCTIONS
// ============================================================================

export function parseExcelImport(
  data: Record<string, any>[],
  options: { headerRow?: number } = {}
): ExcelImportResult {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  const mappedFields: FieldMapping[] = [];

  const result: Partial<AnalysisSession> = {};

  // Map columns to fields
  const columns = Object.keys(data[0] || {});

  columns.forEach(column => {
    const normalizedColumn = column.toLowerCase().trim();

    for (const [field, aliases] of Object.entries(IMPORT_FIELD_MAPPINGS)) {
      if (aliases.some(alias => normalizedColumn.includes(alias))) {
        // Found a match
        const value = data[0][column];

        if (value !== undefined && value !== null && value !== '') {
          const transformedValue = transformImportValue(field, value);

          if (transformedValue.error) {
            errors.push({
              column,
              field,
              message: transformedValue.error,
            });
          } else {
            (result as any)[field] = transformedValue.value;
            mappedFields.push({
              excelColumn: column,
              systemField: field,
              value: transformedValue.value,
              transformed: transformedValue.transformed,
            });
          }
        }
        break;
      }
    }
  });

  // Validate required fields
  if (!result.currentRevenue) {
    errors.push({
      message: 'Revenue is required but not found in import data',
    });
  }

  // Add warnings for missing optional fields
  if (!result.companyName) {
    warnings.push({
      message: 'Company name not found',
      suggestion: 'Add a "Company Name" column',
    });
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
    warnings,
    mappedFields,
  };
}

function transformImportValue(
  field: string,
  value: any
): { value: any; transformed: boolean; error?: string } {
  // Handle numeric fields
  const numericFields = [
    'currentRevenue', 'currentCOGS', 'currentOpex', 'annualCapex',
    'debtOutstanding', 'interestRatePct', 'taxRatePct',
    'daysReceivable', 'daysPayable', 'daysInventory',
    'revenueGrowthAssumption', 'startYear', 'yearsForward',
  ];

  if (numericFields.includes(field)) {
    let numValue: number;

    if (typeof value === 'number') {
      numValue = value;
    } else if (typeof value === 'string') {
      // Remove currency symbols, commas, percentage signs
      const cleaned = value.replace(/[$€£¥,]/g, '').replace(/%/g, '').trim();
      numValue = parseFloat(cleaned);

      if (isNaN(numValue)) {
        return { value: null, transformed: false, error: `Cannot parse "${value}" as number` };
      }

      // Handle multipliers (K, M, B)
      if (value.toUpperCase().includes('K')) numValue *= 1000;
      if (value.toUpperCase().includes('M')) numValue *= 1000000;
      if (value.toUpperCase().includes('B')) numValue *= 1000000000;
    } else {
      return { value: null, transformed: false, error: `Unexpected type for ${field}` };
    }

    return { value: numValue, transformed: typeof value === 'string' };
  }

  // String fields
  return { value: String(value).trim(), transformed: false };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createRow(index: number, cells: ExcelCell[]): ExcelRow {
  return { index, cells };
}

function createCell(
  row: number,
  column: number,
  value: string | number | boolean | null,
  style?: CellStyle
): ExcelCell {
  return { row, column, value, style };
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

function formatValue(value: number, format?: CellFormat): string | number {
  if (!format) return value;

  switch (format.type) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return `${value.toFixed(format.decimals ?? 1)}%`;
    case 'number':
      return value.toFixed(format.decimals ?? 0);
    default:
      return value;
  }
}

// ============================================================================
// CSV EXPORT
// ============================================================================

export function generateCSV(data: ExcelSheet): string {
  return data.rows.map(row => {
    const maxCol = Math.max(...row.cells.map(c => c.column), 0);
    const values: string[] = [];

    for (let i = 0; i <= maxCol; i++) {
      const cell = row.cells.find(c => c.column === i);
      const value = cell?.value ?? '';
      // Escape quotes and wrap in quotes if contains comma
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        values.push(`"${strValue.replace(/"/g, '""')}"`);
      } else {
        values.push(strValue);
      }
    }

    return values.join(',');
  }).join('\n');
}

export function exportToCSV(
  inputs: AnalysisSession,
  forecast: ForecastResult,
  sheetName: string = 'Forecast'
): string {
  const options: Partial<ExcelExportOptions> = {
    includeForecast: true,
    includeInputs: false,
    includeStatements: false,
    includeValuation: false,
    format: 'csv',
  };

  const workbook = generateExcelWorkbook(inputs, forecast, undefined, undefined, options);
  const sheet = workbook.sheets.find(s => s.name === sheetName) || workbook.sheets[0];

  return generateCSV(sheet);
}
