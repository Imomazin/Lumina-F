import { AdminView } from "@/components/AdminView";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title text-foreground">Settings</h1>
        <p className="mt-2 text-foreground-muted">
          Configure application defaults and feature flags
        </p>
      </div>

      <AdminView />
    </div>
  );
}
