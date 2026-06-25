"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#060B18] disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variant === "primary" &&
            "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500",
          variant === "secondary" &&
            "bg-white/[0.04] text-slate-100 hover:bg-white/[0.08] border border-white/[0.08] focus:ring-blue-500",
          variant === "danger" &&
            "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
          variant === "ghost" &&
            "text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] focus:ring-blue-500",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
