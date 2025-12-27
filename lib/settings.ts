import { CurrencyCode } from "./schema";

const SETTINGS_KEY = "luminaF.settings.v1";
const TIMESTAMP_KEY = "luminaF.settings.lastUpdated";

export interface AppSettings {
  defaultCurrency: CurrencyCode;
  defaultTaxRate: number;
  defaultInterestRate: number;
  enableWorkingCapitalInputs: boolean;
  enableDebtSection: boolean;
  enableAdvancedAssumptions: boolean;
}

export interface StoredSettings {
  data: AppSettings;
  lastUpdated: string; // ISO timestamp
}

export const defaultSettings: AppSettings = {
  defaultCurrency: "USD",
  defaultTaxRate: 25,
  defaultInterestRate: 5,
  enableWorkingCapitalInputs: true,
  enableDebtSection: true,
  enableAdvancedAssumptions: false,
};

/**
 * Save settings to localStorage
 */
export function saveSettings(data: AppSettings): string {
  if (typeof window === "undefined") return "";

  const timestamp = new Date().toISOString();
  const stored: StoredSettings = {
    data,
    lastUpdated: timestamp,
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(stored));
  localStorage.setItem(TIMESTAMP_KEY, timestamp);

  return timestamp;
}

/**
 * Load settings from localStorage
 */
export function loadSettings(): StoredSettings | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredSettings;
    return parsed;
  } catch (error) {
    console.warn("Failed to load settings:", error);
    return null;
  }
}

/**
 * Get current settings with defaults
 */
export function getSettings(): AppSettings {
  const stored = loadSettings();
  if (stored?.data) {
    return { ...defaultSettings, ...stored.data };
  }
  return defaultSettings;
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
}

/**
 * Get last updated timestamp
 */
export function getSettingsTimestamp(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TIMESTAMP_KEY);
}

/**
 * Format timestamp for display
 */
export function formatSettingsTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "Unknown";
  }
}
