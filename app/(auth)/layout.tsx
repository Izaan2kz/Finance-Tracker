export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-[#060B18] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B18] via-transparent to-[#060B18]" />
      </div>
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/[0.07] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-red-600/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 left-2/3 w-[300px] h-[300px] rounded-full bg-blue-500/[0.03] blur-[100px] pointer-events-none" />

      {/* Floating money symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute text-[200px] font-bold text-blue-400/[0.03] font-[family-name:var(--font-heading)] select-none top-[5%] left-[5%]">$</span>
        <span className="absolute text-[150px] font-bold text-blue-400/[0.025] font-[family-name:var(--font-heading)] select-none bottom-[10%] right-[8%]">€</span>
        <span className="absolute text-[120px] font-bold text-blue-400/[0.02] font-[family-name:var(--font-heading)] select-none top-[40%] right-[15%]">£</span>
        <span className="absolute text-[100px] font-bold text-blue-400/[0.025] font-[family-name:var(--font-heading)] select-none bottom-[20%] left-[10%]">¥</span>
      </div>

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
