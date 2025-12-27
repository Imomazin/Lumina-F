"use client";

import Link from "next/link";
import { WelcomeModal, useOnboarding } from "@/components/ui/WelcomeModal";

const features = [
  {
    title: "Comprehensive Inputs",
    description:
      "Enter revenue, costs, investments, and financing details with full customization.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    title: "Multi-Year Projections",
    description:
      "Model up to 10 years of financial projections with growth assumptions.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    title: "Key Metrics",
    description:
      "Track EBITDA, net income, margins, and other critical financial KPIs.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "Visual Analytics",
    description:
      "Interactive charts for revenue trends, profit breakdown, and margin analysis.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
        />
      </svg>
    ),
  },
  {
    title: "Board-Ready Reports",
    description:
      "Generate professional reports with executive summaries and detailed tables.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    title: "Local-First Privacy",
    description:
      "All data stays in your browser. No servers, no accounts, complete privacy.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
];

const steps = [
  {
    step: 1,
    title: "Enter Your Data",
    description:
      "Input company details, revenue projections, costs, and financing assumptions.",
  },
  {
    step: 2,
    title: "Review Analysis",
    description:
      "See calculated metrics, growth trends, and visual analytics automatically.",
  },
  {
    step: 3,
    title: "Export Reports",
    description:
      "Generate professional financial reports ready for stakeholders.",
  },
];

export default function LandingPage() {
  const { showWelcome, completeOnboarding } = useOnboarding();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showWelcome && <WelcomeModal onClose={completeOnboarding} />}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            <span className="text-primary">Lumina</span>{" "}
            <span className="text-accent">F</span>
          </span>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              How It Works
            </a>
          </nav>
          <Link
            href="/inputs"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Open App
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--primary)_0%,transparent_25%)] opacity-5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,var(--accent)_0%,transparent_25%)] opacity-5" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-display text-foreground">
              Professional Financial Analysis,{" "}
              <span className="text-primary">Simplified</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-foreground-muted">
              Model multi-year projections, calculate key metrics, and generate
              board-ready reports — all in your browser with complete privacy.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/inputs"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30"
              >
                Start Your Analysis
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                View Dashboard
              </Link>
            </div>
            <p className="mt-6 text-sm text-foreground-muted">
              No sign-up required. Your data never leaves your device.
            </p>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="border-b border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-headline text-foreground">
              Everything You Need for Financial Modeling
            </h2>
            <p className="mt-4 text-foreground-muted">
              A complete toolkit for financial analysis without the complexity of
              enterprise software.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-foreground-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="border-b border-border bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-headline text-foreground">How It Works</h2>
            <p className="mt-4 text-foreground-muted">
              Get from raw data to professional reports in three simple steps.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                {item.step < 3 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                )}
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-foreground-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/inputs"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Get Started Now
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-foreground-muted">
              Built for finance professionals who value{" "}
              <span className="font-medium text-foreground">simplicity</span>,{" "}
              <span className="font-medium text-foreground">privacy</span>, and{" "}
              <span className="font-medium text-foreground">speed</span>.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-foreground-muted">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                100% Browser-based
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                No Data Collection
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Works Offline
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Free to Use
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="text-sm font-medium text-foreground-muted">
            <span className="text-primary">Lumina</span>{" "}
            <span className="text-accent">F</span>
            <span className="ml-2 text-foreground-muted/50">v0.1.0</span>
          </span>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/inputs"
              className="text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              Inputs
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
