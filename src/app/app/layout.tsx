import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireWorkspace } from "@/lib/auth";
import { getPlan } from "@/lib/catalog/plans";
import { getIndustry } from "@/lib/catalog/industries";
import { listApprovals } from "@/lib/db";
import { creditStatus, effectivePlan, isTrialing, trialDaysLeft } from "@/lib/entitlements";
import { isLiveAI } from "@/lib/ai/claude";
import { Logo } from "@/components/logo";
import { logout } from "../(auth)/actions";
import { NavLinks } from "./nav-links";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const { user, workspace } = await requireWorkspace();
  const pending = (await listApprovals(workspace.id)).filter((a) => a.status === "pending").length;
  const credits = creditStatus(workspace);
  const plan = getPlan(effectivePlan(workspace));
  const trialing = isTrialing(workspace);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex flex-col gap-4 bg-ink-950 p-4 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between">
          <Logo href="/app" dark />
          <form action={logout} className="lg:hidden">
            <button className="rounded-lg p-2 text-slate-400 hover:text-white" aria-label="Log out"><LogOut className="h-4 w-4" /></button>
          </form>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="truncate text-sm font-semibold">{workspace.businessName}</p>
          <p className="truncate text-xs text-slate-400">{getIndustry(workspace.industryId).name} · {workspace.country}</p>
        </div>
        <NavLinks pendingApprovals={pending} />
        <div className="mt-auto hidden space-y-3 lg:block">
          <div className="rounded-xl bg-white/5 p-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>{trialing ? `${plan.name} trial` : `${plan.name} plan`}</span>
              <span>{credits.remaining.toLocaleString()} credits left</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-400" style={{ width: `${Math.min(100, (credits.used / credits.limit) * 100)}%` }} />
            </div>
            {trialing && (
              <Link href="/app/billing" className="mt-2 block text-gold-400 hover:underline">
                {trialDaysLeft(workspace)} trial days left — choose a plan
              </Link>
            )}
          </div>
          {!isLiveAI() && (
            <p className="rounded-xl border border-gold-400/30 bg-gold-400/10 p-3 text-xs text-gold-400">
              Demo mode: agents use sample responses until <code>ANTHROPIC_API_KEY</code> is configured.
            </p>
          )}
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
            <form action={logout}>
              <button className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Log out" title="Log out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-slate-50">{children}</main>
    </div>
  );
}
