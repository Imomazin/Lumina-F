import { AnalysisView } from "@/components/AnalysisView";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title text-foreground">Analysis</h1>
        <p className="mt-2 text-foreground-muted">
          Review your financial forecast and projections
        </p>
      </div>

      <AnalysisView />
    </div>
  );
}
