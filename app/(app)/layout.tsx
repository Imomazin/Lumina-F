"use client";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The DashboardShell component now handles all navigation and layout
  // Each page will use DashboardShell directly for full-width layouts
  return <>{children}</>;
}
