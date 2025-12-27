import { AnalysisView } from "@/components/AnalysisView";
import { PageHeader } from "@/components/ui";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis"
        subtitle="Review your financial forecast and projections"
      />
      <AnalysisView />
    </div>
  );
}
