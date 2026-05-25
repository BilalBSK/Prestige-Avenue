import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-accent)] focus-visible:ring-offset-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--admin-text)] text-[color:var(--admin-bg)] hover:bg-[color:var(--admin-text-soft)]",
        secondary:
          "border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text)] hover:bg-[color:var(--admin-surface-2)] hover:border-[color:var(--admin-line-strong)]",
        ghost:
          "text-[color:var(--admin-text-soft)] hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]",
        danger:
          "bg-[color:var(--admin-danger)] text-white hover:bg-[color:var(--admin-danger-soft)]",
        "danger-ghost":
          "text-[color:var(--admin-danger-soft)] hover:bg-[color:var(--admin-danger-dim)]",
      },
      size: {
        sm: "h-7 px-2.5 text-[0.75rem]",
        md: "h-8 px-3 text-[0.8125rem]",
        lg: "h-9 px-4 text-[0.875rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
