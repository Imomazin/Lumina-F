"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createDemoFinancialModel, DEMO_COMPANY_INFO } from "@/lib/demo-data";

const STORAGE_KEY = "lumina-f-financial-model";

// 3D Cube Component with gold/amber colors for Lumina F
function GoldenCube() {
  return (
    <div className="relative h-[400px] w-[400px] [perspective:1000px]">
      <div className="absolute inset-0 animate-[spin_20s_linear_infinite] [transform-style:preserve-3d]">
        {/* Front face */}
        <div
          className="absolute h-[200px] w-[200px] left-[100px] top-[100px] opacity-90"
          style={{
            background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #FFD700 100%)',
            transform: 'translateZ(100px)',
            boxShadow: 'inset 0 0 60px rgba(255, 215, 0, 0.3)',
          }}
        />
        {/* Back face */}
        <div
          className="absolute h-[200px] w-[200px] left-[100px] top-[100px] opacity-80"
          style={{
            background: 'linear-gradient(135deg, #8B6914 0%, #B8860B 50%, #DAA520 100%)',
            transform: 'rotateY(180deg) translateZ(100px)',
          }}
        />
        {/* Right face */}
        <div
          className="absolute h-[200px] w-[200px] left-[100px] top-[100px] opacity-85"
          style={{
            background: 'linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #FFC000 100%)',
            transform: 'rotateY(90deg) translateZ(100px)',
            boxShadow: 'inset 0 0 40px rgba(255, 193, 0, 0.2)',
          }}
        />
        {/* Left face */}
        <div
          className="absolute h-[200px] w-[200px] left-[100px] top-[100px] opacity-75"
          style={{
            background: 'linear-gradient(135deg, #8B6914 0%, #9B7615 50%, #B8860B 100%)',
            transform: 'rotateY(-90deg) translateZ(100px)',
          }}
        />
        {/* Top face */}
        <div
          className="absolute h-[200px] w-[200px] left-[100px] top-[100px] opacity-95"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFC000 50%, #FFB000 100%)',
            transform: 'rotateX(90deg) translateZ(100px)',
            boxShadow: 'inset 0 0 50px rgba(255, 215, 0, 0.4)',
          }}
        />
        {/* Bottom face */}
        <div
          className="absolute h-[200px] w-[200px] left-[100px] top-[100px] opacity-70"
          style={{
            background: 'linear-gradient(135deg, #6B5310 0%, #8B6914 50%, #9B7615 100%)',
            transform: 'rotateX(-90deg) translateZ(100px)',
          }}
        />
      </div>
      {/* Glow effect */}
      <div
        className="absolute inset-0 blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle at center, #FFD700 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const router = useRouter();

  const loadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      const demoModel = createDemoFinancialModel();
      const stored = {
        model: demoModel,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      // Navigate to analysis page to see outputs
      router.push("/analysis");
    } catch (error) {
      console.error("Failed to load demo:", error);
      setIsLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
              <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Lumina <span className="text-amber-400">F</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#tools"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Tools
            </a>
            <a
              href="#docs"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Docs
            </a>
            <Link
              href="/dashboard"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row items-center justify-between gap-12 py-20">
            {/* Left Content */}
            <div className="flex-1 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-6">
                Financial Intelligence
              </p>
              <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                Build winning<br />
                financials<br />
                with{" "}
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  intelligence
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-md">
                The financial modeling platform for modern enterprises.
                Discover insights, diagnose challenges, design solutions,
                decide with confidence, and deliver results.
              </p>

              {/* Email Input + CTA */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all"
                />
                <Link
                  href="/inputs"
                  className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-gray-100 transition-colors"
                >
                  Get Started
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Try Demo Button */}
              <button
                onClick={loadDemo}
                disabled={isLoadingDemo}
                className="mt-4 inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
              >
                {isLoadingDemo ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading demo...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Try Demo Instantly - See {DEMO_COMPANY_INFO.name} Analysis
                  </>
                )}
              </button>

              <p className="mt-3 text-sm text-gray-500">
                Free to start. No credit card required.
              </p>
            </div>

            {/* Right - 3D Cube */}
            <div className="flex-1 flex items-center justify-center">
              <GoldenCube />
            </div>
          </div>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      </main>

      {/* Features Section */}
      <section id="features" className="relative py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-4">
              Key Capabilities
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Enterprise-grade financial modeling
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Everything you need to build sophisticated financial models with confidence.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Multi-year forecasts",
                description: "Project revenue, costs, and cash flows up to 10 years with configurable growth assumptions.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
              },
              {
                title: "Risk adjustments",
                description: "Model scenarios with Monte Carlo simulations and sensitivity analysis.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                title: "Scenario comparison",
                description: "Compare base, bull, and bear cases side-by-side with visual analytics.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                ),
              },
              {
                title: "DCF valuation",
                description: "Calculate intrinsic value with discount cash flow models and WACC analysis.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Board-ready reports",
                description: "Generate professional PDF reports with executive summaries and detailed analysis.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                title: "Local-first privacy",
                description: "All data stays in your browser. No servers, no accounts, complete privacy.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-400/20 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 group-hover:bg-amber-400/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to transform your financial modeling?
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Join finance professionals who trust Lumina F for accurate projections and insights.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={loadDemo}
              disabled={isLoadingDemo}
              className="h-12 px-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-400/25 disabled:opacity-50"
            >
              {isLoadingDemo ? "Loading..." : "Try Live Demo"}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <Link
              href="/inputs"
              className="h-12 px-8 inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Build Your Own
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-amber-400 to-amber-600">
                <svg className="h-4 w-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-400">
                Lumina <span className="text-amber-400">F</span>
                <span className="ml-2 text-gray-600">v0.2.0</span>
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/inputs" className="text-sm text-gray-500 hover:text-white transition-colors">
                Inputs
              </Link>
              <Link href="/analysis" className="text-sm text-gray-500 hover:text-white transition-colors">
                Analysis
              </Link>
              <Link href="/reports" className="text-sm text-gray-500 hover:text-white transition-colors">
                Reports
              </Link>
            </nav>
          </div>
        </div>
      </footer>

      {/* CSS for cube animation */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotateX(-20deg) rotateY(0deg);
          }
          to {
            transform: rotateX(-20deg) rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
}
