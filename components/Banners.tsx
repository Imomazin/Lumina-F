"use client";

import { useState } from "react";
import Link from "next/link";

// Dismissible promotional banner
export function PromoBanner({
  onDismiss,
  variant = "default"
}: {
  onDismiss?: () => void;
  variant?: "default" | "success" | "warning" | "info";
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const variants = {
    default: "from-amber-500/20 via-orange-500/20 to-red-500/20 border-amber-500/30",
    success: "from-green-500/20 via-emerald-500/20 to-teal-500/20 border-green-500/30",
    warning: "from-yellow-500/20 via-orange-500/20 to-amber-500/20 border-yellow-500/30",
    info: "from-blue-500/20 via-cyan-500/20 to-teal-500/20 border-blue-500/30",
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${variants[variant]} border-b backdrop-blur-sm`}>
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-4 -top-4 w-24 h-24 bg-amber-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute right-1/4 -bottom-4 w-32 h-32 bg-orange-500 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute right-10 top-0 w-20 h-20 bg-red-500 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-white">
                <span className="font-bold text-amber-400">NEW:</span> AI-Powered Financial Analysis is here!
              </p>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Get instant insights, DCF valuations, and 50+ financial metrics with our intelligent assistant.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/analysis"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
            >
              Try Now
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button
              onClick={handleDismiss}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats banner for dashboard/analysis
export function StatsBanner({
  stats
}: {
  stats: Array<{ label: string; value: string; change?: string; positive?: boolean }>
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-700/50">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(to right, #fbbf24 1px, transparent 1px), linear-gradient(to bottom, #fbbf24 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-400">{stat.label}</p>
              {stat.change && (
                <p className={`text-xs font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.positive ? '↑' : '↓'} {stat.change}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Feature highlight banner
export function FeatureBanner({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  gradient = "amber",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  gradient?: "amber" | "blue" | "green" | "purple";
}) {
  const gradients = {
    amber: "from-amber-600 via-orange-600 to-red-600",
    blue: "from-blue-600 via-cyan-600 to-teal-600",
    green: "from-green-600 via-emerald-600 to-teal-600",
    purple: "from-purple-600 via-pink-600 to-red-600",
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${gradients[gradient]}`}>
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-20">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
          <circle cx="80" cy="20" r="40" fill="white" opacity="0.3" />
          <circle cx="100" cy="60" r="50" fill="white" opacity="0.2" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-white/80">{description}</p>
            </div>
          </div>
          {(actionLabel && (actionHref || onAction)) && (
            actionHref ? (
              <Link
                href={actionHref}
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                {actionLabel}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <button
                onClick={onAction}
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                {actionLabel}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Quick actions banner
export function QuickActionsBanner({
  title,
  actions
}: {
  title: string;
  actions: Array<{ label: string; icon: React.ReactNode; href?: string; onClick?: () => void; highlight?: boolean }>;
}) {
  return (
    <div className="bg-gradient-to-r from-zinc-900 via-zinc-800/50 to-zinc-900 border-b border-zinc-700/50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <div className="flex items-center gap-2">
            {actions.map((action, idx) => {
              const classes = action.highlight
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white";

              const content = (
                <>
                  {action.icon}
                  <span className="hidden sm:inline">{action.label}</span>
                </>
              );

              return action.href ? (
                <Link
                  key={idx}
                  href={action.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${classes}`}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${classes}`}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo CTA banner
export function DemoBanner({ onLoadDemo, isLoading }: { onLoadDemo: () => void; isLoading?: boolean }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
      {/* Animated stars */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 animate-bounce">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                See Lumina F in action with real data!
              </p>
              <p className="text-xs text-white/70 hidden sm:block">
                Load our demo company (TechVentures Inc.) to explore all features instantly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLoadDemo}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-purple-600 hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Try Demo
                </>
              )}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tip banner
export function TipBanner({ tip, onDismiss }: { tip: string; onDismiss?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border-b border-blue-500/20">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p className="text-sm text-zinc-300">
              <span className="font-medium text-blue-400">Tip:</span> {tip}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
