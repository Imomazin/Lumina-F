import { AdminView } from "@/components/AdminView";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Configure application defaults and feature flags
        </p>
      </div>

      <AdminView />
    </div>
  );
}
