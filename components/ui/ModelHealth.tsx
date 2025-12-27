"use client";

import { AnalysisSession, ConfidenceLevel } from "@/lib/schema";

interface ModelHealthProps {
  inputs: AnalysisSession;
  className?: string;
}

interface HealthMetrics {
  totalAssumptions: number;
  grounded: number;
  reasoned: number;
  exploratory: number;
  completeness: number;
  overallHealth: "strong" | "moderate" | "review";
}

function calculateHealth(inputs: AnalysisSession): HealthMetrics {
  const meta = inputs.assumptionMeta;

  // Count by confidence level
  const confidenceCounts: Record<ConfidenceLevel, number> = {
    grounded: 0,
    reasoned: 0,
    exploratory: 0,
  };

  if (meta) {
    Object.values(meta).forEach((m) => {
      if (m?.confidence) {
        confidenceCounts[m.confidence]++;
      }
    });
  }

  const totalAssumptions = 4; // Four main assumption categories
  const totalConfidenceSet = confidenceCounts.grounded + confidenceCounts.reasoned + confidenceCounts.exploratory;

  // Check completeness (all required fields filled)
  let filledFields = 0;
  if (inputs.companyName) filledFields++;
  if (inputs.currentRevenue > 0) filledFields++;
  if (inputs.revenueGrowthAssumption >= 0) filledFields++;
  if (inputs.currentCOGS >= 0) filledFields++;
  if (inputs.currentOpex >= 0) filledFields++;

  const completeness = Math.round((filledFields / 5) * 100);

  // Calculate overall health
  let overallHealth: "strong" | "moderate" | "review" = "moderate";
  if (confidenceCounts.grounded >= 2 && completeness >= 80) {
    overallHealth = "strong";
  } else if (confidenceCounts.exploratory >= 3 || completeness < 50) {
    overallHealth = "review";
  }

  return {
    totalAssumptions,
    grounded: confidenceCounts.grounded,
    reasoned: confidenceCounts.reasoned,
    exploratory: confidenceCounts.exploratory,
    completeness,
    overallHealth,
  };
}

const healthColors = {
  strong: { bg: "bg-success/10", text: "text-success", label: "Strong" },
  moderate: { bg: "bg-primary/10", text: "text-primary", label: "Moderate" },
  review: { bg: "bg-warning/10", text: "text-warning", label: "Needs Review" },
};

export function ModelHealth({ inputs, className = "" }: ModelHealthProps) {
  const health = calculateHealth(inputs);
  const colors = healthColors[health.overallHealth];

  return (
    <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Model Profile</h3>
        <span className={`rounded-md px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
          {colors.label}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground-muted">Completeness</span>
            <span className="font-medium text-foreground">{health.completeness}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-surface-2">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${health.completeness}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-success/5 px-2 py-1.5">
            <div className="text-lg font-semibold text-success">{health.grounded}</div>
            <div className="text-xs text-foreground-muted">Grounded</div>
          </div>
          <div className="rounded-md bg-primary/5 px-2 py-1.5">
            <div className="text-lg font-semibold text-primary">{health.reasoned}</div>
            <div className="text-xs text-foreground-muted">Reasoned</div>
          </div>
          <div className="rounded-md bg-warning/5 px-2 py-1.5">
            <div className="text-lg font-semibold text-warning">{health.exploratory}</div>
            <div className="text-xs text-foreground-muted">Exploratory</div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-foreground-muted">
        {health.overallHealth === "strong" && "Model is well-grounded with documented assumptions."}
        {health.overallHealth === "moderate" && "Consider adding narrative context to key assumptions."}
        {health.overallHealth === "review" && "Review exploratory assumptions before presenting."}
      </p>
    </div>
  );
}

export function ModelHealthCompact({ inputs }: ModelHealthProps) {
  const health = calculateHealth(inputs);
  const colors = healthColors[health.overallHealth];

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
        {colors.label}
      </span>
      <span className="text-xs text-foreground-muted">
        {health.grounded}G / {health.reasoned}R / {health.exploratory}E
      </span>
    </div>
  );
}
