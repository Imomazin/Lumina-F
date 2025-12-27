"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadInputs, clearInputs, formatTimestamp } from "@/lib/storage";
import { AnalysisSession } from "@/lib/schema";

type DataStatus = "not_started" | "in_progress" | "ready";

function getDataStatus(inputs: AnalysisSession | null): DataStatus {
  if (!inputs) return "not_started";
  // Check if essential fields are filled
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

function StatusBadge({ status }: { status: DataStatus }) {
  const styles = {
    not_started: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ready: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  const labels = {
    not_started: "Not Started",
    in_progress: "In Progress",
    ready: "Ready",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  primary?: boolean;
}

function ActionCard({ title, description, href, primary }: ActionCardProps) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border p-4 transition-colors ${
        primary
          ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
      }`}
    >
      <h3 className={`font-medium ${primary ? "" : "text-zinc-900 dark:text-zinc-100"}`}>
        {title}
      </h3>
      <p className={`mt-1 text-sm ${primary ? "opacity-80" : "text-zinc-500 dark:text-zinc-400"}`}>
        {description}
      </p>
    </Link>
  );
}

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
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  const status = getDataStatus(inputs);

  return (
    <div className="space-y-8">
      {/* Data Status Card */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Data Status
        </h2>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Analysis Session
              </p>
              <div className="mt-2 flex items-center gap-3">
                <StatusBadge status={status} />
                {status === "ready" && (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    All required data entered
                  </span>
                )}
                {status === "in_progress" && (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Some fields may need completion
                  </span>
                )}
                {status === "not_started" && (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    No data entered yet
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title={status === "not_started" ? "Start Inputs" : "Edit Inputs"}
            description="Enter or modify your financial data"
            href="/inputs"
            primary={status !== "ready"}
          />
          <ActionCard
            title="Run Analysis"
            description="View financial forecast and projections"
            href="/analysis"
            primary={status === "ready"}
          />
          <ActionCard
            title="View Reports"
            description="Generate printable financial reports"
            href="/reports"
          />
        </div>
      </section>

      {/* Recently Used */}
      {inputs && (
        <section>
          <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Current Session
          </h2>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  {inputs.companyName || "Unnamed Session"}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {inputs.industry}
                </p>
                {lastSaved && (
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    Last saved: {formatTimestamp(lastSaved)}
                  </p>
                )}
              </div>
              <button
                onClick={handleClearSession}
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Clear Session
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Getting Started (for empty state) */}
      {status === "not_started" && (
        <section>
          <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Getting Started
          </h2>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
            <ol className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  1
                </span>
                <span>Enter your company information and financial data</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  2
                </span>
                <span>Run the analysis to generate financial projections</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  3
                </span>
                <span>View and export your financial reports</span>
              </li>
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
