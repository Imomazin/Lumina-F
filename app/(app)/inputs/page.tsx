import { InputsForm } from "@/components/forms/InputsForm";

export default function InputsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title text-foreground">Analysis Inputs</h1>
        <p className="mt-2 text-foreground-muted">
          Enter the financial data for your analysis session
        </p>
      </div>

      <InputsForm />
    </div>
  );
}
