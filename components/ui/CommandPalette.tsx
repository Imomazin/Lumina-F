"use client";

import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  category: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  customCommands?: CommandItem[];
  onOpenChange?: (open: boolean) => void;
}

const defaultCategories = [
  { id: "navigation", label: "Navigation", icon: "🧭" },
  { id: "analysis", label: "Analysis", icon: "📊" },
  { id: "actions", label: "Actions", icon: "⚡" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function CommandPalette({ customCommands = [], onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Default commands
  const defaultCommands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      description: "View your financial command centre",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      shortcut: ["G", "D"],
      category: "navigation",
      action: () => router.push("/dashboard"),
      keywords: ["home", "main", "overview"],
    },
    {
      id: "nav-inputs",
      label: "Go to Model Builder",
      description: "Configure your financial model inputs",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
      shortcut: ["G", "I"],
      category: "navigation",
      action: () => router.push("/inputs"),
      keywords: ["edit", "configure", "setup", "assumptions"],
    },
    {
      id: "nav-analysis",
      label: "Go to Analysis",
      description: "View detailed financial analysis",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      shortcut: ["G", "A"],
      category: "navigation",
      action: () => router.push("/analysis"),
      keywords: ["charts", "metrics", "valuation"],
    },
    {
      id: "nav-reports",
      label: "Go to Reports",
      description: "Generate and export reports",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      shortcut: ["G", "R"],
      category: "navigation",
      action: () => router.push("/reports"),
      keywords: ["pdf", "export", "download"],
    },

    // Analysis actions
    {
      id: "action-scenarios",
      label: "Run Scenario Analysis",
      description: "Compare base, upside, and downside cases",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
      shortcut: ["S", "A"],
      category: "analysis",
      action: () => router.push("/analysis?view=scenarios"),
      keywords: ["compare", "what-if", "monte carlo"],
    },
    {
      id: "action-dcf",
      label: "View DCF Valuation",
      description: "Discounted cash flow analysis",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      shortcut: ["D", "C", "F"],
      category: "analysis",
      action: () => router.push("/analysis?view=dcf"),
      keywords: ["valuation", "enterprise value", "equity value"],
    },
    {
      id: "action-sensitivity",
      label: "Sensitivity Analysis",
      description: "Analyze impact of key assumptions",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
      category: "analysis",
      action: () => router.push("/analysis?view=sensitivity"),
      keywords: ["tornado", "wacc", "terminal growth"],
    },

    // Actions
    {
      id: "action-export-pdf",
      label: "Export PDF Report",
      description: "Generate executive summary PDF",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      shortcut: ["Cmd", "P"],
      category: "actions",
      action: () => window.print(),
      keywords: ["download", "print", "save"],
    },
    {
      id: "action-ai-chat",
      label: "Ask AI Assistant",
      description: "Get AI-powered financial insights",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      shortcut: ["Cmd", "J"],
      category: "actions",
      action: () => document.dispatchEvent(new CustomEvent("open-ai-chat")),
      keywords: ["chat", "help", "question", "gpt"],
    },
    {
      id: "action-load-demo",
      label: "Load Demo Data",
      description: "Load TechVentures Inc. demo model",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
      category: "actions",
      action: () => document.dispatchEvent(new CustomEvent("load-demo")),
      keywords: ["sample", "example", "test"],
    },
    {
      id: "action-new-model",
      label: "Create New Model",
      description: "Start a fresh financial model",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>,
      shortcut: ["Cmd", "N"],
      category: "actions",
      action: () => router.push("/inputs?new=true"),
      keywords: ["create", "start", "fresh"],
    },

    // Settings
    {
      id: "settings-theme",
      label: "Toggle Dark Mode",
      description: "Switch between light and dark themes",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
      category: "settings",
      action: () => document.documentElement.classList.toggle("dark"),
      keywords: ["light", "dark", "appearance"],
    },
    {
      id: "settings-currency",
      label: "Change Currency",
      description: "Update default currency format",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      category: "settings",
      action: () => router.push("/inputs?section=profile"),
      keywords: ["usd", "eur", "gbp", "money"],
    },
  ], [router]);

  const allCommands = useMemo(() => [...defaultCommands, ...customCommands], [defaultCommands, customCommands]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query && !selectedCategory) return allCommands;

    return allCommands.filter(cmd => {
      const matchesCategory = !selectedCategory || cmd.category === selectedCategory;
      if (!query) return matchesCategory;

      const matchesSearch =
        cmd.label.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query) ||
        cmd.keywords?.some(k => k.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [allCommands, search, selectedCategory]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Open with Cmd+K
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen(prev => !prev);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearch("");
        setSelectedCategory(null);
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
          setSearch("");
          setSelectedCategory(null);
        }
        break;
      case "Backspace":
        if (search === "" && selectedCategory) {
          setSelectedCategory(null);
        }
        break;
    }
  }, [isOpen, filteredCommands, selectedIndex, search, selectedCategory]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, selectedCategory]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={() => {
          setIsOpen(false);
          setSearch("");
          setSelectedCategory(null);
        }}
      />

      {/* Palette */}
      <div className="absolute left-1/2 top-[15%] -translate-x-1/2 w-full max-w-2xl animate-[scaleIn_0.2s_ease-out]">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {selectedCategory && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                {defaultCategories.find(c => c.id === selectedCategory)?.label}
              </span>
            )}

            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={selectedCategory ? "Filter commands..." : "Type a command or search..."}
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
              autoFocus
            />

            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                esc
              </kbd>
              <span className="text-xs text-zinc-500">to close</span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                !selectedCategory
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              All
            </button>
            {defaultCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Command List */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-zinc-500 text-sm">No commands found</p>
                <p className="text-zinc-600 text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([categoryId, commands]) => (
                <Fragment key={categoryId}>
                  <div className="px-2 py-1.5">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {defaultCategories.find(c => c.id === categoryId)?.label}
                    </span>
                  </div>
                  {commands.map((cmd, idx) => {
                    const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                          setSearch("");
                          setSelectedCategory(null);
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          isSelected
                            ? "bg-amber-500/10 border border-amber-500/20"
                            : "hover:bg-zinc-800/50 border border-transparent"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {cmd.icon}
                        </div>

                        <div className="flex-1 text-left">
                          <div className={`text-sm font-medium ${isSelected ? "text-white" : "text-zinc-300"}`}>
                            {cmd.label}
                          </div>
                          {cmd.description && (
                            <div className="text-xs text-zinc-500">{cmd.description}</div>
                          )}
                        </div>

                        {cmd.shortcut && (
                          <div className="flex items-center gap-1">
                            {cmd.shortcut.map((key, i) => (
                              <kbd
                                key={i}
                                className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 rounded border border-zinc-700"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </Fragment>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1 py-0.5 text-[10px] bg-zinc-800 rounded">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1 py-0.5 text-[10px] bg-zinc-800 rounded">↵</kbd>
                select
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-xs">Lumina F</span>
              <span className="text-zinc-600 text-xs">Command Palette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check if palette is open
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle, setIsOpen };
}
