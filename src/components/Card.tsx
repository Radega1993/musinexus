"use client";

type CardVariant = "default" | "glass";

const variantClasses: Record<CardVariant, string> = {
  default:
    "rounded-2xl border border-brand-border bg-brand-panel p-4 sm:p-5 shadow-soft",
  glass: "glass rounded-2xl p-4 sm:p-5 shadow-soft",
};

export function Card({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}) {
  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
