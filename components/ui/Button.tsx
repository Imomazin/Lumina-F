import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "neon" | "glow";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-primary to-accent
    text-primary-foreground font-semibold
    hover:shadow-lg hover:shadow-primary/30
    hover:-translate-y-0.5
    focus:ring-primary/30
    transition-all duration-300
  `,
  secondary: `
    bg-surface/80 backdrop-blur-sm
    border border-border/50
    text-foreground
    hover:bg-surface-2 hover:border-primary/30
    focus:ring-border
    transition-all duration-200
  `,
  ghost: `
    bg-transparent
    text-foreground-muted
    hover:text-primary hover:bg-primary/10
    focus:ring-primary/20
    transition-all duration-200
  `,
  destructive: `
    bg-gradient-to-r from-danger to-danger/80
    text-danger-foreground
    hover:shadow-lg hover:shadow-danger/30
    focus:ring-danger/30
    transition-all duration-200
  `,
  neon: `
    bg-transparent
    border border-primary
    text-primary font-semibold
    hover:bg-primary hover:text-primary-foreground
    hover:shadow-[0_0_20px_rgba(0,255,136,0.4),0_0_40px_rgba(0,255,136,0.2)]
    focus:ring-primary/30
    transition-all duration-300
  `,
  glow: `
    bg-gradient-to-r from-primary via-accent to-primary
    background-size-200
    text-primary-foreground font-bold
    hover:shadow-[0_0_30px_rgba(0,255,136,0.5),0_0_60px_rgba(0,255,136,0.3)]
    hover:-translate-y-1
    focus:ring-primary/30
    animate-shimmer
    transition-all duration-300
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-8 py-3.5 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
          disabled:pointer-events-none disabled:opacity-50
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
