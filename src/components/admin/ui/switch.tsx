"use client";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Switch({ checked, onCheckedChange, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={props["aria-label"]}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-5 w-10 shrink-0 items-center border transition-all duration-400 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--admin-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--admin-bg)] disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? "border-[color:var(--admin-accent)] bg-[color:var(--admin-accent)]/15"
          : "border-[color:var(--admin-line-strong)] bg-transparent"
      }`}
    >
      <span
        className={`block h-2.5 w-2.5 transform transition-transform duration-400 ease-out ${
          checked
            ? "translate-x-5 bg-[color:var(--admin-accent)]"
            : "translate-x-1 bg-[color:var(--admin-text-muted)]"
        }`}
      />
    </button>
  );
}
