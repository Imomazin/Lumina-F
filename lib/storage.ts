import { AnalysisSession } from "./schema";

const STORAGE_KEY = "luminaF.inputs.v1";
const TIMESTAMP_KEY = "luminaF.inputs.lastSaved";

export interface StoredInputs {
  data: AnalysisSession;
  lastSaved: string; // ISO timestamp
}

/**
 * Save analysis session inputs to localStorage
 */
export function saveInputs(data: AnalysisSession): string {
  if (typeof window === "undefined") return "";

  const timestamp = new Date().toISOString();
  const stored: StoredInputs = {
    data,
    lastSaved: timestamp,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  localStorage.setItem(TIMESTAMP_KEY, timestamp);

  return timestamp;
}

/**
 * Load analysis session inputs from localStorage
 * Returns null if no data exists or data is invalid
 */
export function loadInputs(): StoredInputs | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredInputs;

    // Basic validation - check required fields exist
    if (!parsed.data?.companyName || !parsed.data?.currency) {
      console.warn("Stored inputs missing required fields, clearing...");
      clearInputs();
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to load inputs:", error);
    return null;
  }
}

/**
 * Clear stored inputs from localStorage
 */
export function clearInputs(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
}

/**
 * Check if inputs exist in localStorage
 */
export function hasStoredInputs(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Get last saved timestamp
 */
export function getLastSavedTimestamp(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TIMESTAMP_KEY);
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(isoString: string): string {
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
