import { TopNav } from "@/components/TopNav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <TopNav />
      <main>{children}</main>
    </div>
  );
}
