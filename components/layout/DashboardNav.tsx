"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Sparkles,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/insights", label: "Insights", icon: Sparkles },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [userName, setUserName] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || null);
      }
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Desktop + Mobile Top Bar */}
      <motion.nav
        initial={prefersReduced ? {} : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 pt-3 lg:px-8">
          <div className="flex h-14 items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0A1028]/70 backdrop-blur-2xl px-5">
            {/* Brand */}
            <Link href="/dashboard" className="text-lg font-bold tracking-tight font-[family-name:var(--font-heading)] text-slate-100 shrink-0">
              Financer
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-blue-400"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-xl bg-blue-500/10 border border-blue-500/20"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {userName && (
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
                    <User className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-400">{userName}</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-colors cursor-pointer"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mx-4 mt-2 lg:mx-8"
            >
              <div className="rounded-2xl border border-white/[0.06] bg-[#0A1028]/90 backdrop-blur-2xl p-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="mx-3 mb-3">
          <div className="flex items-center justify-around rounded-2xl border border-white/[0.06] bg-[#0A1028]/90 backdrop-blur-2xl px-2 py-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileNav"
                      className="absolute inset-0 rounded-xl bg-blue-500/10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
