import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-colors ${
          error
            ? "border-danger focus:ring-danger/30"
            : "border-border focus:border-primary focus:ring-primary/30"
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
