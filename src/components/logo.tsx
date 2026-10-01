import Link from "next/link";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="boterra-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d3a6" />
          <stop offset="1" stopColor="#04785e" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#boterra-g)" />
      <circle cx="16" cy="16" r="4" fill="#fff" />
      <circle cx="8.5" cy="9" r="2.2" fill="#fff" opacity=".85" />
      <circle cx="23.5" cy="9" r="2.2" fill="#fff" opacity=".85" />
      <circle cx="8.5" cy="23" r="2.2" fill="#fff" opacity=".85" />
      <circle cx="23.5" cy="23" r="2.2" fill="#fbbf24" />
      <path d="M10 10.5 14 14M22 10.5 18 14M10 21.5 14 18M22 21.5 18 18" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function Logo({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <LogoMark />
      <span className={`text-lg font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
        Boterra<span className="text-brand-500"> AI</span>
      </span>
    </Link>
  );
}
