"use client";

import { ConfidenceLevel, CONFIDENCE_LEVELS } from "@/lib/schema";

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  onChange?: (level: ConfidenceLevel) => void;
  size?: "sm" | "md";
}

const levelColors: Record<ConfidenceLevel, { bg: string; text: string; ring: string }> = {
  grounded: { bg: "bg-success/10", text: "text-success", ring: "ring-success/30" },
  reasoned: { bg: "bg-primary/10", text: "text-primary", ring: "ring-primary/30" },
  exploratory: { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/30" },
};

export function ConfidenceIndicator({ level, onChange, size = "sm" }: ConfidenceIndicatorProps) {
  const config = CONFIDENCE_LEVELS.find((l) => l.value === level);
  const colors = levelColors[level];

  if (onChange) {
    return (
      <div className="flex items-center gap-1">
        {CONFIDENCE_LEVELS.map((opt) => {
          const optColors = levelColors[opt.value];
          const isActive = opt.value === level;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ring-1 ${
                isActive
                  ? `${optColors.bg} ${optColors.text} ${optColors.ring}`
                  : "bg-surface-2 text-foreground-muted ring-transparent hover:ring-border"
              }`}
              title={opt.description}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 ${
        size === "sm" ? "text-xs" : "text-sm"
      } font-medium ${colors.bg} ${colors.text}`}
      title={config?.description}
    >
      {config?.label}
    </span>
  );
}
