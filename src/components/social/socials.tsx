interface IconProps {
  className?: string;
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function SnapchatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3.2c2.3 0 3.9 1.8 3.9 4.2 0 1 .1 2 .2 2.4.3.7 1.2.6 1.8.9.4.2.5.7.1 1-.5.4-1.5.5-1.7 1-.2.6.9 2.3 2.6 2.9.4.1.5.6.1.9-.7.5-1.8.4-2.3 1-.3.4 0 1.1-.5 1.3-.6.2-1.4-.4-2.5-.4-1 0-1.4.7-3.1.7s-2.1-.7-3.1-.7c-1.1 0-1.9.6-2.5.4-.5-.2-.2-.9-.5-1.3-.5-.6-1.6-.5-2.3-1-.4-.3-.3-.8.1-.9 1.7-.6 2.8-2.3 2.6-2.9-.2-.5-1.2-.6-1.7-1-.4-.3-.3-.8.1-1 .6-.3 1.5-.2 1.8-.9.1-.4.2-1.4.2-2.4 0-2.4 1.6-4.2 3.9-4.2Z" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46" />
      <path d="M14 6.5a5 5 0 0 0 5 4" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14.5 8.5V7c0-.8.5-1.2 1.3-1.2H17V3h-2.2C12.4 3 11 4.6 11 7v1.5H9V11h2v10h3.5V11h2.1l.4-2.5h-2.5Z" />
    </svg>
  );
}

export const SOCIALS = [
  { label: "Instagram", handle: "prestigeavenuee", href: "https://instagram.com/prestigeavenuee", Icon: InstagramIcon },
  { label: "Snapchat", handle: "prestigeavenuee", href: "https://snapchat.com/add/prestigeavenuee", Icon: SnapchatIcon },
  { label: "TikTok", handle: "_prestigeavenue", href: "https://tiktok.com/@_prestigeavenue", Icon: TikTokIcon },
  { label: "Facebook", handle: "prestigeavenuee", href: "https://facebook.com/prestigeavenuee", Icon: FacebookIcon },
] as const;
