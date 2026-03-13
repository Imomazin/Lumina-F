"use client";

import { ReactNode, useState, useEffect, createContext, useContext } from "react";

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export const tokens = {
  colors: {
    // Brand gradient
    brand: {
      from: "#f59e0b",
      via: "#ea580c",
      to: "#dc2626",
    },
    // Semantic colors
    success: { main: "#22c55e", light: "#86efac", dark: "#15803d" },
    warning: { main: "#f59e0b", light: "#fcd34d", dark: "#b45309" },
    danger: { main: "#ef4444", light: "#fca5a5", dark: "#b91c1c" },
    info: { main: "#3b82f6", light: "#93c5fd", dark: "#1d4ed8" },
    // Neutrals
    zinc: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  shadows: {
    glow: {
      amber: "0 0 40px rgba(245, 158, 11, 0.15)",
      green: "0 0 40px rgba(34, 197, 94, 0.15)",
      red: "0 0 40px rgba(239, 68, 68, 0.15)",
      blue: "0 0 40px rgba(59, 130, 246, 0.15)",
    },
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
};

// ============================================================================
// ANIMATIONS (CSS-in-JS for complex animations)
// ============================================================================

export const animations = {
  fadeIn: "animate-[fadeIn_0.3s_ease-out]",
  fadeInUp: "animate-[fadeInUp_0.4s_ease-out]",
  fadeInDown: "animate-[fadeInDown_0.4s_ease-out]",
  scaleIn: "animate-[scaleIn_0.2s_ease-out]",
  slideInRight: "animate-[slideInRight_0.3s_ease-out]",
  slideInLeft: "animate-[slideInLeft_0.3s_ease-out]",
  pulse: "animate-pulse",
  shimmer: "animate-[shimmer_2s_infinite]",
  float: "animate-[float_3s_ease-in-out_infinite]",
  glow: "animate-[glow_2s_ease-in-out_infinite]",
};

// ============================================================================
// GLASSMORPHISM PANEL
// ============================================================================

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle" | "brand";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  glow?: "none" | "amber" | "green" | "red" | "blue";
  animate?: boolean;
}

export function GlassPanel({
  children,
  className = "",
  variant = "default",
  padding = "md",
  hover = false,
  glow = "none",
  animate = false,
}: GlassPanelProps) {
  const variantStyles = {
    default: "bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80",
    elevated: "bg-zinc-900/80 backdrop-blur-2xl border border-zinc-700/50 shadow-2xl",
    subtle: "bg-zinc-900/40 backdrop-blur-lg border border-zinc-800/50",
    brand: "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 backdrop-blur-xl border border-amber-500/20",
  };

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  const glowStyles = {
    none: "",
    amber: "shadow-[0_0_50px_rgba(245,158,11,0.1)]",
    green: "shadow-[0_0_50px_rgba(34,197,94,0.1)]",
    red: "shadow-[0_0_50px_rgba(239,68,68,0.1)]",
    blue: "shadow-[0_0_50px_rgba(59,130,246,0.1)]",
  };

  return (
    <div
      className={`
        rounded-2xl transition-all duration-300
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${glowStyles[glow]}
        ${hover ? "hover:border-zinc-700 hover:bg-zinc-900/80 hover:scale-[1.01] hover:shadow-xl cursor-pointer" : ""}
        ${animate ? animations.fadeInUp : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// PREMIUM BUTTON
// ============================================================================

interface PremiumButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PremiumButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = "",
}: PremiumButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2 font-medium
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500
      bg-[length:200%_100%] bg-left
      text-black font-semibold
      hover:bg-right hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02]
      active:scale-[0.98]
      focus:ring-amber-500
    `,
    secondary: `
      bg-zinc-800 border border-zinc-700 text-white
      hover:bg-zinc-700 hover:border-zinc-600 hover:scale-[1.02]
      active:scale-[0.98]
      focus:ring-zinc-500
    `,
    ghost: `
      text-zinc-400
      hover:text-white hover:bg-zinc-800/50
      active:bg-zinc-800
      focus:ring-zinc-500
    `,
    danger: `
      bg-red-500/10 border border-red-500/30 text-red-400
      hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02]
      active:scale-[0.98]
      focus:ring-red-500
    `,
    success: `
      bg-green-500/10 border border-green-500/30 text-green-400
      hover:bg-green-500/20 hover:border-green-500/50 hover:scale-[1.02]
      active:scale-[0.98]
      focus:ring-green-500
    `,
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
}

// ============================================================================
// METRIC CARD (Premium version)
// ============================================================================

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "brand";
  size?: "sm" | "md" | "lg";
  trend?: "up" | "down" | "neutral";
  sparkline?: number[];
  animate?: boolean;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  variant = "default",
  size = "md",
  trend,
  sparkline,
  animate = true,
  onClick,
}: MetricCardProps) {
  const variantStyles = {
    default: { bg: "bg-zinc-800/50", border: "border-zinc-700/50", accent: "text-zinc-400" },
    success: { bg: "bg-green-500/10", border: "border-green-500/30", accent: "text-green-400" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", accent: "text-amber-400" },
    danger: { bg: "bg-red-500/10", border: "border-red-500/30", accent: "text-red-400" },
    info: { bg: "bg-blue-500/10", border: "border-blue-500/30", accent: "text-blue-400" },
    brand: { bg: "bg-gradient-to-br from-amber-500/10 to-orange-500/5", border: "border-amber-500/30", accent: "text-amber-400" },
  };

  const sizeStyles = {
    sm: { padding: "p-3", valueSize: "text-xl", labelSize: "text-[10px]" },
    md: { padding: "p-4", valueSize: "text-2xl", labelSize: "text-xs" },
    lg: { padding: "p-5", valueSize: "text-3xl", labelSize: "text-sm" },
  };

  const style = variantStyles[variant];
  const sizing = sizeStyles[size];

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl border
        ${style.bg} ${style.border}
        ${sizing.padding}
        ${onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg" : ""}
        transition-all duration-300
        ${animate ? animations.fadeInUp : ""}
        group
      `}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`${sizing.labelSize} font-medium text-zinc-500 uppercase tracking-wider`}>
          {label}
        </span>
        {icon && (
          <div className={`${style.accent}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className={`${sizing.valueSize} font-bold text-white mb-1 tracking-tight`}>
        {value}
      </div>

      {/* Change indicator */}
      {(change !== undefined || trend) && (
        <div className="flex items-center gap-1.5">
          {trend && (
            <span className={`
              ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-zinc-400"}
            `}>
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "neutral" && "→"}
            </span>
          )}
          {change !== undefined && (
            <span className={`text-xs font-medium ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {change >= 0 ? "+" : ""}{change.toFixed(1)}%
            </span>
          )}
          {changeLabel && (
            <span className="text-xs text-zinc-500">{changeLabel}</span>
          )}
        </div>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30">
          <svg viewBox={`0 0 ${sparkline.length * 10} 30`} className="w-full h-full">
            <path
              d={sparkline.map((v, i) => {
                const x = i * 10;
                const y = 30 - (v / Math.max(...sparkline)) * 25;
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              }).join(" ")}
              fill="none"
              stroke={style.accent.replace("text-", "").includes("amber") ? "#f59e0b" : "#22c55e"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ANIMATED COUNTER
// ============================================================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(startValue + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

// ============================================================================
// PROGRESS RING
// ============================================================================

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: "amber" | "green" | "red" | "blue";
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = "amber",
  showLabel = true,
  label,
  animate = true,
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimatedProgress(progress), 100);
      return () => clearTimeout(timer);
    }
    setAnimatedProgress(progress);
  }, [progress, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  const colors = {
    amber: { stroke: "#f59e0b", glow: "drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))" },
    green: { stroke: "#22c55e", glow: "drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))" },
    red: { stroke: "#ef4444", glow: "drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))" },
    blue: { stroke: "#3b82f6", glow: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))" },
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[color].stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: animate ? "stroke-dashoffset 1s ease-out" : "none",
            filter: colors[color].glow,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{Math.round(animatedProgress)}%</span>
          {label && <span className="text-[10px] text-zinc-500">{label}</span>}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ variant = "text", width, height, className = "" }: SkeletonProps) {
  const baseStyles = "bg-zinc-800 animate-pulse";

  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-2xl",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width={80} height={12} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      <Skeleton width={120} height={32} />
      <div className="flex gap-2">
        <Skeleton width={60} height={16} />
        <Skeleton width={40} height={16} />
      </div>
    </div>
  );
}

// ============================================================================
// TOOLTIP
// ============================================================================

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({ children, content, position = "top", delay = 200 }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [delayedShow, setDelayedShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (show) {
      timer = setTimeout(() => setDelayedShow(true), delay);
    } else {
      setDelayedShow(false);
    }
    return () => clearTimeout(timer);
  }, [show, delay]);

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {delayedShow && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-xs text-white
            bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl
            whitespace-nowrap
            ${positionStyles[position]}
            ${animations.fadeIn}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BADGE
// ============================================================================

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "brand";
  size?: "sm" | "md";
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({ children, variant = "default", size = "sm", dot = false, pulse = false }: BadgeProps) {
  const variantStyles = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    brand: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const dotColors = {
    default: "bg-zinc-400",
    success: "bg-green-400",
    warning: "bg-amber-400",
    danger: "bg-red-400",
    info: "bg-blue-400",
    brand: "bg-amber-400",
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full border
      ${variantStyles[variant]} ${sizeStyles[size]}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${pulse ? "animate-pulse" : ""}`} />
      )}
      {children}
    </span>
  );
}

// ============================================================================
// DIVIDER
// ============================================================================

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = "" }: DividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <span className="text-xs text-zinc-500 font-medium">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>
    );
  }

  return (
    <div className={`h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent ${className}`} />
  );
}

// ============================================================================
// ICON BUTTON
// ============================================================================

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function IconButton({
  icon,
  onClick,
  variant = "ghost",
  size = "md",
  label,
  disabled = false,
  className = "",
}: IconButtonProps) {
  const variantStyles = {
    ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-white",
    filled: "bg-zinc-800 hover:bg-zinc-700 text-white",
    outlined: "border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 text-zinc-400 hover:text-white",
  };

  const sizeStyles = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-8 text-center ${animations.fadeInUp}`}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center mb-6">
          <div className="text-zinc-500">{icon}</div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 max-w-sm mb-6">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <PremiumButton variant="primary" onClick={action.onClick}>
              {action.label}
            </PremiumButton>
          )}
          {secondaryAction && (
            <PremiumButton variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </PremiumButton>
          )}
        </div>
      )}
    </div>
  );
}
