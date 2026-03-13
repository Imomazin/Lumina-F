"use client";

import { useState, useCallback, useRef } from "react";
import { parseFile, ParsedFinancialData, getSupportedFormats } from "@/lib/utils/file-parser";

interface FileUploadProps {
  onDataImported: (data: ParsedFinancialData) => void;
  className?: string;
}

export function FileUpload({ onDataImported, className = "" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedFinancialData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const result = await parseFile(file);

      if (!result.success || !result.data) {
        setError(result.error || "Failed to parse file");
        setPreview(null);
      } else {
        setPreview(result.data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setPreview(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (preview) {
      onDataImported(preview);
      setPreview(null);
      setFileName(null);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const supportedFormats = getSupportedFormats().join(", ");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all
          ${isDragging
            ? "border-amber-500 bg-amber-500/10"
            : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
          }
          ${isProcessing ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          {/* Upload Icon */}
          <div className={`rounded-full p-4 ${isDragging ? "bg-amber-500/20" : "bg-zinc-800"}`}>
            <svg
              className={`h-8 w-8 ${isDragging ? "text-amber-500" : "text-zinc-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-lg font-medium text-white">
              {isProcessing ? "Processing..." : "Drop your file here"}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              or click to browse
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="rounded bg-zinc-800 px-2 py-1">Excel (.xlsx)</span>
            <span className="rounded bg-zinc-800 px-2 py-1">CSV</span>
            <span className="rounded bg-zinc-800 px-2 py-1">XLS</span>
          </div>
        </div>

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-zinc-900/80">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-white">Analyzing {fileName}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-400">Error parsing file</p>
              <p className="mt-1 text-sm text-red-300/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Panel */}
      {preview && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">{fileName}</p>
                <p className="text-xs text-zinc-400">
                  {preview.rawData.length} rows • {preview.headers.length} columns
                  {preview.sheetNames && ` • ${preview.sheetNames.length} sheets`}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300">
              {preview.fileType.toUpperCase()}
            </span>
          </div>

          {/* Extracted Data Summary */}
          <div className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-zinc-300">Detected Financial Data</h4>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {/* Company Info */}
              {preview.companyName && (
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <p className="text-xs text-zinc-500">Company Name</p>
                  <p className="font-medium text-white">{preview.companyName}</p>
                </div>
              )}

              {preview.ticker && (
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <p className="text-xs text-zinc-500">Ticker Symbol</p>
                  <p className="font-medium text-white">{preview.ticker}</p>
                </div>
              )}

              {/* Historical Data */}
              {preview.historicalData && preview.historicalData.length > 0 && (
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <p className="text-xs text-zinc-500">Historical Data</p>
                  <p className="font-medium text-white">
                    {preview.historicalData.length} years
                    ({preview.historicalData[0].year} - {preview.historicalData[preview.historicalData.length - 1].year})
                  </p>
                </div>
              )}

              {/* Revenue Streams */}
              {preview.revenueStreams && preview.revenueStreams.length > 0 && (
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <p className="text-xs text-zinc-500">Revenue Streams</p>
                  <p className="font-medium text-white">{preview.revenueStreams.length} detected</p>
                </div>
              )}

              {/* Balance Sheet */}
              {preview.balanceSheet && Object.keys(preview.balanceSheet).length > 0 && (
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <p className="text-xs text-zinc-500">Balance Sheet Items</p>
                  <p className="font-medium text-white">{Object.keys(preview.balanceSheet).length} detected</p>
                </div>
              )}
            </div>

            {/* Data Table Preview */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-zinc-300 mb-2">Data Preview (First 5 rows)</h4>
              <div className="overflow-x-auto rounded-lg border border-zinc-700">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800">
                    <tr>
                      {preview.headers.slice(0, 6).map((header, idx) => (
                        <th key={idx} className="px-3 py-2 text-left font-medium text-zinc-400">
                          {header}
                        </th>
                      ))}
                      {preview.headers.length > 6 && (
                        <th className="px-3 py-2 text-left font-medium text-zinc-500">
                          +{preview.headers.length - 6} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {preview.rawData.slice(0, 5).map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-zinc-800/50">
                        {preview.headers.slice(0, 6).map((header, colIdx) => (
                          <td key={colIdx} className="px-3 py-2 text-zinc-300 whitespace-nowrap">
                            {row[header] !== undefined ? String(row[header]) : "-"}
                          </td>
                        ))}
                        {preview.headers.length > 6 && (
                          <td className="px-3 py-2 text-zinc-500">...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-700 bg-zinc-800/30 px-4 py-3">
            <button
              onClick={handleCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
