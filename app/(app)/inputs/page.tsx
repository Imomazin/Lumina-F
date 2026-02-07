"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FinancialInputForm } from "@/components/FinancialInputForm";
import { FileUpload } from "@/components/FileUpload";
import { AIAssistant, AIChatButton } from "@/components/AIAssistant";
import { TipBanner } from "@/components/Banners";
import { useFinancialModel, formatLastSaved } from "@/lib/hooks/useFinancialModel";
import { FinancialModel } from "@/lib/models/financial-model";
import { ParsedFinancialData } from "@/lib/utils/file-parser";

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

    // Update model with imported data
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Tip Banner */}
      <TipBanner tip="Upload Excel or CSV files to instantly populate your financial model. The AI will help validate your data!" />

      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Financial <span className="text-amber-400">Inputs</span>
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Enter comprehensive financial data for advanced analysis
              </p>
            </div>
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-xs text-zinc-500">
                  Last saved: {formatLastSaved(lastSaved)}
                </span>
              )}
              {showSuccess && (
                <span className="text-xs text-green-400 animate-fade-in">
                  Saved successfully
                </span>
              )}
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
              >
                Run Analysis →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* File Upload Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Import Financial Data</h2>
                <p className="text-sm text-zinc-400">Upload Excel or CSV files to auto-populate your model</p>
              </div>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              {showUpload ? "Hide" : "Show"} Upload
              <svg
                className={`h-4 w-4 transition-transform ${showUpload ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showUpload && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
              <FileUpload onDataImported={handleFileImport} />

              {importedData && (
                <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Data imported successfully!</span>
                  </div>
                  <p className="mt-1 text-sm text-green-300/70">
                    Your financial data has been imported into the form below. Review and adjust as needed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#0a0a0a] px-4 text-sm text-zinc-500">
              or enter data manually
            </span>
          </div>
        </div>

        {/* Form */}
        {model && (
          <FinancialInputForm
            initialData={model}
            onSave={handleSave}
          />
        )}
      </div>

      {/* AI Chat Button */}
      <AIChatButton onClick={() => setShowAIChat(true)} />

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
