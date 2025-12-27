import { ReportsView } from "@/components/ReportsView";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Reports
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Generate and export financial reports
        </p>
      </div>

      <ReportsView />
    </div>
  );
}
