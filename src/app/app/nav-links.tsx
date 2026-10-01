"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CreditCard, Inbox, LayoutDashboard, Repeat, Rocket, Settings } from "lucide-react";

const LINKS = [
  { href: "/app", label: "Command Center", icon: LayoutDashboard, exact: true },
  { href: "/app/agents", label: "Agents", icon: Bot },
  { href: "/app/missions", label: "Missions", icon: Rocket },
  { href: "/app/routines", label: "Routines", icon: Repeat },
  { href: "/app/approvals", label: "Approvals", icon: Inbox, badge: "approvals" as const },
  { href: "/app/billing", label: "Plan & billing", icon: CreditCard },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function NavLinks({ pendingApprovals }: { pendingApprovals: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {LINKS.map(({ href, label, icon: IconCmp, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <IconCmp className="h-4 w-4" />
            <span>{label}</span>
            {badge && pendingApprovals > 0 && (
              <span className="ml-auto rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold text-ink-950">{pendingApprovals}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
