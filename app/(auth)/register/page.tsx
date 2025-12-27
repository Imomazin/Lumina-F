import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Create Account - Lumina F",
  description: "Create your Lumina F account and start analyzing financials",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-surface to-surface-2 p-4">
      <AuthForm mode="register" />
    </div>
  );
}
