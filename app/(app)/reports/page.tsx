import { ReportsView } from "@/components/ReportsView";
import { PageHeader } from "@/components/ui";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Reports"
          subtitle="Generate and export financial reports"
        />
      </div>
      <ReportsView />
    </div>
  );
}
