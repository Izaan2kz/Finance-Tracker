"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/analytics": "Analytics",
  "/insights": "AI Insights",
};

export default function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="flex h-16 items-center border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-sm lg:px-8">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
    </header>
  );
}
