import { ReportsView } from "@/components/ReportsView";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-title text-foreground">Reports</h1>
        <p className="mt-2 text-foreground-muted">
          Generate and export financial reports
        </p>
      </div>

      <ReportsView />
    </div>
  );
}
