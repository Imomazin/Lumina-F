import { DashboardView } from "@/components/DashboardView";
import { PageHeader } from "@/components/ui";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview and quick actions"
      />
      <DashboardView />
    </div>
  );
}
