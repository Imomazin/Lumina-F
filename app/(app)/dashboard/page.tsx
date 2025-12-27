import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Overview and quick actions
        </p>
      </div>

      <DashboardView />
    </div>
  );
}
