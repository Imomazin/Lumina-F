import { TopNav } from "@/components/TopNav";
import { Container } from "@/components/ui";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="py-8">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
