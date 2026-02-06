"use client";

import { useState, useEffect, useCallback } from "react";
import { FinancialModel, createDefaultModel } from "@/lib/models/financial-model";

const STORAGE_KEY = "lumina-f-financial-model";

interface StoredModel {
  model: FinancialModel;
  lastSaved: string;
}

export function useFinancialModel() {
  const [model, setModel] = useState<FinancialModel | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredModel = JSON.parse(stored);
        setModel(parsed.model);
        setLastSaved(parsed.lastSaved);
      }
    } catch (error) {
      console.error("Failed to load financial model from storage:", error);
    }
    setIsLoading(false);
  }, []);

  // Save model to localStorage
  const saveModel = useCallback((newModel: FinancialModel) => {
    const timestamp = new Date().toISOString();
    const stored: StoredModel = {
      model: newModel,
      lastSaved: timestamp,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setModel(newModel);
      setLastSaved(timestamp);
      setIsDirty(false);
      return timestamp;
    } catch (error) {
      console.error("Failed to save financial model:", error);
      throw error;
    }
  }, []);

  // Update model without saving
  const updateModel = useCallback((newModel: FinancialModel) => {
    setModel(newModel);
    setIsDirty(true);
  }, []);

  // Clear model
  const clearModel = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setModel(null);
      setLastSaved(null);
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to clear financial model:", error);
    }
  }, []);

  // Create new model with defaults
  const createNewModel = useCallback((companyName?: string) => {
    const newModel = createDefaultModel(companyName);
    setModel(newModel);
    setIsDirty(true);
    return newModel;
  }, []);

  // Check if model has minimum required data
  const isModelValid = useCallback((m: FinancialModel | null): boolean => {
    if (!m) return false;
    return (
      m.profile.companyName.length > 0 &&
      m.revenue.streams.length > 0 &&
      m.revenue.streams.some(s => s.baseAmount > 0)
    );
  }, []);

  return {
    model,
    lastSaved,
    isLoading,
    isDirty,
    saveModel,
    updateModel,
    clearModel,
    createNewModel,
    isModelValid,
    hasModel: model !== null,
  };
}

export function formatLastSaved(isoString: string | null): string {
  if (!isoString) return "Never";

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
