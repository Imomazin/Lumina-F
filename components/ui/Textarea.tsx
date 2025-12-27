import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-colors resize-y min-h-[80px] ${
          error
            ? "border-danger focus:ring-danger/30"
            : "border-border focus:border-primary focus:ring-primary/30"
        } ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
