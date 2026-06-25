import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-[#060B18] overflow-hidden">
      <AnimatedBackground />

      {/* Left branding panel - desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-16">
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold font-[family-name:var(--font-heading)] mb-6 tracking-tight">
            Financer
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed mb-10">
            Take control of your money. Track spending, visualize patterns, and get AI-powered insights.
          </p>
          <div className="space-y-4">
            {[
              { label: "Track Every Dollar", desc: "Income and expenses in one place" },
              { label: "Visual Analytics", desc: "Charts that reveal your habits" },
              { label: "AI Insights", desc: "Smart advice powered by Gemini" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 lg:p-16">
        {children}
      </div>
    </div>
  );
}
