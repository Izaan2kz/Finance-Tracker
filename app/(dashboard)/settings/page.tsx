"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Settings, User, DollarSign, Shield, Trash2 } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  monthlyBudget: string;
}

export default function SettingsPage() {
  const prefersReduced = useReducedMotion();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "", monthlyBudget: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", newPass: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setProfile({
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
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
        data: { full_name: profile.name.trim() },
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
          <div className="pt-2">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ),
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
            type="number"
            value={profile.monthlyBudget}
            onChange={(e) => setProfile({ ...profile, monthlyBudget: e.target.value })}
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
      icon: Trash2,
      title: "Danger Zone",
      color: "red",
      gradient: "from-red-950/30",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Permanently delete your account and all associated data. This cannot be undone.</p>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </div>
      ),
    },
  ];

  const colorMap: Record<string, { iconBg: string; iconText: string; border: string }> = {
    blue: { iconBg: "bg-blue-500/10", iconText: "text-blue-400", border: "hover:border-blue-500/20" },
    emerald: { iconBg: "bg-emerald-500/10", iconText: "text-emerald-400", border: "hover:border-emerald-500/20" },
    amber: { iconBg: "bg-amber-500/10", iconText: "text-amber-400", border: "hover:border-amber-500/20" },
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
