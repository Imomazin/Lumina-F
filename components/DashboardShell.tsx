"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string;
}

interface DashboardShellProps {
  children: React.ReactNode;
  companyName?: string;
  subtitle?: string;
  lastSaved?: string;
  tabs?: NavItem[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  actions?: React.ReactNode;
}

const mainNavItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/inputs",
    label: "Inputs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: "/analysis",
    label: "Analysis",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Reports",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function DashboardShell({
  children,
  companyName,
  subtitle,
  lastSaved,
  tabs,
  activeTab,
  onTabChange,
  actions,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-zinc-800/50 bg-[#0a0a0a] transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-zinc-800/50 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rotate-45 rounded-sm flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-bold text-lg">
                <span className="text-amber-400">Lumina</span>
                <span className="text-white">F</span>
              </span>
            )}
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Tab Navigation (when provided) */}
          {tabs && tabs.length > 0 && (
            <>
              <div className={`my-4 border-t border-zinc-800/50 ${sidebarCollapsed ? "mx-2" : ""}`} />
              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
                  Views
                </p>
              )}
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                    }`}
                    title={sidebarCollapsed ? tab.label : undefined}
                  >
                    {tab.icon}
                    {!sidebarCollapsed && (
                      <span className="flex-1 text-left">{tab.label}</span>
                    )}
                    {!sidebarCollapsed && tab.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-400">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-zinc-800/50 p-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 transition-all"
          >
            <svg
              className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-zinc-800/50 bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {companyName && (
              <div>
                <h1 className="text-base font-semibold text-white flex items-center gap-2">
                  {companyName}
                  {subtitle && (
                    <span className="text-zinc-500 font-normal text-sm">• {subtitle}</span>
                  )}
                </h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-zinc-600">
                Saved {lastSaved}
              </span>
            )}
            {actions}
          </div>
        </header>

        {/* Content Area - Full Width */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Quick Stat Card Component
export function StatCard({
  label,
  value,
  change,
  changeLabel,
  variant = "default",
  size = "default",
}: {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  variant?: "default" | "success" | "warning" | "danger" | "primary";
  size?: "default" | "large";
}) {
  const variantStyles = {
    default: "border-zinc-800 bg-zinc-900/50",
    success: "border-green-500/30 bg-green-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    danger: "border-red-500/30 bg-red-500/5",
    primary: "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5",
  };

  const valueStyles = {
    default: "text-white",
    success: "text-green-400",
    warning: "text-amber-400",
    danger: "text-red-400",
    primary: "text-amber-400",
  };

  return (
    <div className={`rounded-xl border p-4 ${variantStyles[variant]}`}>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-bold ${size === "large" ? "text-2xl" : "text-xl"} ${valueStyles[variant]}`}>
        {value}
      </p>
      {(change !== undefined || changeLabel) && (
        <div className="mt-1 flex items-center gap-1.5">
          {change !== undefined && (
            <span className={`text-xs font-medium ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {change >= 0 ? "+" : ""}{change.toFixed(1)}%
            </span>
          )}
          {changeLabel && (
            <span className="text-xs text-zinc-600">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Grid Layout Helper
export function DashboardGrid({
  children,
  cols = 4,
  gap = 4,
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 2 | 3 | 4 | 5 | 6;
}) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  };

  const gapClass = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
  };

  return (
    <div className={`grid ${colsClass[cols]} ${gapClass[gap]}`}>
      {children}
    </div>
  );
}

// Panel Component
export function Panel({
  children,
  title,
  subtitle,
  actions,
  noPadding = false,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-zinc-800/50 bg-zinc-900/30 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
          <div>
            {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </div>
  );
}
