
import React from "react";

const variants = {
  primary:
    "bg-primary text-main hover:bg-emerald-300 shadow-lg shadow-emerald-950/30",
  secondary:
    "bg-secondary text-main hover:bg-amber-300",
  outline:
    "border border-bsecondary bg-transparent text-tprimary hover:border-primary hover:bg-primary/10",
  ghost:
    "bg-transparent text-tsecondary hover:bg-white/5 hover:text-white",
  danger:
    "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "w-full px-6 py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl",
        "font-semibold transition-all duration-200",
        "active:scale-[0.98] disabled:opacity-45",
        "disabled:pointer-events-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-secondary",
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
