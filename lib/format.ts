import { CurrencyCode, CURRENCIES } from "./schema";

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(code: CurrencyCode): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol ?? "$";
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currencyCode: CurrencyCode = "USD",
  options?: { compact?: boolean; decimals?: number }
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const { compact = false, decimals = 0 } = options ?? {};

  if (compact && Math.abs(value) >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `${symbol}${(value / 1_000).toFixed(1)}K`;
  }

  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format a number as percentage
 */
export function formatPercent(
  value: number,
  options?: { decimals?: number; showSign?: boolean }
): string {
  const { decimals = 1, showSign = false } = options ?? {};
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a large number with abbreviation
 */
export function formatCompact(value: number, decimals = 1): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * Round to specified decimal places
 */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
