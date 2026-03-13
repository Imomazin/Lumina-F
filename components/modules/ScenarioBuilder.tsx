"use client";

import { useState, useMemo, useCallback } from "react";
import { AnalysisResult, runFinancialAnalysis } from "@/lib/analysis/financial-engine";
import { FinancialModel } from "@/lib/models/financial-model";
import { GlassPanel, PremiumButton, Badge, ProgressRing } from "@/components/ui/design-system";

interface ScenarioBuilderProps {
  model: FinancialModel;
  baseAnalysis: AnalysisResult;
  currency: string;
  onScenarioChange?: (scenario: ScenarioConfig) => void;
}

interface ScenarioConfig {
  name: string;
  revenueGrowthMultiplier: number;
  marginAdjustment: number;
  capexMultiplier: number;
  waccAdjustment: number;
  terminalGrowthAdjustment: number;
}

const defaultScenario: ScenarioConfig = {
  name: "Custom",
  revenueGrowthMultiplier: 1.0,
  marginAdjustment: 0,
  capexMultiplier: 1.0,
  waccAdjustment: 0,
  terminalGrowthAdjustment: 0,
};

const presetScenarios: { name: string; config: Partial<ScenarioConfig> }[] = [
  { name: "Base Case", config: {} },
  { name: "Bull Case", config: { revenueGrowthMultiplier: 1.25, marginAdjustment: 2, terminalGrowthAdjustment: 0.5 } },
  { name: "Bear Case", config: { revenueGrowthMultiplier: 0.75, marginAdjustment: -3, waccAdjustment: 1 } },
  { name: "High Growth", config: { revenueGrowthMultiplier: 1.5, capexMultiplier: 1.3 } },
  { name: "Margin Expansion", config: { marginAdjustment: 5, capexMultiplier: 0.9 } },
  { name: "Recession", config: { revenueGrowthMultiplier: 0.6, marginAdjustment: -5, waccAdjustment: 2 } },
];

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$" };
  const s = symbols[currency] || "$";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${s}${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${s}${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${s}${(value / 1e3).toFixed(0)}K`;
  return `${s}${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

// Slider component
function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit || ""}`;
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-zinc-400">{label}</label>
        <span className="text-sm font-mono font-medium text-white">{displayValue}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-amber-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-amber-500/30
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <div
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ScenarioBuilder({ model, baseAnalysis, currency, onScenarioChange }: ScenarioBuilderProps) {
  const [scenario, setScenario] = useState<ScenarioConfig>(defaultScenario);
  const [isCalculating, setIsCalculating] = useState(false);

  // Apply scenario adjustments to model
  const adjustedAnalysis = useMemo(() => {
    // Create a modified model with scenario adjustments
    const adjustedModel: FinancialModel = {
      ...model,
      incomeStatement: {
        ...model.incomeStatement,
        revenueStreams: model.incomeStatement.revenueStreams.map((rs) => ({
          ...rs,
          growthRates: rs.growthRates.map((g) => g * scenario.revenueGrowthMultiplier),
        })),
        // Adjust cost items to reflect margin changes (reduce costs for positive margin adjustment)
        costItems: model.incomeStatement.costItems.map((ci) => ({
          ...ci,
          baseAmount: ci.baseAmount * (1 - scenario.marginAdjustment / 100),
          revenuePercent: ci.revenuePercent ? ci.revenuePercent * (1 - scenario.marginAdjustment / 100) : undefined,
        })),
      },
      cashFlowAssumptions: {
        ...model.cashFlowAssumptions,
        capexRevenuePercent: model.cashFlowAssumptions.capexRevenuePercent * scenario.capexMultiplier,
        capexFixed: model.cashFlowAssumptions.capexFixed
          ? model.cashFlowAssumptions.capexFixed * scenario.capexMultiplier
          : undefined,
      },
      valuationAssumptions: {
        ...model.valuationAssumptions,
        riskFreeRate: model.valuationAssumptions.riskFreeRate + scenario.waccAdjustment,
        terminalGrowthRate: model.valuationAssumptions.terminalGrowthRate + scenario.terminalGrowthAdjustment,
      },
    };

    return runFinancialAnalysis(adjustedModel);
  }, [model, scenario]);

  const updateScenario = useCallback((updates: Partial<ScenarioConfig>) => {
    setIsCalculating(true);
    const newScenario = { ...scenario, ...updates, name: "Custom" };
    setScenario(newScenario);
    onScenarioChange?.(newScenario);
    setTimeout(() => setIsCalculating(false), 100);
  }, [scenario, onScenarioChange]);

  const applyPreset = (preset: { name: string; config: Partial<ScenarioConfig> }) => {
    const newScenario = { ...defaultScenario, ...preset.config, name: preset.name };
    setScenario(newScenario);
    onScenarioChange?.(newScenario);
  };

  const resetToBase = () => {
    setScenario(defaultScenario);
    onScenarioChange?.(defaultScenario);
  };

  // Calculate deltas
  const baseEV = baseAnalysis.baseCase.dcfValuation.enterpriseValue;
  const adjustedEV = adjustedAnalysis.baseCase.dcfValuation.enterpriseValue;
  const evDelta = adjustedEV - baseEV;
  const evDeltaPercent = (evDelta / baseEV) * 100;

  const baseEquity = baseAnalysis.baseCase.dcfValuation.equityValue;
  const adjustedEquity = adjustedAnalysis.baseCase.dcfValuation.equityValue;
  const equityDelta = adjustedEquity - baseEquity;
  const equityDeltaPercent = (equityDelta / baseEquity) * 100;

  const lastYearBase = baseAnalysis.baseCase.yearlyFinancials[baseAnalysis.baseCase.yearlyFinancials.length - 1];
  const lastYearAdjusted = adjustedAnalysis.baseCase.yearlyFinancials[adjustedAnalysis.baseCase.yearlyFinancials.length - 1];
  const revenueDelta = lastYearAdjusted.revenue - lastYearBase.revenue;
  const revenueDeltaPercent = (revenueDelta / lastYearBase.revenue) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Scenario Builder
            {scenario.name !== "Custom" && (
              <Badge variant="brand">{scenario.name}</Badge>
            )}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Adjust parameters to see real-time impact on valuation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {scenario.name !== "Base Case" && (
            <PremiumButton variant="ghost" size="sm" onClick={resetToBase}>
              Reset
            </PremiumButton>
          )}
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="flex gap-2 flex-wrap">
        {presetScenarios.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              scenario.name === preset.name
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel padding="lg">
            <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-lg">📈</span>
              Growth & Revenue
            </h3>
            <div className="space-y-6">
              <Slider
                label="Revenue Growth Multiplier"
                value={scenario.revenueGrowthMultiplier}
                min={0.5}
                max={2.0}
                step={0.05}
                onChange={(v) => updateScenario({ revenueGrowthMultiplier: v })}
                formatValue={(v) => `${v.toFixed(2)}x`}
              />
            </div>
          </GlassPanel>

          <GlassPanel padding="lg">
            <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-lg">💰</span>
              Profitability
            </h3>
            <div className="space-y-6">
              <Slider
                label="Operating Margin Adjustment"
                value={scenario.marginAdjustment}
                min={-10}
                max={10}
                step={0.5}
                unit="pp"
                onChange={(v) => updateScenario({ marginAdjustment: v })}
                formatValue={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}pp`}
              />
              <Slider
                label="CapEx Multiplier"
                value={scenario.capexMultiplier}
                min={0.5}
                max={2.0}
                step={0.05}
                onChange={(v) => updateScenario({ capexMultiplier: v })}
                formatValue={(v) => `${v.toFixed(2)}x`}
              />
            </div>
          </GlassPanel>

          <GlassPanel padding="lg">
            <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-lg">📊</span>
              Valuation Parameters
            </h3>
            <div className="space-y-6">
              <Slider
                label="WACC Adjustment"
                value={scenario.waccAdjustment}
                min={-3}
                max={5}
                step={0.25}
                onChange={(v) => updateScenario({ waccAdjustment: v })}
                formatValue={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`}
              />
              <Slider
                label="Terminal Growth Adjustment"
                value={scenario.terminalGrowthAdjustment}
                min={-2}
                max={2}
                step={0.1}
                onChange={(v) => updateScenario({ terminalGrowthAdjustment: v })}
                formatValue={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
              />
            </div>
          </GlassPanel>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <GlassPanel variant="brand" padding="lg" glow="amber">
            <h3 className="text-sm font-semibold text-amber-400 mb-4">Scenario Impact</h3>

            {/* Enterprise Value */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500">Enterprise Value</span>
                <span className={`text-xs font-medium ${evDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatPercent(evDeltaPercent)}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(adjustedEV, currency)}
              </div>
              <div className="text-xs text-zinc-500">
                Base: {formatCurrency(baseEV, currency)}
                <span className={`ml-2 ${evDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ({evDelta >= 0 ? "+" : ""}{formatCurrency(evDelta, currency)})
                </span>
              </div>
            </div>

            {/* Equity Value */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500">Equity Value</span>
                <span className={`text-xs font-medium ${equityDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatPercent(equityDeltaPercent)}
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(adjustedEquity, currency)}
              </div>
            </div>

            {/* Revenue (Final Year) */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500">Revenue (Final Year)</span>
                <span className={`text-xs font-medium ${revenueDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatPercent(revenueDeltaPercent)}
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(lastYearAdjusted.revenue, currency)}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="pt-4 border-t border-amber-500/20 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">EBITDA Margin</span>
                <span className="text-white font-medium">
                  {(lastYearAdjusted.ebitdaMargin * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">FCF Margin</span>
                <span className="text-white font-medium">
                  {(lastYearAdjusted.fcfMargin * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">WACC</span>
                <span className="text-white font-medium">
                  {adjustedAnalysis.baseCase.dcfValuation.wacc.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Terminal Growth</span>
                <span className="text-white font-medium">
                  {(model.valuationAssumptions.terminalGrowthRate + scenario.terminalGrowthAdjustment).toFixed(1)}%
                </span>
              </div>
            </div>
          </GlassPanel>

          {/* Confidence Indicator */}
          <GlassPanel padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Scenario Confidence</p>
                <p className="text-sm text-white font-medium">
                  {Math.abs(evDeltaPercent) < 10 ? "High" : Math.abs(evDeltaPercent) < 25 ? "Medium" : "Low"}
                </p>
              </div>
              <ProgressRing
                progress={Math.max(0, 100 - Math.abs(evDeltaPercent) * 2)}
                size={50}
                strokeWidth={4}
                color={Math.abs(evDeltaPercent) < 10 ? "green" : Math.abs(evDeltaPercent) < 25 ? "amber" : "red"}
              />
            </div>
          </GlassPanel>

          {/* Actions */}
          <div className="flex gap-2">
            <PremiumButton variant="secondary" fullWidth size="sm">
              Save Scenario
            </PremiumButton>
            <PremiumButton variant="ghost" fullWidth size="sm">
              Compare
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  );
}
