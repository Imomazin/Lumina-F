"use client";

import { ReactNode } from "react";

interface SparklineData {
  values: number[];
}

function MiniSparkline({ values }: SparklineData) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const height = 24;
  const width = 64;
  const padding = 2;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  const trend = values[values.length - 1] > values[0];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={trend ? "rgb(var(--color-success))" : "rgb(var(--color-danger))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={parseFloat(points.split(" ").pop()?.split(",")[0] || "0")}
        cy={parseFloat(points.split(" ").pop()?.split(",")[1] || "0")}
        r="2"
        fill={trend ? "rgb(var(--color-success))" : "rgb(var(--color-danger))"}
      />
    </svg>
  );
}

type MetricVariant = "default" | "primary" | "success" | "warning" | "danger";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: {
    value: number;
    label?: string;
  };
  sparkline?: number[];
  icon?: ReactNode;
  variant?: MetricVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles: Record<MetricVariant, string> = {
  default: "border-border",
  primary: "border-primary/30 bg-primary/5",
  success: "border-success/30 bg-success/5",
  warning: "border-warning/30 bg-warning/5",
  danger: "border-danger/30 bg-danger/5",
};

const sizeStyles = {
  sm: { value: "text-xl", label: "text-xs" },
  md: { value: "text-2xl", label: "text-sm" },
  lg: { value: "text-3xl", label: "text-sm" },
};

export function MetricCard({
  label,
  value,
  subValue,
  change,
  sparkline,
  icon,
  variant = "default",
  size = "md",
  className = "",
}: MetricCardProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={`rounded-xl border bg-surface p-4 transition-all hover:shadow-md ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`${styles.label} font-medium text-foreground-muted truncate`}>
            {label}
          </p>
          <p className={`${styles.value} font-bold text-foreground mt-1 tabular-nums`}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-foreground-muted mt-0.5">{subValue}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2">
              {icon}
            </div>
          )}
          {sparkline && sparkline.length > 1 && (
            <MiniSparkline values={sparkline} />
          )}
        </div>
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
              change.value >= 0
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            }`}
          >
            {change.value >= 0 ? "↑" : "↓"} {Math.abs(change.value).toFixed(1)}%
          </span>
          {change.label && (
            <span className="text-xs text-foreground-muted">{change.label}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Grid wrapper for metric cards
interface MetricGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function MetricGrid({ children, columns = 4, className = "" }: MetricGridProps) {
  const colClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  };

  return (
    <div className={`grid gap-4 ${colClasses[columns]} ${className}`}>
      {children}
    </div>
  );
}
