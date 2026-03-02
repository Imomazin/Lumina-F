"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FinancialInputForm } from "@/components/FinancialInputForm";
import { FileUpload } from "@/components/FileUpload";
import { AIAssistant } from "@/components/AIAssistant";
import { useFinancialModel, formatLastSaved } from "@/lib/hooks/useFinancialModel";
import { FinancialModel } from "@/lib/models/financial-model";
import { ParsedFinancialData } from "@/lib/utils/file-parser";
import {
  GlassPanel,
  PremiumButton,
  Badge,
  Skeleton,
  Divider,
} from "@/components/ui/design-system";

export default function InputsPage() {
  const router = useRouter();
  const { model, lastSaved, isLoading, saveModel, createNewModel, clearModel, updateModel } = useFinancialModel();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [importedData, setImportedData] = useState<ParsedFinancialData | null>(null);

  // Initialize with default model if none exists
  useEffect(() => {
    if (!isLoading && !model) {
      createNewModel();
    }
  }, [isLoading, model, createNewModel]);

  const handleSave = (newModel: FinancialModel) => {
    saveModel(newModel);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleNext = () => {
    if (model) {
      saveModel(model);
    }
    router.push("/analysis");
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      clearModel();
      createNewModel();
      setImportedData(null);
    }
  };

  const handleFileImport = (data: ParsedFinancialData) => {
    setImportedData(data);

    if (model) {
      const updatedModel: FinancialModel = {
        ...model,
        profile: {
          ...model.profile,
          companyName: data.companyName || model.profile.companyName,
        },
        incomeStatement: {
          ...model.incomeStatement,
          revenueStreams: data.revenueStreams?.map((rs, idx) => ({
            id: `imported-${idx}`,
            name: rs.name,
            type: 'subscription' as const,
            baseAmount: rs.baseAmount,
            growthRates: Array(model.profile.forecastYears).fill(rs.growthRate || 5),
          })) || model.incomeStatement.revenueStreams,
        },
        balanceSheet: data.balanceSheet ? {
          ...model.balanceSheet,
          cashAndEquivalents: data.balanceSheet.cash || model.balanceSheet.cashAndEquivalents,
          accountsReceivable: data.balanceSheet.accountsReceivable || model.balanceSheet.accountsReceivable,
          inventory: data.balanceSheet.inventory || model.balanceSheet.inventory,
          accountsPayable: data.balanceSheet.accountsPayable || model.balanceSheet.accountsPayable,
          shortTermDebt: data.balanceSheet.shortTermDebt || model.balanceSheet.shortTermDebt,
          longTermDebt: data.balanceSheet.longTermDebt || model.balanceSheet.longTermDebt,
        } : model.balanceSheet,
        updatedAt: new Date(),
      };

      updateModel(updatedModel);
      setShowUpload(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton width={200} height={32} />
          <div className="flex gap-2">
            <Skeleton width={80} height={36} />
            <Skeleton width={120} height={36} />
          </div>
        </div>
        <Skeleton height={200} className="rounded-2xl" />
        <Skeleton height={400} className="rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Model Builder
            <Badge variant="brand">
              {model?.profile?.companyName || "New Model"}
            </Badge>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure your financial model inputs and assumptions
            {lastSaved && <span className="mx-2">·</span>}
            {lastSaved && <span>Last saved {formatLastSaved(lastSaved)}</span>}
            {showSuccess && (
              <span className="ml-2 text-green-400">✓ Saved</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PremiumButton variant="ghost" onClick={() => setShowAIChat(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ask AI
          </PremiumButton>
          <PremiumButton variant="danger" size="sm" onClick={handleClear}>
            Clear All
          </PremiumButton>
          <PremiumButton variant="primary" onClick={handleNext}>
            Run Analysis
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </PremiumButton>
        </div>
      </div>

      {/* Quick Tip */}
      <GlassPanel variant="brand" padding="md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <p className="text-sm text-zinc-300">
              <span className="text-amber-400 font-medium">Pro Tip:</span> Upload Excel or CSV files to instantly populate your financial model.
              The system supports smart field mapping for common financial formats.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="ml-auto text-xs text-zinc-400 hover:text-white flex items-center gap-1"
          >
            {showUpload ? "Hide" : "Show"} Importer
            <svg
              className={`w-4 h-4 transition-transform ${showUpload ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </GlassPanel>

      {/* File Upload Section */}
      {showUpload && (
        <GlassPanel padding="lg" animate>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Import Financial Data</h2>
              <p className="text-sm text-zinc-400">Upload Excel (.xlsx) or CSV files</p>
            </div>
          </div>

          <FileUpload onDataImported={handleFileImport} />

          {importedData && (
            <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Data imported successfully!</span>
              </div>
              <p className="mt-1 text-sm text-green-300/70">
                Your financial data has been imported. Review and adjust the values below as needed.
              </p>
            </div>
          )}
        </GlassPanel>
      )}

      <Divider label="Financial Model Configuration" />

      {/* Form */}
      {model && (
        <FinancialInputForm
          initialData={model}
          onSave={handleSave}
        />
      )}

      {/* AI Assistant Modal */}
      <AIAssistant
        model={model}
        analysis={null}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />
    </div>
  );
}
