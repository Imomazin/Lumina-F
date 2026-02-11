"use client";

import { useState, useEffect } from "react";
import { FinancialModel } from "@/lib/models/financial-model";

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: 'create' | 'update' | 'delete' | 'export' | 'scenario_change' | 'assumption_change';
  category: string;
  field: string;
  oldValue: string | number | null;
  newValue: string | number | null;
  user: string;
  reason?: string;
}

interface ModelVersion {
  id: string;
  versionNumber: number;
  timestamp: Date;
  label: string;
  description: string;
  modelSnapshot: string; // JSON stringified model
  user: string;
}

interface GovernanceAuditProps {
  model: FinancialModel | null;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion?: (version: ModelVersion) => void;
}

const AUDIT_STORAGE_KEY = "lumina-f-audit-log";
const VERSION_STORAGE_KEY = "lumina-f-versions";

// Utility functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getAuditLog(): AuditEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
  if (!stored) return [];
  try {
    const entries = JSON.parse(stored);
    return entries.map((e: AuditEntry) => ({ ...e, timestamp: new Date(e.timestamp) }));
  } catch {
    return [];
  }
}

function saveAuditLog(entries: AuditEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(entries));
}

function getVersions(): ModelVersion[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(VERSION_STORAGE_KEY);
  if (!stored) return [];
  try {
    const versions = JSON.parse(stored);
    return versions.map((v: ModelVersion) => ({ ...v, timestamp: new Date(v.timestamp) }));
  } catch {
    return [];
  }
}

function saveVersions(versions: ModelVersion[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versions));
}

// Add audit entry helper
export function addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  const entries = getAuditLog();
  const newEntry: AuditEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date(),
  };
  entries.unshift(newEntry);
  // Keep last 500 entries
  saveAuditLog(entries.slice(0, 500));
}

// Create version helper
export function createVersion(model: FinancialModel, label: string, description: string) {
  const versions = getVersions();
  const versionNumber = versions.length + 1;
  const newVersion: ModelVersion = {
    id: generateId(),
    versionNumber,
    timestamp: new Date(),
    label: label || `Version ${versionNumber}`,
    description,
    modelSnapshot: JSON.stringify(model),
    user: "Current User",
  };
  versions.unshift(newVersion);
  // Keep last 50 versions
  saveVersions(versions.slice(0, 50));

  addAuditEntry({
    action: 'create',
    category: 'Version',
    field: 'model',
    oldValue: null,
    newValue: newVersion.label,
    user: "Current User",
    reason: description,
  });

  return newVersion;
}

// Action icons
const actionIcons: Record<AuditEntry['action'], { icon: string; color: string }> = {
  create: { icon: '➕', color: 'text-green-400' },
  update: { icon: '✏️', color: 'text-blue-400' },
  delete: { icon: '🗑️', color: 'text-red-400' },
  export: { icon: '📤', color: 'text-purple-400' },
  scenario_change: { icon: '🔄', color: 'text-amber-400' },
  assumption_change: { icon: '⚙️', color: 'text-cyan-400' },
};

// Audit Log Panel
function AuditLogPanel({ entries }: { entries: AuditEntry[] }) {
  const [filter, setFilter] = useState<AuditEntry['action'] | 'all'>('all');

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => e.action === filter);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'create', 'update', 'delete', 'export', 'scenario_change', 'assumption_change'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as AuditEntry['action'] | 'all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === f
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white bg-zinc-800'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No audit entries found
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const actionConfig = actionIcons[entry.action];
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
              >
                <span className={`text-lg ${actionConfig.color}`}>{actionConfig.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white capitalize">
                      {entry.action.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {entry.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    <span className="text-amber-400">{entry.category}</span>
                    {entry.field && <span> → {entry.field}</span>}
                  </div>
                  {(entry.oldValue !== null || entry.newValue !== null) && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {entry.oldValue !== null && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                          {String(entry.oldValue)}
                        </span>
                      )}
                      {entry.oldValue !== null && entry.newValue !== null && (
                        <span className="text-zinc-500">→</span>
                      )}
                      {entry.newValue !== null && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                          {String(entry.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                  {entry.reason && (
                    <div className="text-xs text-zinc-500 mt-1 italic">
                      "{entry.reason}"
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Version History Panel
function VersionHistoryPanel({
  versions,
  onRestore
}: {
  versions: ModelVersion[];
  onRestore: (version: ModelVersion) => void;
}) {
  const [selectedVersion, setSelectedVersion] = useState<ModelVersion | null>(null);

  return (
    <div className="space-y-4">
      {versions.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <div className="text-4xl mb-2">📦</div>
          <p>No saved versions yet</p>
          <p className="text-xs mt-1">Create a version to save your model state</p>
        </div>
      ) : (
        <div className="space-y-2">
          {versions.map((version, idx) => (
            <div
              key={version.id}
              onClick={() => setSelectedVersion(selectedVersion?.id === version.id ? null : version)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedVersion?.id === version.id
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-amber-500 text-black' : 'bg-zinc-700 text-zinc-300'
                  }`}>
                    {version.versionNumber}
                  </div>
                  <div>
                    <div className="font-medium text-white">{version.label}</div>
                    <div className="text-xs text-zinc-500">
                      {version.timestamp.toLocaleString()} • {version.user}
                    </div>
                  </div>
                </div>
                {idx === 0 && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Current
                  </span>
                )}
              </div>

              {version.description && (
                <p className="text-sm text-zinc-400 mt-2 pl-11">{version.description}</p>
              )}

              {selectedVersion?.id === version.id && idx > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-700 pl-11">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(version);
                    }}
                    className="px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    Restore This Version
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Create Version Modal
function CreateVersionModal({
  isOpen,
  onClose,
  onCreate
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (label: string, description: string) => void;
}) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md mx-4 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Save Version</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Version Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Q4 Forecast Final"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What changes were made in this version?"
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onCreate(label, description);
              setLabel('');
              setDescription('');
              onClose();
            }}
            className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
          >
            Save Version
          </button>
        </div>
      </div>
    </div>
  );
}

export function GovernanceAudit({ model, isOpen, onClose, onRestoreVersion }: GovernanceAuditProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'versions'>('audit');
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [showCreateVersion, setShowCreateVersion] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuditEntries(getAuditLog());
      setVersions(getVersions());
    }
  }, [isOpen]);

  const handleCreateVersion = (label: string, description: string) => {
    if (model) {
      const newVersion = createVersion(model, label, description);
      setVersions(getVersions());
      setAuditEntries(getAuditLog());
    }
  };

  const handleRestore = (version: ModelVersion) => {
    if (onRestoreVersion) {
      onRestoreVersion(version);
      addAuditEntry({
        action: 'update',
        category: 'Version',
        field: 'model',
        oldValue: 'current',
        newValue: version.label,
        user: 'Current User',
        reason: `Restored from version ${version.versionNumber}`,
      });
      onClose();
    }
  };

  const handleClearAuditLog = () => {
    if (confirm('Are you sure you want to clear the audit log? This cannot be undone.')) {
      saveAuditLog([]);
      setAuditEntries([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">Governance & Audit</h2>
            <p className="text-sm text-zinc-400 mt-1">Track changes and manage model versions</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'audit'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📋 Audit Log
            {auditEntries.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-zinc-700 rounded-full text-xs">
                {auditEntries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'versions'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📦 Version History
            {versions.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-zinc-700 rounded-full text-xs">
                {versions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'audit' ? (
            <AuditLogPanel entries={auditEntries} />
          ) : (
            <VersionHistoryPanel versions={versions} onRestore={handleRestore} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800 bg-zinc-900">
          <div>
            {activeTab === 'audit' && auditEntries.length > 0 && (
              <button
                onClick={handleClearAuditLog}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear Audit Log
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {activeTab === 'versions' && model && (
              <button
                onClick={() => setShowCreateVersion(true)}
                className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2"
              >
                <span>💾</span>
                Save Current Version
              </button>
            )}
          </div>
        </div>
      </div>

      <CreateVersionModal
        isOpen={showCreateVersion}
        onClose={() => setShowCreateVersion(false)}
        onCreate={handleCreateVersion}
      />
    </div>
  );
}

// Export hook for easy audit tracking
export function useAuditTracking() {
  return {
    trackChange: (
      action: AuditEntry['action'],
      category: string,
      field: string,
      oldValue: string | number | null,
      newValue: string | number | null,
      reason?: string
    ) => {
      addAuditEntry({
        action,
        category,
        field,
        oldValue,
        newValue,
        user: 'Current User',
        reason,
      });
    },
    saveVersion: createVersion,
  };
}
