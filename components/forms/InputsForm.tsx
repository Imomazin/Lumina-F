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
  ConfidenceLevel,
} from "@/lib/schema";
import { saveInputs, loadInputs, clearInputs, formatTimestamp } from "@/lib/storage";
import { FormField, FormSection } from "./FormField";
import {
  Button,
  Badge,
  useToast,
  ConfidenceIndicator,
  ModelHealth,
  TriangulationPanel,
} from "@/components/ui";

const inputStyles =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors";

const selectStyles =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors";

interface AssumptionMetaItem {
  confidence: ConfidenceLevel;
  narrative?: string;
}

interface AssumptionMeta {
  revenueGrowth: AssumptionMetaItem;
  costStructure: AssumptionMetaItem;
  financing: AssumptionMetaItem;
  capital: AssumptionMetaItem;
}

const defaultMeta: AssumptionMeta = {
  revenueGrowth: { confidence: "reasoned", narrative: "" },
  costStructure: { confidence: "reasoned", narrative: "" },
  financing: { confidence: "grounded", narrative: "" },
  capital: { confidence: "reasoned", narrative: "" },
};

export function InputsForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [assumptionMeta, setAssumptionMeta] = useState<AssumptionMeta>(defaultMeta);
  const [showNarratives, setShowNarratives] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<AnalysisSession>({
    resolver: zodResolver(analysisSessionSchema) as Resolver<AnalysisSession>,
    defaultValues: defaultFormValues,
  });

  const formValues = watch();

  // Load saved inputs on mount
  useEffect(() => {
    const stored = loadInputs();
    if (stored) {
      reset(toFormValues(stored.data));
      setLastSaved(stored.lastSaved);
      if (stored.data.assumptionMeta) {
        setAssumptionMeta({
          revenueGrowth: stored.data.assumptionMeta.revenueGrowth || defaultMeta.revenueGrowth,
          costStructure: stored.data.assumptionMeta.costStructure || defaultMeta.costStructure,
          financing: stored.data.assumptionMeta.financing || defaultMeta.financing,
          capital: stored.data.assumptionMeta.capital || defaultMeta.capital,
        });
      }
    }
    setIsLoaded(true);
  }, [reset]);

  const updateConfidence = (key: keyof AssumptionMeta, confidence: ConfidenceLevel) => {
    setAssumptionMeta((prev) => ({
      ...prev,
      [key]: { ...prev[key], confidence },
    }));
  };

  const updateNarrative = (key: keyof AssumptionMeta, narrative: string) => {
    setAssumptionMeta((prev) => ({
      ...prev,
      [key]: { ...prev[key], narrative },
    }));
  };

  const onSave = (data: AnalysisSession) => {
    const dataWithMeta = {
      ...data,
      assumptionMeta: assumptionMeta,
    };
    const timestamp = saveInputs(dataWithMeta);
    setLastSaved(timestamp);
    reset(dataWithMeta);
    showToast("Inputs saved successfully", "success");
  };

  const onReset = () => {
    clearInputs();
    reset(defaultFormValues);
    setLastSaved(null);
    showToast("Form reset to defaults", "info");
  };

  const onNext = () => {
    router.push("/analysis");
  };

  // Don't render form until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-foreground-muted">Loading...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-8">
      {/* Model Profile Sidebar */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Projection Inputs</h2>
            <label className="flex items-center gap-2 text-sm text-foreground-muted">
              <input
                type="checkbox"
                checked={showNarratives}
                onChange={(e) => setShowNarratives(e.target.checked)}
                className="rounded border-border"
              />
              Show assumption narratives
            </label>
          </div>
          <p className="mt-1 text-sm text-foreground-muted">
            Define the assumptions that drive your financial projection. Tag each section with a confidence level.
          </p>
        </div>
        <div className="lg:col-span-1">
          <ModelHealth inputs={{ ...formValues, assumptionMeta }} />
        </div>
      </div>

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

      {/* Revenue Assumptions */}
      <FormSection
        title="Revenue Assumptions"
        action={
          <ConfidenceIndicator
            level={assumptionMeta.revenueGrowth.confidence}
            onChange={(c) => updateConfidence("revenueGrowth", c)}
          />
        }
      >
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
          helper="Annual growth rate assumption"
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

        {showNarratives && (
          <div className="sm:col-span-2 lg:col-span-3">
            <FormField
              label="Assumption Narrative"
              htmlFor="revenueNarrative"
              helper="Document the basis for this growth assumption"
            >
              <textarea
                id="revenueNarrative"
                rows={2}
                className={inputStyles}
                placeholder="e.g., Based on 3-year historical average..."
                value={assumptionMeta.revenueGrowth.narrative}
                onChange={(e) => updateNarrative("revenueGrowth", e.target.value)}
              />
            </FormField>
          </div>
        )}

        <div className="sm:col-span-2 lg:col-span-3">
          <TriangulationPanel type="strategic" title="Growth Assumption Impact">
            This growth rate drives {formValues.yearsForward || 5}-year revenue projections.
            Consider: What market conditions would validate or invalidate this assumption?
          </TriangulationPanel>
        </div>
      </FormSection>

      {/* Cost Structure Assumptions */}
      <FormSection
        title="Cost Structure Assumptions"
        action={
          <ConfidenceIndicator
            level={assumptionMeta.costStructure.confidence}
            onChange={(c) => updateConfidence("costStructure", c)}
          />
        }
      >
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

      {/* Capital Assumptions */}
      <FormSection
        title="Capital Assumptions"
        action={
          <ConfidenceIndicator
            level={assumptionMeta.capital.confidence}
            onChange={(c) => updateConfidence("capital", c)}
          />
        }
      >
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

        <div className="sm:col-span-2 lg:col-span-3">
          <TriangulationPanel type="risk" title="Capital Sensitivity">
            Capex directly reduces free cash flow. Significant changes may indicate
            strategic pivots or capacity constraints worth reviewing.
          </TriangulationPanel>
        </div>
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

      {/* Financing Assumptions */}
      <FormSection
        title="Financing Assumptions"
        action={
          <ConfidenceIndicator
            level={assumptionMeta.financing.confidence}
            onChange={(c) => updateConfidence("financing", c)}
          />
        }
      >
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
      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Button type="submit">Save</Button>
          <Button type="button" variant="secondary" onClick={onReset}>
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-xs text-foreground-muted">
              Last saved: {formatTimestamp(lastSaved)}
            </span>
          )}
          {isDirty && <Badge variant="warning">Unsaved changes</Badge>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end border-t border-border pt-6">
        <Button type="button" size="lg" onClick={onNext}>
          Next: Analysis
        </Button>
      </div>
    </form>
  );
}
