import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title text-foreground">Dashboard</h1>
        <p className="mt-2 text-foreground-muted">
          Overview and quick actions
        </p>
      </div>

      <DashboardView />
    </div>
  );
}
