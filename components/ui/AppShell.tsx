"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandPalette } from "./CommandPalette";
import { OnboardingWizard, useOnboarding } from "./OnboardingWizard";
import { KeyboardShortcutsModal, useKeyboardShortcuts } from "./KeyboardShortcuts";
import { NotificationCenter } from "./NotificationCenter";

interface AppShellProps {
  children: ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "danger" | "new";
  children?: NavItem[];
}

const primaryNav: NavItem[] = [
  {
    id: "command",
    label: "Command Centre",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: "model",
    label: "Model Builder",
    href: "/inputs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    id: "scenarios",
    label: "Scenario Lab",
    href: "/analysis?view=scenarios",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: "analysis",
    label: "Analysis",
    href: "/analysis",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    href: "/reports",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const secondaryNav: NavItem[] = [
  {
    id: "variance",
    label: "Variance",
    href: "/dashboard?view=variance",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    id: "capital",
    label: "Capital Engine",
    href: "/dashboard?view=capital",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: "decisions",
    label: "Decisions",
    href: "/dashboard?view=decisions",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    badge: "NEW",
    badgeVariant: "new",
  },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { showOnboarding, setShowOnboarding, resetOnboarding } = useOnboarding();
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

  // Check for Cmd+K hint
  const [showCmdKHint, setShowCmdKHint] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowCmdKHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return pathname === href.split("?")[0];
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const NavLink = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        className={`
          group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
          transition-all duration-200 ease-out
          ${active
            ? "bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-white border border-amber-500/20"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }
        `}
      >
        {/* Active indicator */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full" />
        )}

        {/* Icon */}
        <span className={`flex-shrink-0 transition-colors ${active ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"}`}>
          {item.icon}
        </span>

        {/* Label */}
        {!collapsed && (
          <span className="flex-1 text-sm font-medium truncate">
            {item.label}
          </span>
        )}

        {/* Badge */}
        {!collapsed && item.badge && (
          <span className={`
            px-1.5 py-0.5 text-[10px] font-bold uppercase rounded
            ${item.badgeVariant === "new"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black"
              : item.badgeVariant === "success"
              ? "bg-green-500/20 text-green-400"
              : item.badgeVariant === "warning"
              ? "bg-amber-500/20 text-amber-400"
              : item.badgeVariant === "danger"
              ? "bg-red-500/20 text-red-400"
              : "bg-zinc-700 text-zinc-300"
            }
          `}>
            {item.badge}
          </span>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="
            absolute left-full ml-2 px-2 py-1 rounded-lg
            bg-zinc-800 border border-zinc-700 text-white text-xs font-medium
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 whitespace-nowrap z-50
            shadow-xl
          ">
            {item.label}
            {item.badge && (
              <span className="ml-2 text-amber-400">{item.badge}</span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-40
          bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800
          transition-all duration-300 ease-out
          ${sidebarCollapsed ? "w-[68px]" : "w-[260px]"}
          ${showMobileNav ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-zinc-800 ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Lumina F</h1>
              <p className="text-[10px] text-zinc-500 font-medium">Financial Intelligence</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Primary Navigation */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Platform
              </p>
            )}
            {primaryNav.map(item => (
              <NavLink key={item.id} item={item} collapsed={sidebarCollapsed} />
            ))}
          </div>

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Advanced
              </p>
            )}
            {secondaryNav.map(item => (
              <NavLink key={item.id} item={item} collapsed={sidebarCollapsed} />
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-zinc-800 p-3 space-y-2">
          {/* Command palette hint */}
          {!sidebarCollapsed && showCmdKHint && (
            <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-pulse">
              <p className="text-xs text-amber-400 flex items-center gap-2">
                Press
                <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-800 rounded">Cmd</kbd>
                +
                <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-800 rounded">K</kbd>
                for quick actions
              </p>
            </div>
          )}

          {/* Help & Settings */}
          <button
            onClick={resetOnboarding}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!sidebarCollapsed && <span className="text-sm">Help & Tour</span>}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile nav overlay */}
      {showMobileNav && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowMobileNav(false)}
        />
      )}

      {/* Main content */}
      <main
        className={`
          flex-1 min-h-screen transition-all duration-300
          ${sidebarCollapsed ? "md:ml-[68px]" : "md:ml-[260px]"}
        `}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileNav(true)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search / Command palette trigger */}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all w-72"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm flex-1 text-left">Search or jump to...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded">Cmd K</kbd>
            </button>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Keyboard shortcuts */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Keyboard shortcuts (Cmd+/)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors relative"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              </button>

              {/* Profile */}
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">U</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Global components */}
      <CommandPalette />
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {}}
      />
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
