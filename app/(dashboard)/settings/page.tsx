"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Settings, User, DollarSign, Shield, Trash2, Globe, Info } from "lucide-react";
import Link from "next/link";
import { useCurrency, currencies } from "@/lib/currency";

interface UserProfile {
  name: string;
  email: string;
  occupation: string;
  monthlyBudget: string;
}

export default function SettingsPage() {
  const prefersReduced = useReducedMotion();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "", occupation: "", monthlyBudget: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", newPass: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const { currency, setCurrency, getCurrencyInfo } = useCurrency();
  const [currencySearch, setCurrencySearch] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setProfile({
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          occupation: user.user_metadata?.occupation || "",
          monthlyBudget: "",
        });

        supabase
          .from("users")
          .select("monthly_budget")
          .eq("supabase_id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.monthly_budget) {
              setProfile((p) => ({ ...p, monthlyBudget: String(data.monthly_budget) }));
            }
          });
      }
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: profile.name.trim(), occupation: profile.occupation.trim() || null },
      });
      if (authError) throw authError;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const budget = profile.monthlyBudget ? parseFloat(profile.monthlyBudget) : null;
        await supabase
          .from("users")
          .update({
            name: profile.name.trim(),
            monthly_budget: budget,
          })
          .eq("supabase_id", user.id);
      }

      toast("Profile updated", "success");
    } catch {
      toast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPass !== passwordData.confirm) {
      toast("Passwords don't match", "error");
      return;
    }
    if (passwordData.newPass.length < 8) {
      toast("Password must be at least 8 characters", "error");
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPass });
      if (error) throw error;
      setPasswordData({ current: "", newPass: "", confirm: "" });
      toast("Password updated", "success");
    } catch {
      toast("Failed to update password", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.")) return;
    toast("Please contact support to delete your account", "info");
  };

  if (loading) return null;

  const sections = [
    {
      icon: User,
      title: "Profile",
      color: "blue",
      gradient: "from-blue-950/40",
      content: (
        <div className="space-y-4">
          <Input id="name" label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" />
          <Input id="email" label="Email" value={profile.email} disabled className="opacity-60 cursor-not-allowed" />
          <Input id="occupation" label="Occupation" value={profile.occupation} onChange={(e) => setProfile({ ...profile, occupation: e.target.value })} placeholder="e.g. Software Engineer, Student, Freelancer" />
          <div className="pt-2">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ),
    },
    {
      icon: Globe,
      title: "Currency",
      color: "sky",
      gradient: "from-sky-950/30",
      content: (() => {
        const filtered = currencies.filter((c) =>
          currencySearch ? c.name.toLowerCase().includes(currencySearch.toLowerCase()) || c.code.toLowerCase().includes(currencySearch.toLowerCase()) : true
        );
        const info = getCurrencyInfo();
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
              <span className="text-lg">{info.symbol}</span>
              <div>
                <p className="text-sm font-medium text-slate-200">{info.name}</p>
                <p className="text-xs text-slate-500">{info.code}</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search currencies..."
              value={currencySearch}
              onChange={(e) => setCurrencySearch(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30"
            />
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); setCurrencySearch(""); toast(`Currency set to ${c.name}`, "success"); }}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all cursor-pointer ${
                    currency === c.code
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <span className="w-8 text-center text-base">{c.symbol}</span>
                  <span className="flex-1 text-left">{c.name}</span>
                  <span className="text-xs text-slate-600">{c.code}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-3">No currencies found</p>
              )}
            </div>
          </div>
        );
      })(),
    },
    {
      icon: DollarSign,
      title: "Budget",
      color: "emerald",
      gradient: "from-emerald-950/30",
      content: (
        <div className="space-y-4">
          <Input
            id="budget"
            label="Monthly Budget"
            inputMode="decimal"
            value={profile.monthlyBudget}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d*\.?\d*$/.test(v)) setProfile({ ...profile, monthlyBudget: v });
            }}
            placeholder="e.g. 5000"
          />
          <p className="text-xs text-slate-500">Set a monthly budget to track your spending against a target. Leave empty to disable.</p>
          <div className="pt-2">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Update Budget"}
            </Button>
          </div>
        </div>
      ),
    },
    {
      icon: Shield,
      title: "Security",
      color: "amber",
      gradient: "from-amber-950/30",
      content: (
        <div className="space-y-4">
          <Input id="newPass" label="New Password" type="password" value={passwordData.newPass} onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })} placeholder="Min 8 characters" />
          <Input id="confirm" label="Confirm Password" type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} placeholder="Repeat password" />
          <div className="pt-2">
            <Button onClick={handleChangePassword} disabled={changingPassword || !passwordData.newPass}>
              {changingPassword ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </div>
      ),
    },
    {
      icon: Info,
      title: "App Info",
      color: "violet",
      gradient: "from-violet-950/30",
      content: (
        <div className="space-y-4">
          <div className="space-y-2.5">
            {[
              { label: "App", value: "Financer" },
              { label: "Framework", value: "Next.js 16" },
              { label: "Database", value: "Supabase" },
              { label: "AI Engine", value: "Google Gemini" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-xs font-medium text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/about" className="text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">About</Link>
            <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-300 transition-colors bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">Terms</Link>
            <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-300 transition-colors bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">Privacy</Link>
          </div>
        </div>
      ),
    },
    {
      icon: Trash2,
      title: "Danger Zone",
      color: "red",
      gradient: "from-red-950/30",
      content: (
        <div className="space-y-4">
          <div className="rounded-xl bg-red-500/5 border border-red-500/10 px-4 py-3 space-y-2">
            <p className="text-sm font-medium text-red-400">What happens when you delete:</p>
            {["All transactions permanently erased", "Analytics & insights history removed", "Categories and budget settings deleted", "Account credentials wiped from servers"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400/50 shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600">This action is irreversible. Please be certain.</p>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </div>
      ),
    },
  ];

  const colorMap: Record<string, { iconBg: string; iconText: string; border: string }> = {
    blue: { iconBg: "bg-blue-500/10", iconText: "text-blue-400", border: "hover:border-blue-500/20" },
    sky: { iconBg: "bg-sky-500/10", iconText: "text-sky-400", border: "hover:border-sky-500/20" },
    emerald: { iconBg: "bg-emerald-500/10", iconText: "text-emerald-400", border: "hover:border-emerald-500/20" },
    amber: { iconBg: "bg-amber-500/10", iconText: "text-amber-400", border: "hover:border-amber-500/20" },
    violet: { iconBg: "bg-violet-500/10", iconText: "text-violet-400", border: "hover:border-violet-500/20" },
    red: { iconBg: "bg-red-500/10", iconText: "text-red-400", border: "hover:border-red-500/20" },
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-800/30 via-[#0A1028]/30 to-[#0A1028]/20 p-6 lg:p-8 backdrop-blur-xl"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[250px] h-[250px] rounded-full bg-slate-600/8 blur-[80px]" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="rounded-xl bg-white/[0.06] p-3 border border-white/[0.06]">
            <Settings className="h-6 w-6 text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 font-[family-name:var(--font-heading)] tracking-tight">Settings</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your account and preferences</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section, i) => {
          const c = colorMap[section.color];
          return (
            <motion.div
              key={section.title}
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              <Card className={`${c.border} transition-all duration-300 h-full`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`rounded-xl ${c.iconBg} p-2.5 border border-white/[0.06]`}>
                    <section.icon className={`h-5 w-5 ${c.iconText}`} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-100 font-[family-name:var(--font-heading)]">{section.title}</h2>
                </div>
                {section.content}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
