"use client";

import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { PromoBanner } from "@/components/Banners";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {showBanner && <PromoBanner onDismiss={() => setShowBanner(false)} />}
      <TopNav />
      <main>{children}</main>
    </div>
  );
}
