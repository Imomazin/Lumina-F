import { InputsForm } from "@/components/forms/InputsForm";
import { PageHeader } from "@/components/ui";

export default function InputsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis Inputs"
        subtitle="Enter the financial data for your analysis session"
      />
      <InputsForm />
    </div>
  );
}
