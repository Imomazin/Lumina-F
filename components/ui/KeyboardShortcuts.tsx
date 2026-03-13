"use client";

import { useState, useEffect } from "react";
import { GlassPanel, PremiumButton } from "@/components/ui/design-system";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["⌘", "K"], description: "Open command palette", category: "Navigation" },
  { keys: ["⌘", "D"], description: "Go to Dashboard", category: "Navigation" },
  { keys: ["⌘", "I"], description: "Go to Inputs", category: "Navigation" },
  { keys: ["⌘", "A"], description: "Go to Analysis", category: "Navigation" },
  { keys: ["⌘", "R"], description: "Go to Reports", category: "Navigation" },
  { keys: ["⌘", "?"], description: "Show keyboard shortcuts", category: "Navigation" },

  // Actions
  { keys: ["⌘", "S"], description: "Save current model", category: "Actions" },
  { keys: ["⌘", "E"], description: "Export report", category: "Actions" },
  { keys: ["⌘", "N"], description: "Create new model", category: "Actions" },
  { keys: ["⌘", "⇧", "D"], description: "Load demo data", category: "Actions" },

  // Views
  { keys: ["1"], description: "Switch to Overview", category: "Views" },
  { keys: ["2"], description: "Switch to Finance", category: "Views" },
  { keys: ["3"], description: "Switch to Charts", category: "Views" },
  { keys: ["4"], description: "Switch to Scenarios", category: "Views" },

  // Analysis
  { keys: ["⌘", "⇧", "A"], description: "Run full analysis", category: "Analysis" },
  { keys: ["⌘", "⇧", "M"], description: "Run Monte Carlo simulation", category: "Analysis" },
  { keys: ["⌘", "⇧", "S"], description: "Run sensitivity analysis", category: "Analysis" },

  // UI
  { keys: ["Esc"], description: "Close modal / panel", category: "UI" },
  { keys: ["⌘", "["], description: "Collapse sidebar", category: "UI" },
  { keys: ["⌘", "]"], description: "Expand sidebar", category: "UI" },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [...new Set(shortcuts.map((s) => s.category))];

  const filteredShortcuts = shortcuts.filter(
    (s) =>
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedShortcuts = categories.reduce((acc, category) => {
    acc[category] = filteredShortcuts.filter((s) => s.category === category);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <GlassPanel padding="none" variant="elevated">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">⌨️</span>
                Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryShortcuts = groupedShortcuts[category];
                if (!categoryShortcuts?.length) return null;

                return (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
                        >
                          <span className="text-sm text-zinc-300">{shortcut.description}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIdx) => (
                              <kbd
                                key={keyIdx}
                                className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono text-zinc-300"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            <p className="text-xs text-zinc-500 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Esc</kbd> to close
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

// Hook to show shortcuts modal
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
