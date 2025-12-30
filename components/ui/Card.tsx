import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glow" | "stat";
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  variant = "default",
  hover = true,
}: CardProps) {
  const baseClasses = "rounded-xl backdrop-blur-xl transition-all duration-300";

  const variantClasses = {
    default: `
      bg-gradient-to-br from-surface/90 to-surface-2/80
      border border-border/50
      shadow-lg shadow-black/20
      ${hover ? "hover:border-primary/30 hover:shadow-primary/10 hover:shadow-xl hover:-translate-y-0.5" : ""}
    `,
    glow: `
      bg-gradient-to-br from-surface/95 to-surface-2/90
      border border-primary/20
      shadow-lg shadow-primary/5
      ${hover ? "hover:border-primary/40 hover:shadow-primary/20 hover:shadow-xl hover:-translate-y-1" : ""}
      relative overflow-hidden
    `,
    stat: `
      bg-gradient-to-br from-surface/95 to-background/95
      border border-primary/15
      shadow-lg shadow-black/30
      relative overflow-hidden
    `,
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {variant === "stat" && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
      )}
      {variant === "glow" && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`
        border-b border-border/50 px-6 py-4
        bg-gradient-to-r from-transparent via-primary/5 to-transparent
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div
      className={`
        border-t border-border/50 px-6 py-4
        bg-gradient-to-r from-surface-2/50 via-surface-2/80 to-surface-2/50
        ${className}
      `}
    >
      {children}
    </div>
  );
}
