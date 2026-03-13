"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inputs", label: "Inputs" },
  { href: "/analysis", label: "Analysis" },
  { href: "/reports", label: "Reports" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0a0a0a]/95 backdrop-blur-sm print:hidden">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-bold tracking-tight"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 rotate-45 rounded-sm" />
          <span className="ml-1 text-amber-400">Lumina</span>
          <span className="text-amber-500">F</span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-1">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-amber-500 text-black"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}
