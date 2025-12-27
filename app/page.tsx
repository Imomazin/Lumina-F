import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            <span className="text-primary">Lumina</span>{" "}
            <span className="text-accent">F</span>
          </span>
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-display text-foreground">
            <span className="text-primary">Lumina</span>{" "}
            <span className="text-accent">F</span>
          </h1>
          <p className="mt-4 text-lg text-foreground-muted">
            Financial analysis and reporting platform
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/inputs"
              className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Start Analysis
            </Link>
            <Link
              href="/dashboard"
              className="inline-block rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
          <p className="text-sm text-foreground-muted">
            Lumina F v0.1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
