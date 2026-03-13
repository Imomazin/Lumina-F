"use client";

import { useState, useMemo } from "react";
import { FinancialModel } from "@/lib/models/financial-model";
import { runFinancialAnalysis, AnalysisResult } from "@/lib/analysis/financial-engine";
import { GlassPanel, PremiumButton, Badge, ProgressRing } from "@/components/ui/design-system";

interface ModelVersion {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  model: FinancialModel;
  tags?: string[];
  isCurrent?: boolean;
}

interface ModelVersioningProps {
  currentModel: FinancialModel;
  currency: string;
  onRestoreVersion?: (model: FinancialModel) => void;
}

// Storage key for versions
const VERSIONS_KEY = "lumina-model-versions";

// Format currency
function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$" };
  const s = symbols[currency] || "$";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${s}${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${s}${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${s}${(value / 1e3).toFixed(0)}K`;
  return `${s}${value.toFixed(0)}`;
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// Generate version ID
function generateId(): string {
  return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Load versions from localStorage
function loadVersions(): ModelVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(VERSIONS_KEY);
    if (!data) return [];
    const versions = JSON.parse(data);
    return versions.map((v: ModelVersion) => ({
      ...v,
      createdAt: new Date(v.createdAt),
    }));
  } catch {
    return [];
  }
}

// Save versions to localStorage
function saveVersions(versions: ModelVersion[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
}

// Compare two analyses
function compareAnalyses(a: AnalysisResult, b: AnalysisResult) {
  const aLast = a.baseCase.yearlyFinancials[a.baseCase.yearlyFinancials.length - 1];
  const bLast = b.baseCase.yearlyFinancials[b.baseCase.yearlyFinancials.length - 1];

  return {
    enterpriseValue: {
      a: a.baseCase.dcfValuation.enterpriseValue,
      b: b.baseCase.dcfValuation.enterpriseValue,
      delta: b.baseCase.dcfValuation.enterpriseValue - a.baseCase.dcfValuation.enterpriseValue,
      deltaPercent: ((b.baseCase.dcfValuation.enterpriseValue - a.baseCase.dcfValuation.enterpriseValue) / a.baseCase.dcfValuation.enterpriseValue) * 100,
    },
    equityValue: {
      a: a.baseCase.dcfValuation.equityValue,
      b: b.baseCase.dcfValuation.equityValue,
      delta: b.baseCase.dcfValuation.equityValue - a.baseCase.dcfValuation.equityValue,
      deltaPercent: ((b.baseCase.dcfValuation.equityValue - a.baseCase.dcfValuation.equityValue) / a.baseCase.dcfValuation.equityValue) * 100,
    },
    revenue: {
      a: aLast?.revenue || 0,
      b: bLast?.revenue || 0,
      delta: (bLast?.revenue || 0) - (aLast?.revenue || 0),
      deltaPercent: aLast?.revenue ? (((bLast?.revenue || 0) - aLast.revenue) / aLast.revenue) * 100 : 0,
    },
    ebitda: {
      a: aLast?.ebitda || 0,
      b: bLast?.ebitda || 0,
      delta: (bLast?.ebitda || 0) - (aLast?.ebitda || 0),
      deltaPercent: aLast?.ebitda ? (((bLast?.ebitda || 0) - aLast.ebitda) / aLast.ebitda) * 100 : 0,
    },
    netIncome: {
      a: aLast?.netIncome || 0,
      b: bLast?.netIncome || 0,
      delta: (bLast?.netIncome || 0) - (aLast?.netIncome || 0),
      deltaPercent: aLast?.netIncome ? (((bLast?.netIncome || 0) - aLast.netIncome) / aLast.netIncome) * 100 : 0,
    },
    wacc: {
      a: a.baseCase.dcfValuation.wacc,
      b: b.baseCase.dcfValuation.wacc,
      delta: b.baseCase.dcfValuation.wacc - a.baseCase.dcfValuation.wacc,
      deltaPercent: ((b.baseCase.dcfValuation.wacc - a.baseCase.dcfValuation.wacc) / a.baseCase.dcfValuation.wacc) * 100,
    },
  };
}

// Version card component
function VersionCard({
  version,
  isSelected,
  onSelect,
  onDelete,
  onRestore,
  currency,
}: {
  version: ModelVersion;
  isSelected: boolean;
  onSelect: (v: ModelVersion) => void;
  onDelete: (id: string) => void;
  onRestore: (v: ModelVersion) => void;
  currency: string;
}) {
  const analysis = useMemo(() => runFinancialAnalysis(version.model), [version.model]);

  return (
    <div
      className={`rounded-xl border p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-amber-500/50 bg-amber-500/5"
          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
      }`}
      onClick={() => onSelect(version)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-white">{version.name}</h4>
          {version.isCurrent && (
            <Badge variant="brand">Current</Badge>
          )}
        </div>
        <span className="text-xs text-zinc-500">{formatRelativeTime(version.createdAt)}</span>
      </div>

      {version.description && (
        <p className="text-sm text-zinc-400 mb-3">{version.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
          <p className="text-xs text-zinc-500">Enterprise Value</p>
          <p className="text-sm font-bold text-white">
            {formatCurrency(analysis.baseCase.dcfValuation.enterpriseValue, currency)}
          </p>
        </div>
        <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
          <p className="text-xs text-zinc-500">WACC</p>
          <p className="text-sm font-bold text-white">
            {analysis.baseCase.dcfValuation.wacc.toFixed(1)}%
          </p>
        </div>
      </div>

      {version.tags && version.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {version.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <PremiumButton
          variant="ghost"
          size="sm"
          onClick={() => onRestore(version)}
          disabled={version.isCurrent}
        >
          Restore
        </PremiumButton>
        <PremiumButton
          variant="ghost"
          size="sm"
          onClick={() => onDelete(version.id)}
          disabled={version.isCurrent}
        >
          Delete
        </PremiumButton>
      </div>
    </div>
  );
}

// Comparison metric row
function ComparisonRow({
  label,
  valueA,
  valueB,
  delta,
  deltaPercent,
  format = "currency",
  currency,
}: {
  label: string;
  valueA: number;
  valueB: number;
  delta: number;
  deltaPercent: number;
  format?: "currency" | "percent";
  currency: string;
}) {
  const formatValue = (v: number) => {
    if (format === "percent") return `${v.toFixed(1)}%`;
    return formatCurrency(v, currency);
  };

  const formatDelta = (d: number) => {
    if (format === "percent") return `${d >= 0 ? "+" : ""}${d.toFixed(2)}%`;
    return `${d >= 0 ? "+" : ""}${formatCurrency(d, currency)}`;
  };

  return (
    <tr className="border-b border-zinc-800/50">
      <td className="py-3 px-4 text-zinc-300">{label}</td>
      <td className="py-3 px-4 text-right font-mono text-zinc-400">{formatValue(valueA)}</td>
      <td className="py-3 px-4 text-right font-mono text-white">{formatValue(valueB)}</td>
      <td className="py-3 px-4 text-right">
        <span className={`font-mono ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
          {formatDelta(delta)}
        </span>
        <span className="text-xs text-zinc-500 ml-1">
          ({deltaPercent >= 0 ? "+" : ""}{deltaPercent.toFixed(1)}%)
        </span>
      </td>
    </tr>
  );
}

// Main component
export function ModelVersioning({ currentModel, currency, onRestoreVersion }: ModelVersioningProps) {
  const [versions, setVersions] = useState<ModelVersion[]>(() => loadVersions());
  const [selectedVersionA, setSelectedVersionA] = useState<ModelVersion | null>(null);
  const [selectedVersionB, setSelectedVersionB] = useState<ModelVersion | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [newVersionDescription, setNewVersionDescription] = useState("");
  const [newVersionTags, setNewVersionTags] = useState("");

  // Current model analysis
  const currentAnalysis = useMemo(() => runFinancialAnalysis(currentModel), [currentModel]);

  // Save new version
  const handleSaveVersion = () => {
    const newVersion: ModelVersion = {
      id: generateId(),
      name: newVersionName || `Version ${versions.length + 1}`,
      description: newVersionDescription || undefined,
      createdAt: new Date(),
      model: currentModel,
      tags: newVersionTags ? newVersionTags.split(",").map((t) => t.trim()) : undefined,
      isCurrent: true,
    };

    // Mark all others as not current
    const updatedVersions = versions.map((v) => ({ ...v, isCurrent: false }));
    const allVersions = [newVersion, ...updatedVersions];

    setVersions(allVersions);
    saveVersions(allVersions);
    setShowSaveModal(false);
    setNewVersionName("");
    setNewVersionDescription("");
    setNewVersionTags("");
  };

  // Delete version
  const handleDeleteVersion = (id: string) => {
    const updated = versions.filter((v) => v.id !== id);
    setVersions(updated);
    saveVersions(updated);
    if (selectedVersionA?.id === id) setSelectedVersionA(null);
    if (selectedVersionB?.id === id) setSelectedVersionB(null);
  };

  // Restore version
  const handleRestoreVersion = (version: ModelVersion) => {
    onRestoreVersion?.(version.model);
    const updated = versions.map((v) => ({
      ...v,
      isCurrent: v.id === version.id,
    }));
    setVersions(updated);
    saveVersions(updated);
  };

  // Comparison data
  const comparison = useMemo(() => {
    if (!selectedVersionA || !selectedVersionB) return null;
    const analysisA = runFinancialAnalysis(selectedVersionA.model);
    const analysisB = runFinancialAnalysis(selectedVersionB.model);
    return compareAnalyses(analysisA, analysisB);
  }, [selectedVersionA, selectedVersionB]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Model Versions
            <Badge variant="default">{versions.length} saved</Badge>
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Save snapshots of your model and compare changes over time
          </p>
        </div>

        <PremiumButton variant="primary" onClick={() => setShowSaveModal(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Save Version
        </PremiumButton>
      </div>

      {/* Current Model Stats */}
      <GlassPanel padding="lg" variant="brand" glow="amber">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-amber-400">Current Model</h3>
          <span className="text-xs text-zinc-500">{currentModel.profile.companyName}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-zinc-500">Enterprise Value</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(currentAnalysis.baseCase.dcfValuation.enterpriseValue, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Equity Value</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(currentAnalysis.baseCase.dcfValuation.equityValue, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">WACC</p>
            <p className="text-lg font-bold text-white">
              {currentAnalysis.baseCase.dcfValuation.wacc.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Terminal Growth</p>
            <p className="text-lg font-bold text-white">
              {currentModel.valuationAssumptions.terminalGrowthRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </GlassPanel>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Version List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            Saved Versions
            {versions.length > 0 && (
              <span className="text-xs text-zinc-500">(Select two to compare)</span>
            )}
          </h3>

          {versions.length === 0 ? (
            <GlassPanel padding="lg">
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-zinc-400 mb-2">No versions saved yet</p>
                <p className="text-sm text-zinc-600">
                  Save a version to track changes to your financial model
                </p>
              </div>
            </GlassPanel>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {versions.map((version) => (
                <VersionCard
                  key={version.id}
                  version={version}
                  isSelected={selectedVersionA?.id === version.id || selectedVersionB?.id === version.id}
                  onSelect={(v) => {
                    if (!selectedVersionA) {
                      setSelectedVersionA(v);
                    } else if (!selectedVersionB && v.id !== selectedVersionA.id) {
                      setSelectedVersionB(v);
                    } else if (v.id === selectedVersionA.id) {
                      setSelectedVersionA(selectedVersionB);
                      setSelectedVersionB(null);
                    } else if (v.id === selectedVersionB?.id) {
                      setSelectedVersionB(null);
                    } else {
                      setSelectedVersionA(v);
                      setSelectedVersionB(null);
                    }
                  }}
                  onDelete={handleDeleteVersion}
                  onRestore={handleRestoreVersion}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comparison Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400">Version Comparison</h3>

          {comparison ? (
            <GlassPanel padding="none">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">Version A</p>
                    <p className="text-sm font-medium text-zinc-300">{selectedVersionA?.name}</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <div>
                    <p className="text-xs text-zinc-500">Version B</p>
                    <p className="text-sm font-medium text-white">{selectedVersionB?.name}</p>
                  </div>
                </div>
                <PremiumButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedVersionA(null);
                    setSelectedVersionB(null);
                  }}
                >
                  Clear
                </PremiumButton>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-zinc-500 font-medium">Metric</th>
                      <th className="text-right py-3 px-4 text-zinc-500 font-medium">Version A</th>
                      <th className="text-right py-3 px-4 text-zinc-500 font-medium">Version B</th>
                      <th className="text-right py-3 px-4 text-zinc-500 font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ComparisonRow
                      label="Enterprise Value"
                      valueA={comparison.enterpriseValue.a}
                      valueB={comparison.enterpriseValue.b}
                      delta={comparison.enterpriseValue.delta}
                      deltaPercent={comparison.enterpriseValue.deltaPercent}
                      currency={currency}
                    />
                    <ComparisonRow
                      label="Equity Value"
                      valueA={comparison.equityValue.a}
                      valueB={comparison.equityValue.b}
                      delta={comparison.equityValue.delta}
                      deltaPercent={comparison.equityValue.deltaPercent}
                      currency={currency}
                    />
                    <ComparisonRow
                      label="Revenue (Final Year)"
                      valueA={comparison.revenue.a}
                      valueB={comparison.revenue.b}
                      delta={comparison.revenue.delta}
                      deltaPercent={comparison.revenue.deltaPercent}
                      currency={currency}
                    />
                    <ComparisonRow
                      label="EBITDA (Final Year)"
                      valueA={comparison.ebitda.a}
                      valueB={comparison.ebitda.b}
                      delta={comparison.ebitda.delta}
                      deltaPercent={comparison.ebitda.deltaPercent}
                      currency={currency}
                    />
                    <ComparisonRow
                      label="Net Income (Final Year)"
                      valueA={comparison.netIncome.a}
                      valueB={comparison.netIncome.b}
                      delta={comparison.netIncome.delta}
                      deltaPercent={comparison.netIncome.deltaPercent}
                      currency={currency}
                    />
                    <ComparisonRow
                      label="WACC"
                      valueA={comparison.wacc.a}
                      valueB={comparison.wacc.b}
                      delta={comparison.wacc.delta}
                      deltaPercent={comparison.wacc.deltaPercent}
                      format="percent"
                      currency={currency}
                    />
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Net Valuation Impact</span>
                  <span className={`text-lg font-bold ${comparison.enterpriseValue.delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {comparison.enterpriseValue.delta >= 0 ? "+" : ""}
                    {formatCurrency(comparison.enterpriseValue.delta, currency)}
                    <span className="text-sm text-zinc-500 ml-2">
                      ({comparison.enterpriseValue.deltaPercent >= 0 ? "+" : ""}
                      {comparison.enterpriseValue.deltaPercent.toFixed(1)}%)
                    </span>
                  </span>
                </div>
              </div>
            </GlassPanel>
          ) : (
            <GlassPanel padding="lg">
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-zinc-400 mb-2">Select two versions to compare</p>
                <p className="text-sm text-zinc-600">
                  Click on version cards to select them for comparison
                </p>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>

      {/* Save Version Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
          <div className="relative w-full max-w-md">
            <GlassPanel padding="lg" variant="elevated">
              <h3 className="text-lg font-bold text-white mb-4">Save Model Version</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Version Name</label>
                  <input
                    type="text"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder={`Version ${versions.length + 1}`}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Description (optional)</label>
                  <textarea
                    value={newVersionDescription}
                    onChange={(e) => setNewVersionDescription(e.target.value)}
                    placeholder="Describe changes in this version..."
                    rows={2}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newVersionTags}
                    onChange={(e) => setNewVersionTags(e.target.value)}
                    placeholder="e.g., baseline, q4-forecast, optimistic"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <PremiumButton variant="ghost" fullWidth onClick={() => setShowSaveModal(false)}>
                  Cancel
                </PremiumButton>
                <PremiumButton variant="primary" fullWidth onClick={handleSaveVersion}>
                  Save Version
                </PremiumButton>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
