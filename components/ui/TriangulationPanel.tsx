"use client";

interface TriangulationPanelProps {
  type: "strategic" | "risk" | "limitation";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const panelStyles = {
  strategic: {
    border: "border-l-primary/50",
    bg: "bg-primary/5",
    icon: (
      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    defaultTitle: "Strategic Consideration",
  },
  risk: {
    border: "border-l-warning/50",
    bg: "bg-warning/5",
    icon: (
      <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    defaultTitle: "Sensitivity Note",
  },
  limitation: {
    border: "border-l-foreground-muted/30",
    bg: "bg-surface-2",
    icon: (
      <svg className="h-4 w-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    defaultTitle: "Model Boundary",
  },
};

export function TriangulationPanel({ type, title, children, className = "" }: TriangulationPanelProps) {
  const style = panelStyles[type];

  return (
    <div className={`rounded-r-lg border-l-2 ${style.border} ${style.bg} p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-foreground">
            {title || style.defaultTitle}
          </h4>
          <div className="mt-1 text-xs text-foreground-muted leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LimitationsStatement({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-surface-2 p-4 ${className}`}>
      <h4 className="text-sm font-medium text-foreground">What This Projection Does Not Address</h4>
      <ul className="mt-3 space-y-2 text-xs text-foreground-muted">
        <li className="flex items-start gap-2">
          <span className="text-foreground-muted/50">•</span>
          <span>Market volatility, competitive dynamics, or macroeconomic shifts</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-foreground-muted/50">•</span>
          <span>Operational disruptions, regulatory changes, or force majeure events</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-foreground-muted/50">•</span>
          <span>Validation of underlying assumptions (user-provided inputs only)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-foreground-muted/50">•</span>
          <span>Working capital timing, cash flow cycles, or liquidity constraints</span>
        </li>
      </ul>
      <p className="mt-4 text-xs text-foreground-muted/70 italic">
        This projection is deterministic: outputs derive directly from stated assumptions.
        It is not a prediction of future performance.
      </p>
    </div>
  );
}
