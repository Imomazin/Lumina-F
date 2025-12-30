"use client";

import { useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import { useRouter } from "next/navigation";

// ============================================================================
// TYPES
// ============================================================================

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
}

interface CommandGroup {
  category: string;
  commands: Command[];
}

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  dashboard: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  inputs: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  analysis: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  reports: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  export: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  help: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  theme: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  new: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
};

// ============================================================================
// COMMAND PALETTE COMPONENT
// ============================================================================

interface CommandPaletteProps {
  additionalCommands?: Command[];
}

export function CommandPalette({ additionalCommands = [] }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Default commands
  const defaultCommands: Command[] = useMemo(() => [
    {
      id: "nav-dashboard",
      title: "Go to Dashboard",
      subtitle: "View your financial overview",
      icon: Icons.dashboard,
      category: "Navigation",
      action: () => router.push("/dashboard"),
      keywords: ["home", "main", "overview"],
    },
    {
      id: "nav-inputs",
      title: "Go to Inputs",
      subtitle: "Edit financial assumptions",
      icon: Icons.inputs,
      category: "Navigation",
      action: () => router.push("/inputs"),
      keywords: ["data", "form", "enter"],
    },
    {
      id: "nav-analysis",
      title: "Go to Analysis",
      subtitle: "View projections and metrics",
      icon: Icons.analysis,
      category: "Navigation",
      action: () => router.push("/analysis"),
      keywords: ["charts", "metrics", "forecast"],
    },
    {
      id: "nav-reports",
      title: "Go to Reports",
      subtitle: "Generate and view reports",
      icon: Icons.reports,
      category: "Navigation",
      action: () => router.push("/reports"),
      keywords: ["pdf", "document", "output"],
    },
    {
      id: "action-new",
      title: "New Project",
      subtitle: "Create a new financial model",
      icon: Icons.new,
      category: "Actions",
      action: () => router.push("/inputs?new=true"),
      keywords: ["create", "start", "fresh"],
    },
    {
      id: "action-export-csv",
      title: "Export to CSV",
      subtitle: "Download data as CSV file",
      icon: Icons.export,
      category: "Actions",
      action: () => {
        const event = new CustomEvent("exportCSV");
        window.dispatchEvent(event);
      },
      keywords: ["download", "spreadsheet"],
    },
    {
      id: "action-export-excel",
      title: "Export to Excel",
      subtitle: "Download as Excel file",
      icon: Icons.export,
      category: "Actions",
      action: () => {
        const event = new CustomEvent("exportExcel");
        window.dispatchEvent(event);
      },
      keywords: ["download", "xlsx"],
    },
    {
      id: "settings-theme",
      title: "Toggle Dark Mode",
      subtitle: "Switch between light and dark themes",
      icon: Icons.theme,
      category: "Settings",
      action: () => {
        const event = new CustomEvent("toggleTheme");
        window.dispatchEvent(event);
      },
      keywords: ["dark", "light", "appearance"],
    },
    {
      id: "help-shortcuts",
      title: "Keyboard Shortcuts",
      subtitle: "View all keyboard shortcuts",
      icon: Icons.help,
      category: "Help",
      action: () => {
        const event = new CustomEvent("openShortcutsModal");
        window.dispatchEvent(event);
      },
      keywords: ["keys", "hotkeys"],
    },
    {
      id: "help-docs",
      title: "Documentation",
      subtitle: "Open user guide",
      icon: Icons.help,
      category: "Help",
      action: () => window.open("/docs", "_blank"),
      keywords: ["guide", "manual", "learn"],
    },
  ], [router]);

  const allCommands = useMemo(() =>
    [...defaultCommands, ...additionalCommands],
    [defaultCommands, additionalCommands]
  );

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return allCommands;

    const lowerQuery = query.toLowerCase();
    return allCommands.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(lowerQuery);
      const matchSubtitle = cmd.subtitle?.toLowerCase().includes(lowerQuery);
      const matchKeywords = cmd.keywords?.some((k) => k.includes(lowerQuery));
      const matchCategory = cmd.category.toLowerCase().includes(lowerQuery);
      return matchTitle || matchSubtitle || matchKeywords || matchCategory;
    });
  }, [allCommands, query]);

  // Group commands by category
  const groupedCommands = useMemo((): CommandGroup[] => {
    const groups: Record<string, Command[]> = {};
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    }
    return Object.entries(groups).map(([category, commands]) => ({
      category,
      commands,
    }));
  }, [filteredCommands]);

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() =>
    groupedCommands.flatMap((g) => g.commands),
    [groupedCommands]
  );

  // Open palette on Ctrl+K
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("openCommandPalette", handleOpen);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("openCommandPalette", handleOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : flatCommands.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].action();
          setIsOpen(false);
          setQuery("");
        }
        break;
      case "Escape":
        setIsOpen(false);
        setQuery("");
        break;
    }
  }, [flatCommands, selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => {
          setIsOpen(false);
          setQuery("");
        }}
      />

      {/* Palette */}
      <div className="fixed inset-0 flex items-start justify-center z-50 pt-[15vh] px-4">
        <div className="w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 border-b border-border">
            <svg
              className="w-5 h-5 text-foreground-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 px-4 py-4 bg-transparent text-foreground placeholder-foreground-muted outline-none"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-surface-2 border border-border rounded text-foreground-muted">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {groupedCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-foreground-muted">
                No commands found
              </div>
            ) : (
              groupedCommands.map((group) => (
                <div key={group.category} className="mb-4 last:mb-0">
                  <div className="px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    {group.category}
                  </div>
                  {group.commands.map((cmd) => {
                    const globalIndex = flatCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                          setQuery("");
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "text-foreground hover:bg-surface-2"
                        }`}
                      >
                        <span className={isSelected ? "text-white" : "text-foreground-muted"}>
                          {cmd.icon}
                        </span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{cmd.title}</div>
                          {cmd.subtitle && (
                            <div className={`text-xs ${isSelected ? "text-white/70" : "text-foreground-muted"}`}>
                              {cmd.subtitle}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2">
            <div className="flex items-center gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded">Enter</kbd>
                to select
              </span>
            </div>
            <span className="text-xs text-foreground-muted">
              {filteredCommands.length} commands
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
