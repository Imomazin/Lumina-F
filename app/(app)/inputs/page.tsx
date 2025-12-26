import { InputsForm } from "@/components/forms/InputsForm";

export default function InputsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Analysis Inputs
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Enter the financial data for your analysis session
        </p>
      </div>

      <InputsForm />
    </div>
  );
}
