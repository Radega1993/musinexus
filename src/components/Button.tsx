"use client";

import { forwardRef, cloneElement, isValidElement } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-white shadow-soft hover:bg-brand-primary-hover focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg",
  secondary:
    "border border-brand-border bg-brand-panel text-brand-text hover:bg-brand-border/50 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg",
  ghost:
    "text-brand-text hover:bg-brand-panel focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "rounded-xl px-4 py-2 text-sm font-medium",
  lg: "rounded-2xl px-6 py-3 text-base font-medium",
};

const baseClasses =
  "inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "default",
      disabled,
      type = "button",
      asChild = false,
      children,
      ...rest
    },
    ref
  ) => {
    const combinedClassName = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim();

    if (asChild && isValidElement(children)) {
      return cloneElement(children as React.ReactElement<{ className?: string; ref?: React.Ref<unknown> }>, {
        className: [combinedClassName, (children.props as { className?: string }).className].filter(Boolean).join(" "),
        ref,
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={combinedClassName}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
