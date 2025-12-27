import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
        <div className="mx-auto max-w-md text-center">
          {icon && (
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
              {icon}
            </div>
          )}
          <h3 className="text-section text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-foreground-muted">{description}</p>
          {(primaryAction || secondaryAction) && (
            <div className="mt-6 flex justify-center gap-3">
              {primaryAction && (
                <Link href={primaryAction.href}>
                  <Button>{primaryAction.label}</Button>
                </Link>
              )}
              {secondaryAction && (
                <Link href={secondaryAction.href}>
                  <Button variant="secondary">{secondaryAction.label}</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
