"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadInputs, clearInputs, formatTimestamp } from "@/lib/storage";
import { AnalysisSession } from "@/lib/schema";
import { Card, CardContent, CardHeader, Button, Badge } from "@/components/ui";

type DataStatus = "not_started" | "in_progress" | "ready";

function getDataStatus(inputs: AnalysisSession | null): DataStatus {
  if (!inputs) return "not_started";
  if (
    inputs.companyName &&
    inputs.currentRevenue > 0 &&
    inputs.currentCOGS >= 0 &&
    inputs.currentOpex >= 0
  ) {
    return "ready";
  }
  return "in_progress";
}

const statusConfig: Record<
  DataStatus,
  { label: string; variant: "default" | "warning" | "success"; message: string }
> = {
  not_started: { label: "Not Started", variant: "default", message: "No data entered yet" },
  in_progress: { label: "In Progress", variant: "warning", message: "Some fields may need completion" },
  ready: { label: "Ready", variant: "success", message: "All required data entered" },
};

export function DashboardView() {
  const router = useRouter();
  const [inputs, setInputs] = useState<AnalysisSession | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = loadInputs();
    if (stored) {
      setInputs(stored.data);
      setLastSaved(stored.lastSaved);
    }
    setIsLoaded(true);
  }, []);

  const handleClearSession = () => {
    clearInputs();
    setInputs(null);
    setLastSaved(null);
    router.push("/inputs");
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-foreground-muted">Loading...</p>
      </div>
    );
  }

  const status = getDataStatus(inputs);
  const config = statusConfig[status];

  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Data Status</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {config.label}
                </p>
                <p className="mt-1 text-sm text-foreground-muted">
                  {config.message}
                </p>
              </div>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-foreground-muted">Company</p>
            <p className="mt-1 text-xl font-semibold text-foreground truncate">
              {inputs?.companyName || "—"}
            </p>
            <p className="mt-1 text-sm text-foreground-muted">
              {inputs?.industry || "No industry set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-foreground-muted">Last Saved</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {lastSaved ? formatTimestamp(lastSaved) : "—"}
            </p>
            <p className="mt-1 text-sm text-foreground-muted">
              {inputs ? `${inputs.yearsForward} year forecast` : "No session"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-section text-foreground">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/inputs"
              className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="mt-4 font-medium text-foreground group-hover:text-primary transition-colors">
                {status === "not_started" ? "Start Inputs" : "Edit Inputs"}
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Enter or modify your financial data
              </p>
            </Link>

            <Link
              href="/analysis"
              className={`group block rounded-xl border border-border bg-surface p-5 transition-all ${
                status === "ready"
                  ? "hover:border-primary hover:shadow-md"
                  : "opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-4 font-medium text-foreground group-hover:text-primary transition-colors">
                Run Analysis
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">
                View financial forecast and projections
              </p>
            </Link>

            <Link
              href="/reports"
              className={`group block rounded-xl border border-border bg-surface p-5 transition-all ${
                status === "ready"
                  ? "hover:border-primary hover:shadow-md"
                  : "opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 font-medium text-foreground group-hover:text-primary transition-colors">
                View Reports
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Generate printable financial reports
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Current Session */}
      {inputs && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-section text-foreground">Current Session</h2>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearSession}
              >
                Clear Session
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-sm text-foreground-muted">Industry</dt>
                <dd className="mt-1 font-medium text-foreground">{inputs.industry}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted">Currency</dt>
                <dd className="mt-1 font-medium text-foreground">{inputs.currency}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted">Start Year</dt>
                <dd className="mt-1 font-medium text-foreground">{inputs.startYear}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted">Forecast Horizon</dt>
                <dd className="mt-1 font-medium text-foreground">{inputs.yearsForward} years</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {status === "not_started" && (
        <Card className="bg-surface-2 border-dashed">
          <CardHeader>
            <h2 className="text-section text-foreground">Getting Started</h2>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {[
                "Enter your company information and financial data",
                "Run the analysis to generate financial projections",
                "View and export your financial reports",
              ].map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {idx + 1}
                  </span>
                  <span className="pt-1 text-foreground-muted">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
