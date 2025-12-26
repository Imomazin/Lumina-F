"use client";

import { useEffect, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  AnalysisSession,
  analysisSessionSchema,
  defaultFormValues,
  toFormValues,
  INDUSTRIES,
  CURRENCIES,
} from "@/lib/schema";
import { saveInputs, loadInputs, clearInputs, formatTimestamp } from "@/lib/storage";
import { FormField, FormSection } from "./FormField";

const inputStyles =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400";

const selectStyles =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400";

export function InputsForm() {
  const router = useRouter();
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AnalysisSession>({
    resolver: zodResolver(analysisSessionSchema) as Resolver<AnalysisSession>,
    defaultValues: defaultFormValues,
  });

  // Load saved inputs on mount
  useEffect(() => {
    const stored = loadInputs();
    if (stored) {
      reset(toFormValues(stored.data));
      setLastSaved(stored.lastSaved);
    }
    setIsLoaded(true);
  }, [reset]);

  const onSave = (data: AnalysisSession) => {
    const timestamp = saveInputs(data);
    setLastSaved(timestamp);
    reset(data); // Reset form state to mark as clean
  };

  const onReset = () => {
    clearInputs();
    reset(defaultFormValues);
    setLastSaved(null);
  };

  const onNext = () => {
    router.push("/analysis");
  };

  // Don't render form until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-8">
      {/* Company Section */}
      <FormSection title="Company">
        <FormField
          label="Company Name"
          htmlFor="companyName"
          error={errors.companyName?.message}
          required
        >
          <input
            id="companyName"
            type="text"
            className={inputStyles}
            placeholder="Enter company name"
            {...register("companyName")}
          />
        </FormField>

        <FormField
          label="Industry"
          htmlFor="industry"
          error={errors.industry?.message}
          required
        >
          <select id="industry" className={selectStyles} {...register("industry")}>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Currency"
          htmlFor="currency"
          error={errors.currency?.message}
          required
        >
          <select id="currency" className={selectStyles} {...register("currency")}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol}) - {c.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      {/* Horizon Section */}
      <FormSection title="Horizon">
        <FormField
          label="Start Year"
          htmlFor="startYear"
          error={errors.startYear?.message}
          helper="The first year of your forecast"
          required
        >
          <input
            id="startYear"
            type="number"
            className={inputStyles}
            min={2000}
            max={2100}
            {...register("startYear")}
          />
        </FormField>

        <FormField
          label="Years Forward"
          htmlFor="yearsForward"
          error={errors.yearsForward?.message}
          helper="Number of years to forecast (1-10)"
          required
        >
          <input
            id="yearsForward"
            type="number"
            className={inputStyles}
            min={1}
            max={10}
            {...register("yearsForward")}
          />
        </FormField>
      </FormSection>

      {/* Revenue Section */}
      <FormSection title="Revenue">
        <FormField
          label="Current Revenue"
          htmlFor="currentRevenue"
          error={errors.currentRevenue?.message}
          helper="Annual revenue for base year"
          required
        >
          <input
            id="currentRevenue"
            type="number"
            className={inputStyles}
            min={0}
            step="0.01"
            placeholder="0.00"
            {...register("currentRevenue")}
          />
        </FormField>

        <FormField
          label="Revenue Growth (%)"
          htmlFor="revenueGrowthAssumption"
          error={errors.revenueGrowthAssumption?.message}
          helper="Expected annual growth rate"
          required
        >
          <input
            id="revenueGrowthAssumption"
            type="number"
            className={inputStyles}
            min={0}
            max={100}
            step="0.1"
            placeholder="10.0"
            {...register("revenueGrowthAssumption")}
          />
        </FormField>
      </FormSection>

      {/* Costs Section */}
      <FormSection title="Costs">
        <FormField
          label="Current COGS"
          htmlFor="currentCOGS"
          error={errors.currentCOGS?.message}
          helper="Cost of goods sold for base year"
          required
        >
          <input
            id="currentCOGS"
            type="number"
            className={inputStyles}
            min={0}
            step="0.01"
            placeholder="0.00"
            {...register("currentCOGS")}
          />
        </FormField>

        <FormField
          label="Current Opex"
          htmlFor="currentOpex"
          error={errors.currentOpex?.message}
          helper="Operating expenses for base year"
          required
        >
          <input
            id="currentOpex"
            type="number"
            className={inputStyles}
            min={0}
            step="0.01"
            placeholder="0.00"
            {...register("currentOpex")}
          />
        </FormField>

        <FormField
          label="COGS % (Optional)"
          htmlFor="cogsPctOptional"
          error={errors.cogsPctOptional?.message}
          helper="Override: COGS as % of revenue"
        >
          <input
            id="cogsPctOptional"
            type="number"
            className={inputStyles}
            min={0}
            max={100}
            step="0.1"
            placeholder="Leave blank to use absolute"
            {...register("cogsPctOptional")}
          />
        </FormField>

        <FormField
          label="Opex % (Optional)"
          htmlFor="opexPctOptional"
          error={errors.opexPctOptional?.message}
          helper="Override: Opex as % of revenue"
        >
          <input
            id="opexPctOptional"
            type="number"
            className={inputStyles}
            min={0}
            max={100}
            step="0.1"
            placeholder="Leave blank to use absolute"
            {...register("opexPctOptional")}
          />
        </FormField>
      </FormSection>

      {/* Capital Section */}
      <FormSection title="Capital">
        <FormField
          label="Annual Capex"
          htmlFor="annualCapex"
          error={errors.annualCapex?.message}
          helper="Capital expenditure per year"
          required
        >
          <input
            id="annualCapex"
            type="number"
            className={inputStyles}
            min={0}
            step="0.01"
            placeholder="0.00"
            {...register("annualCapex")}
          />
        </FormField>
      </FormSection>

      {/* Working Capital Section */}
      <FormSection title="Working Capital">
        <FormField
          label="Days Receivable"
          htmlFor="daysReceivable"
          error={errors.daysReceivable?.message}
          helper="Average collection period (optional)"
        >
          <input
            id="daysReceivable"
            type="number"
            className={inputStyles}
            min={0}
            max={365}
            step="1"
            placeholder="30"
            {...register("daysReceivable")}
          />
        </FormField>

        <FormField
          label="Days Payable"
          htmlFor="daysPayable"
          error={errors.daysPayable?.message}
          helper="Average payment period (optional)"
        >
          <input
            id="daysPayable"
            type="number"
            className={inputStyles}
            min={0}
            max={365}
            step="1"
            placeholder="30"
            {...register("daysPayable")}
          />
        </FormField>

        <FormField
          label="Days Inventory"
          htmlFor="daysInventory"
          error={errors.daysInventory?.message}
          helper="Average inventory holding (optional)"
        >
          <input
            id="daysInventory"
            type="number"
            className={inputStyles}
            min={0}
            max={365}
            step="1"
            placeholder="45"
            {...register("daysInventory")}
          />
        </FormField>
      </FormSection>

      {/* Financing Section */}
      <FormSection title="Financing">
        <FormField
          label="Debt Outstanding"
          htmlFor="debtOutstanding"
          error={errors.debtOutstanding?.message}
          helper="Total debt balance"
          required
        >
          <input
            id="debtOutstanding"
            type="number"
            className={inputStyles}
            min={0}
            step="0.01"
            placeholder="0.00"
            {...register("debtOutstanding")}
          />
        </FormField>

        <FormField
          label="Interest Rate (%)"
          htmlFor="interestRatePct"
          error={errors.interestRatePct?.message}
          helper="Annual interest rate on debt"
          required
        >
          <input
            id="interestRatePct"
            type="number"
            className={inputStyles}
            min={0}
            max={100}
            step="0.1"
            placeholder="5.0"
            {...register("interestRatePct")}
          />
        </FormField>

        <FormField
          label="Tax Rate (%)"
          htmlFor="taxRatePct"
          error={errors.taxRatePct?.message}
          helper="Effective corporate tax rate"
          required
        >
          <input
            id="taxRatePct"
            type="number"
            className={inputStyles}
            min={0}
            max={100}
            step="0.1"
            placeholder="25.0"
            {...register("taxRatePct")}
          />
        </FormField>
      </FormSection>

      {/* Notes Section */}
      <FormSection title="Notes">
        <div className="sm:col-span-2 lg:col-span-3">
          <FormField
            label="Additional Notes"
            htmlFor="notes"
            error={errors.notes?.message}
            helper="Any additional context or assumptions"
          >
            <textarea
              id="notes"
              rows={4}
              className={inputStyles}
              placeholder="Enter any notes or assumptions..."
              {...register("notes")}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Actions */}
      <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Last saved: {formatTimestamp(lastSaved)}
            </span>
          )}
          {isDirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Next: Analysis
        </button>
      </div>
    </form>
  );
}
