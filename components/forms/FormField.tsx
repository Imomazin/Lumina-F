import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  helper?: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({
  label,
  htmlFor,
  error,
  helper,
  children,
  required,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      {children}
      {helper && !error && (
        <p className="text-xs text-foreground-muted">{helper}</p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

interface FormSectionProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function FormSection({ title, children, action }: FormSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h2 className="text-section text-foreground">{title}</h2>
        {action}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}
