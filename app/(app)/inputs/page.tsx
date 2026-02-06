"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FinancialInputForm } from "@/components/FinancialInputForm";
import { useFinancialModel, formatLastSaved } from "@/lib/hooks/useFinancialModel";
import { FinancialModel } from "@/lib/models/financial-model";

export default function InputsPage() {
  const router = useRouter();
  const { model, lastSaved, isLoading, saveModel, createNewModel, clearModel } = useFinancialModel();
  const [showSuccess, setShowSuccess] = useState(false);

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

      {/* Form */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {model && (
          <FinancialInputForm
            initialData={model}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
