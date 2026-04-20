"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { buttonVariants, type ButtonVariantProps } from "./button-variants";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
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
