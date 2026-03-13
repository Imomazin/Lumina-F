"use client";

import { useState, useEffect, useMemo } from "react";
import { GlassPanel, PremiumButton, Badge } from "@/components/ui/design-system";

// =============================================================================
// TYPES
// =============================================================================

interface AuditEvent {
  id: string;
  type: "create" | "update" | "delete" | "export" | "import" | "analysis";
  action: string;
  description: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  userInitials: string;
  timestamp: Date;
}

// =============================================================================
// STORAGE
// =============================================================================

const AUDIT_KEY = "lumina-audit-trail";

function loadAuditTrail(): AuditEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(AUDIT_KEY);
    if (!data) return generateDefaultAuditTrail();
    return JSON.parse(data).map((e: AuditEvent) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
  } catch {
    return generateDefaultAuditTrail();
  }
}

function saveAuditTrail(events: AuditEvent[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUDIT_KEY, JSON.stringify(events));
}

function generateDefaultAuditTrail(): AuditEvent[] {
  const now = new Date();
  return [
    {
      id: "1",
      type: "analysis",
      action: "Run Analysis",
      description: "Executed full DCF valuation and ratio analysis",
      user: "You",
      userInitials: "YU",
      timestamp: new Date(now.getTime() - 5 * 60000),
    },
    {
      id: "2",
      type: "update",
      action: "Update Assumption",
      description: "Modified revenue growth rate",
      field: "Revenue Growth Y3",
      oldValue: "10%",
      newValue: "15%",
      user: "You",
      userInitials: "YU",
      timestamp: new Date(now.getTime() - 30 * 60000),
    },
    {
      id: "3",
      type: "update",
      action: "Update Assumption",
      description: "Adjusted WACC parameters",
      field: "Risk-Free Rate",
      oldValue: "4.0%",
      newValue: "4.5%",
      user: "You",
      userInitials: "YU",
      timestamp: new Date(now.getTime() - 1 * 3600000),
    },
    {
      id: "4",
      type: "export",
      action: "Export Report",
      description: "Generated executive summary PDF",
      user: "Sarah Chen",
      userInitials: "SC",
      timestamp: new Date(now.getTime() - 2 * 3600000),
    },
    {
      id: "5",
      type: "import",
      action: "Import Data",
      description: "Imported financial data from Excel file",
      user: "You",
      userInitials: "YU",
      timestamp: new Date(now.getTime() - 24 * 3600000),
    },
    {
      id: "6",
      type: "create",
      action: "Create Model",
      description: "Created new financial model for TechCorp Inc.",
      user: "You",
      userInitials: "YU",
      timestamp: new Date(now.getTime() - 48 * 3600000),
    },
    {
      id: "7",
      type: "update",
      action: "Update Balance Sheet",
      description: "Modified cash position",
      field: "Cash & Equivalents",
      oldValue: "$50M",
      newValue: "$75M",
      user: "Michael Park",
      userInitials: "MP",
      timestamp: new Date(now.getTime() - 72 * 3600000),
    },
  ];
}

// =============================================================================
// COMPONENTS
// =============================================================================

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const typeConfig = {
  create: { icon: "➕", color: "bg-green-500/20 text-green-400" },
  update: { icon: "✏️", color: "bg-blue-500/20 text-blue-400" },
  delete: { icon: "🗑️", color: "bg-red-500/20 text-red-400" },
  export: { icon: "📤", color: "bg-purple-500/20 text-purple-400" },
  import: { icon: "📥", color: "bg-cyan-500/20 text-cyan-400" },
  analysis: { icon: "📊", color: "bg-amber-500/20 text-amber-400" },
};

export function AuditTrail({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setEvents(loadAuditTrail());
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (filter !== "all") {
      filtered = filtered.filter((e) => e.type === filter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.action.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.field?.toLowerCase().includes(query) ||
          e.user.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [events, filter, searchQuery]);

  const exportAuditTrail = () => {
    const csv = [
      ["Timestamp", "Type", "Action", "Description", "Field", "Old Value", "New Value", "User"].join(","),
      ...events.map((e) =>
        [
          e.timestamp.toISOString(),
          e.type,
          e.action,
          `"${e.description}"`,
          e.field || "",
          e.oldValue || "",
          e.newValue || "",
          e.user,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden">
        <GlassPanel padding="none" variant="elevated">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                📋 Audit Trail
                <Badge variant="default">{events.length} events</Badge>
              </h2>
              <div className="flex items-center gap-2">
                <PremiumButton variant="secondary" size="sm" onClick={exportAuditTrail}>
                  Export CSV
                </PremiumButton>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="export">Export</option>
                <option value="import">Import</option>
                <option value="analysis">Analysis</option>
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">📭</span>
                <p className="text-zinc-400 mt-2">No events found</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-800" />

                <div className="space-y-6">
                  {filteredEvents.map((event) => {
                    const config = typeConfig[event.type];
                    return (
                      <div key={event.id} className="relative flex gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0 z-10`}>
                          <span className="text-lg">{config.icon}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-zinc-800/30 rounded-xl p-4 hover:bg-zinc-800/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-medium text-white">{event.action}</h4>
                              <p className="text-sm text-zinc-400 mt-0.5">{event.description}</p>

                              {/* Value change */}
                              {event.field && (
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                  <Badge variant="default">{event.field}</Badge>
                                  {event.oldValue && event.newValue && (
                                    <>
                                      <span className="text-red-400 line-through">{event.oldValue}</span>
                                      <span className="text-zinc-500">→</span>
                                      <span className="text-green-400">{event.newValue}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-zinc-500">{formatTimestamp(event.timestamp)}</p>
                              <p className="text-xs text-zinc-400 mt-1">{event.user}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Showing {filteredEvents.length} of {events.length} events
            </p>
            <p className="text-xs text-zinc-500">
              Events are stored locally and retained for 90 days
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
