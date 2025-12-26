import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      {/* Minimal header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Lumina F
          </span>
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Lumina F
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Financial analysis and reporting platform
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-block rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Lumina F
          </p>
        </div>
      </footer>
    </div>
  );
}
