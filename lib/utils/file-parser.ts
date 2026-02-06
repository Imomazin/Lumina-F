import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedFinancialData {
  companyName?: string;
  ticker?: string;
  industry?: string;
  currency?: string;

  // Revenue data
  revenueStreams?: {
    name: string;
    baseAmount: number;
    growthRate?: number;
  }[];

  // Historical financials
  historicalData?: {
    year: number;
    revenue?: number;
    grossProfit?: number;
    ebitda?: number;
    netIncome?: number;
    totalAssets?: number;
    totalLiabilities?: number;
    totalEquity?: number;
    freeCashFlow?: number;
  }[];

  // Cost items
  costItems?: {
    name: string;
    category: string;
    amount: number;
  }[];

  // Balance sheet items
  balanceSheet?: {
    cash?: number;
    accountsReceivable?: number;
    inventory?: number;
    totalAssets?: number;
    accountsPayable?: number;
    shortTermDebt?: number;
    longTermDebt?: number;
    totalEquity?: number;
  };

  // Raw data for preview
  rawData: Record<string, any>[];
  headers: string[];
  fileType: 'excel' | 'csv';
  sheetNames?: string[];
}

export interface ParseResult {
  success: boolean;
  data?: ParsedFinancialData;
  error?: string;
}

// Common financial field mappings
const FIELD_MAPPINGS: Record<string, string[]> = {
  companyName: ['company', 'company name', 'name', 'entity', 'business name'],
  ticker: ['ticker', 'symbol', 'stock symbol', 'ticker symbol'],
  revenue: ['revenue', 'sales', 'total revenue', 'net sales', 'total sales', 'turnover'],
  grossProfit: ['gross profit', 'gross income', 'gross margin'],
  ebitda: ['ebitda', 'operating income before depreciation'],
  netIncome: ['net income', 'net profit', 'profit', 'earnings', 'net earnings', 'bottom line'],
  totalAssets: ['total assets', 'assets'],
  totalLiabilities: ['total liabilities', 'liabilities'],
  totalEquity: ['total equity', 'equity', 'shareholders equity', 'stockholders equity'],
  cash: ['cash', 'cash and equivalents', 'cash & equivalents'],
  freeCashFlow: ['free cash flow', 'fcf', 'cash flow'],
  year: ['year', 'fiscal year', 'fy', 'period'],
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_\-]/g, ' ').replace(/\s+/g, ' ');
}

function findMatchingField(header: string): string | null {
  const normalized = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(FIELD_MAPPINGS)) {
    if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return field;
    }
  }
  return null;
}

function parseNumericValue(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;

  // Handle string values
  if (typeof value === 'string') {
    // Remove currency symbols, commas, parentheses (for negatives)
    let cleaned = value.replace(/[$€£¥,\s]/g, '');

    // Handle parentheses as negative
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      cleaned = '-' + cleaned.slice(1, -1);
    }

    // Handle K, M, B suffixes
    const multipliers: Record<string, number> = { k: 1000, m: 1000000, b: 1000000000 };
    const suffix = cleaned.slice(-1).toLowerCase();
    if (multipliers[suffix]) {
      cleaned = cleaned.slice(0, -1);
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num * multipliers[suffix];
    }

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  if (typeof value === 'number') return value;
  return null;
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const sheetNames = workbook.SheetNames;
    const allData: Record<string, any>[] = [];
    let headers: string[] = [];

    // Parse first sheet (or sheet named 'data', 'financials', etc.)
    const targetSheet = sheetNames.find(name =>
      ['data', 'financials', 'income', 'summary', 'main'].includes(name.toLowerCase())
    ) || sheetNames[0];

    const worksheet = workbook.Sheets[targetSheet];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (jsonData.length < 2) {
      return { success: false, error: 'File appears to be empty or has insufficient data' };
    }

    // First row as headers
    headers = (jsonData[0] || []).map(h => String(h || ''));

    // Rest as data
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.every(cell => cell === null || cell === undefined || cell === '')) continue;

      const rowObj: Record<string, any> = {};
      headers.forEach((header, idx) => {
        rowObj[header] = row[idx];
      });
      allData.push(rowObj);
    }

    const parsedData = extractFinancialData(allData, headers);

    return {
      success: true,
      data: {
        ...parsedData,
        rawData: allData,
        headers,
        fileType: 'excel',
        sheetNames,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          resolve({
            success: false,
            error: `CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`
          });
          return;
        }

        const data = results.data as Record<string, any>[];
        const headers = results.meta.fields || [];

        if (data.length === 0) {
          resolve({ success: false, error: 'CSV file is empty' });
          return;
        }

        const parsedData = extractFinancialData(data, headers);

        resolve({
          success: true,
          data: {
            ...parsedData,
            rawData: data,
            headers,
            fileType: 'csv',
          },
        });
      },
      error: (error) => {
        resolve({ success: false, error: `Failed to parse CSV: ${error.message}` });
      },
    });
  });
}

function extractFinancialData(
  data: Record<string, any>[],
  headers: string[]
): Omit<ParsedFinancialData, 'rawData' | 'headers' | 'fileType' | 'sheetNames'> {
  const result: Omit<ParsedFinancialData, 'rawData' | 'headers' | 'fileType' | 'sheetNames'> = {};

  // Map headers to fields
  const fieldMap: Record<string, string> = {};
  headers.forEach(header => {
    const field = findMatchingField(header);
    if (field) fieldMap[header] = field;
  });

  // Extract historical data if year column exists
  const yearHeader = headers.find(h => fieldMap[h] === 'year');

  if (yearHeader) {
    result.historicalData = data
      .map(row => {
        const year = parseNumericValue(row[yearHeader]);
        if (!year || year < 1900 || year > 2100) return null;

        const entry: NonNullable<ParsedFinancialData['historicalData']>[number] = { year };

        headers.forEach(header => {
          const field = fieldMap[header];
          if (field && field !== 'year') {
            const value = parseNumericValue(row[header]);
            if (value !== null) {
              (entry as any)[field] = value;
            }
          }
        });

        return entry;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => a.year - b.year);
  }

  // Try to extract company info from first row or special rows
  const firstRow = data[0];
  if (firstRow) {
    const companyHeader = headers.find(h => fieldMap[h] === 'companyName');
    if (companyHeader && firstRow[companyHeader]) {
      result.companyName = String(firstRow[companyHeader]);
    }

    const tickerHeader = headers.find(h => fieldMap[h] === 'ticker');
    if (tickerHeader && firstRow[tickerHeader]) {
      result.ticker = String(firstRow[tickerHeader]);
    }
  }

  // Extract revenue streams from revenue-related columns
  const revenueHeaders = headers.filter(h => {
    const normalized = normalizeHeader(h);
    return normalized.includes('revenue') || normalized.includes('sales');
  });

  if (revenueHeaders.length > 0 && data.length > 0) {
    result.revenueStreams = revenueHeaders
      .map(header => {
        // Get most recent value
        const values = data
          .map(row => parseNumericValue(row[header]))
          .filter((v): v is number => v !== null && v > 0);

        if (values.length === 0) return null;

        const baseAmount = values[values.length - 1];
        let growthRate = 0;

        if (values.length > 1) {
          const prevValue = values[values.length - 2];
          growthRate = ((baseAmount - prevValue) / prevValue) * 100;
        }

        return {
          name: header,
          baseAmount,
          growthRate: Math.round(growthRate * 10) / 10,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }

  // Extract balance sheet from most recent row
  if (data.length > 0) {
    const lastRow = data[data.length - 1];
    const balanceSheet: NonNullable<ParsedFinancialData['balanceSheet']> = {};

    const bsFields = ['cash', 'totalAssets', 'totalLiabilities', 'totalEquity'];
    bsFields.forEach(field => {
      const header = headers.find(h => fieldMap[h] === field);
      if (header) {
        const value = parseNumericValue(lastRow[header]);
        if (value !== null) {
          (balanceSheet as any)[field] = value;
        }
      }
    });

    if (Object.keys(balanceSheet).length > 0) {
      result.balanceSheet = balanceSheet;
    }
  }

  return result;
}

export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'xlsx':
    case 'xls':
      return parseExcelFile(file);
    case 'csv':
      return parseCsvFile(file);
    default:
      return {
        success: false,
        error: `Unsupported file type: .${extension}. Please upload Excel (.xlsx, .xls) or CSV files.`
      };
  }
}

export function getSupportedFormats(): string[] {
  return ['.xlsx', '.xls', '.csv'];
}
