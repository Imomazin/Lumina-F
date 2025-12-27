import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign In - Lumina F",
  description: "Sign in to your Lumina F account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-surface to-surface-2 p-4">
      <AuthForm mode="login" />
    </div>
  );
}
