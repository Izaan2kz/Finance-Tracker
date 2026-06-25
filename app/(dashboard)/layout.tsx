import DashboardNav from "@/components/layout/DashboardNav";
import DashboardBackground from "@/components/layout/DashboardBackground";
import { ToastProvider } from "@/components/ui/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#060B18] text-slate-100">
        <DashboardBackground />
        <DashboardNav />
        <main className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-24 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
