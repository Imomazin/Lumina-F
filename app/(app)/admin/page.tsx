import { AdminView } from "@/components/AdminView";
import { PageHeader } from "@/components/ui";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure application defaults and feature flags"
      />
      <AdminView />
    </div>
  );
}
