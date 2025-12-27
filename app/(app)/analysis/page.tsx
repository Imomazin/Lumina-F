import { AnalysisView } from "@/components/AnalysisView";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Analysis
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Financial forecast and projections
        </p>
      </div>

      <AnalysisView />
    </div>
  );
}
