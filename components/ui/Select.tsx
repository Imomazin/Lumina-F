import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error = false, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-colors ${
          error
            ? "border-danger focus:ring-danger/30"
            : "border-border focus:border-primary focus:ring-primary/30"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
