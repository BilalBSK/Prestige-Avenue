"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-none font-medium tracking-wide transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--admin-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--admin-bg)]",
  {
    variants: {
      variant: {
        primary:
          "border border-[color:var(--admin-accent)] bg-[color:var(--admin-accent)] text-[color:var(--admin-bg)] hover:bg-[color:var(--admin-accent-soft)] hover:border-[color:var(--admin-accent-soft)]",
        secondary:
          "border border-[color:var(--admin-line-strong)] bg-transparent text-[color:var(--admin-text)] hover:border-[color:var(--admin-accent)] hover:text-[color:var(--admin-accent)]",
        ghost:
          "border border-transparent text-[color:var(--admin-text-soft)] hover:text-[color:var(--admin-accent)]",
        danger:
          "border border-[color:var(--admin-danger)]/50 bg-transparent text-[color:var(--admin-danger-soft)] hover:border-[color:var(--admin-danger)] hover:bg-[color:var(--admin-danger)]/10",
      },
      size: {
        sm: "h-8 px-3 text-[0.72rem] uppercase tracking-[0.18em]",
        md: "h-11 px-6 text-[0.78rem] uppercase tracking-[0.22em]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});

export { buttonVariants };
