"use client";

import { useEffect, useState } from "react";
import {
  AppSettings,
  defaultSettings,
  loadSettings,
  saveSettings,
  resetSettings,
  formatSettingsTimestamp,
} from "@/lib/settings";
import { CURRENCIES } from "@/lib/schema";
import { FormField, FormSection } from "./forms/FormField";

const inputStyles =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400";

const selectStyles =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400";

const checkboxStyles =
  "h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:ring-zinc-400";

export function AdminView() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const stored = loadSettings();
    if (stored) {
      setSettings({ ...defaultSettings, ...stored.data });
      setLastUpdated(stored.lastUpdated);
    }
    setIsLoaded(true);
  }, []);

  const handleChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    const timestamp = saveSettings(settings);
    setLastUpdated(timestamp);
    setIsDirty(false);
  };

  const handleReset = () => {
    resetSettings();
    setSettings(defaultSettings);
    setLastUpdated(null);
    setIsDirty(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Default Values */}
      <FormSection title="Default Values">
        <FormField
          label="Default Currency"
          htmlFor="defaultCurrency"
          helper="Used when creating new analysis sessions"
        >
          <select
            id="defaultCurrency"
            className={selectStyles}
            value={settings.defaultCurrency}
            onChange={(e) =>
              handleChange("defaultCurrency", e.target.value as AppSettings["defaultCurrency"])
            }
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol}) - {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Default Tax Rate (%)"
          htmlFor="defaultTaxRate"
          helper="Default corporate tax rate for new sessions"
        >
          <input
            id="defaultTaxRate"
            type="number"
            className={inputStyles}
            min={0}
            max={100}
            step="0.1"
            value={settings.defaultTaxRate}
            onChange={(e) => handleChange("defaultTaxRate", Number(e.target.value))}
          />
        </FormField>

        <FormField
          label="Default Interest Rate (%)"
          htmlFor="defaultInterestRate"
          helper="Default interest rate for new sessions"
        >
          <input
            id="defaultInterestRate"
            type="number"
            className={inputStyles}
            min={0}
            max={100}
            step="0.1"
            value={settings.defaultInterestRate}
            onChange={(e) => handleChange("defaultInterestRate", Number(e.target.value))}
          />
        </FormField>
      </FormSection>

      {/* Feature Flags */}
      <section className="space-y-4">
        <h2 className="border-b border-zinc-200 pb-2 text-lg font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
          Feature Flags
        </h2>
        <div className="space-y-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className={checkboxStyles}
              checked={settings.enableWorkingCapitalInputs}
              onChange={(e) =>
                handleChange("enableWorkingCapitalInputs", e.target.checked)
              }
            />
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Enable Working Capital Inputs
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Show days receivable, payable, and inventory fields
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className={checkboxStyles}
              checked={settings.enableDebtSection}
              onChange={(e) => handleChange("enableDebtSection", e.target.checked)}
            />
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Enable Debt Section
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Show debt outstanding and interest rate fields
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className={checkboxStyles}
              checked={settings.enableAdvancedAssumptions}
              onChange={(e) =>
                handleChange("enableAdvancedAssumptions", e.target.checked)
              }
            />
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Enable Advanced Assumptions
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Show optional percentage-based cost inputs
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Save Settings
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Last updated: {formatSettingsTimestamp(lastUpdated)}
            </span>
          )}
          {isDirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Unsaved changes
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
