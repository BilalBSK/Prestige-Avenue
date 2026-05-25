interface IconProps {
  className?: string;
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 22s7-6.5 7-12.5a7 7 0 1 0-14 0C5 15.5 12 22 12 22z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 4.5C5 3.67 5.67 3 6.5 3h2.05a1 1 0 0 1 .97.76l1.05 4.21a1 1 0 0 1-.27.97l-1.7 1.7a14 14 0 0 0 5.76 5.76l1.7-1.7a1 1 0 0 1 .97-.27l4.21 1.05a1 1 0 0 1 .76.97V18a2.5 2.5 0 0 1-2.5 2.5C9.94 20.5 3.5 14.06 3.5 6.5 3.5 5 4.5 4.5 5 4.5Z" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="0.5" />
      <path d="m3.5 6 8.5 7.5L20.5 6" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
