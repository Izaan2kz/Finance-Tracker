"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/analytics": "Analytics",
  "/insights": "AI Insights",
};

export default function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || null);
      }
    });
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#060B18]/60 backdrop-blur-xl px-6 lg:px-8">
      <h2 className="text-lg font-semibold text-slate-100 font-[family-name:var(--font-heading)]">{title}</h2>
      {userName && (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
            <User className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-sm text-slate-400 hidden sm:block">{userName}</span>
        </div>
      )}
    </header>
  );
}
