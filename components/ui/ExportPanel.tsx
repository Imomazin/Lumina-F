"use client";

import { useState } from "react";
import { FinancialModel } from "@/lib/models/financial-model";
import { AnalysisResult } from "@/lib/analysis/financial-engine";
import {
  exportModelSummary,
  exportDetailedProjections,
  exportInvestorDeck,
  exportAll,
} from "@/lib/exporters/excelExport";

interface ExportPanelProps {
  model: FinancialModel;
  analysis: AnalysisResult;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
}

const exportOptions = [
  {
    id: "summary",
    name: "Financial Summary",
    description: "Company profile, assumptions, income statement, cash flows, and valuation",
    icon: "📊",
    format: "CSV",
  },
  {
    id: "detailed",
    name: "Detailed Projections",
    description: "Full line-by-line projections with all revenue and cost items",
    icon: "📈",
    format: "CSV",
  },
  {
    id: "investor",
    name: "Investor Summary",
    description: "Executive summary formatted for investor presentations",
    icon: "💼",
    format: "TXT",
  },
  {
    id: "all",
    name: "Export All",
    description: "Download all export formats at once",
    icon: "📦",
    format: "Multiple",
  },
];

export function ExportPanel({
  model,
  analysis,
  currency,
  isOpen,
  onClose,
}: ExportPanelProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (type: string) => {
    setExporting(type);

    try {
      switch (type) {
        case "summary":
          exportModelSummary(model, analysis, currency);
          break;
        case "detailed":
          exportDetailedProjections(model, analysis, currency);
          break;
        case "investor":
          exportInvestorDeck(model, analysis, currency);
          break;
        case "all":
          exportAll(model, analysis, currency);
          break;
      }
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Export Model</h2>
            <p className="text-sm text-zinc-400">
              Download your financial model in various formats
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Export Options */}
        <div className="p-4 space-y-3">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleExport(option.id)}
              disabled={exporting !== null}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                exporting === option.id
                  ? "border-amber-500/50 bg-amber-500/10"
                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{option.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300">
                      {option.format}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{option.description}</p>
                </div>
                {exporting === option.id ? (
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Model Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-zinc-500">Model:</span>
              <span className="text-white ml-2">{model.profile.companyName}</span>
            </div>
            <div>
              <span className="text-zinc-500">Last updated:</span>
              <span className="text-white ml-2">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// Hook for managing export panel state
export function useExportPanel() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
