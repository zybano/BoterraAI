import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Inbox, Lock, PartyPopper, Plug, Repeat, Rocket, Users } from "lucide-react";
import { requireWorkspace } from "@/lib/auth";
import { getAgent, ORCHESTRATOR_ID } from "@/lib/catalog/agents";
import { getIndustry } from "@/lib/catalog/industries";
import { listActivity, listApprovals, listMissions, listRoutines } from "@/lib/db";
import { canUseAgent, creditStatus } from "@/lib/entitlements";
import { AgentAvatar } from "@/components/agent-avatar";
import { relativeTime } from "@/components/relative-time";
import { MissionLauncher } from "./mission-launcher";

export const metadata: Metadata = { title: "Command Center" };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default async function CommandCenter({ searchParams }: PageProps<"/app">) {
  const { welcome } = await searchParams;
  const { user, workspace } = await requireWorkspace();
  const [missions, approvals, routines, activity] = await Promise.all([
    listMissions(workspace.id),
    listApprovals(workspace.id),
    listRoutines(workspace.id),
    listActivity(workspace.id, 12),
  ]);
  const industry = getIndustry(workspace.industryId);
  const pending = approvals.filter((a) => a.status === "pending");
  const credits = creditStatus(workspace);
  const swarm = workspace.activeAgentIds.map((id) => getAgent(id)!).filter(Boolean);

  const stats = [
    { label: "Agents on your team", value: swarm.length, icon: Users, href: "/app/agents" },
    { label: "Missions completed", value: missions.filter((m) => m.status === "completed").length, icon: Rocket, href: "/app/missions" },
    { label: "Awaiting your approval", value: pending.length, icon: Inbox, href: "/app/approvals" },
    { label: "Active routines", value: routines.filter((r) => r.enabled).length, icon: Repeat, href: "/app/routines" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      {welcome && (
        <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          <PartyPopper className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>Your AI workforce is live.</strong> Atlas assembled {swarm.length} agents and {routines.length} routines for {industry.name}.
            Try launching your first mission below, or say hello to any agent.
          </p>
        </div>
      )}

      <div className="card p-6">
        <p className="text-sm text-slate-500">{greeting()}, {user.name.split(" ")[0]}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">What should your team achieve next?</h1>
        <div className="mt-5">
          <MissionLauncher />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: StatIcon, href }) => (
          <Link key={label} href={href} className="card p-5 transition hover:border-brand-300">
            <StatIcon className="h-5 w-5 text-brand-600" />
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Your swarm</h2>
            <Link href="/app/agents" className="text-sm font-medium text-brand-700 hover:underline">Manage agents</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {swarm.map((agent) => {
              const locked = !canUseAgent(workspace, agent);
              return (
                <Link
                  key={agent.id}
                  href={locked ? "/app/billing" : `/app/agents/${agent.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <AgentAvatar agent={agent} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      {agent.name}
                      {agent.id === ORCHESTRATOR_ID && <span className="chip bg-violet-100 text-violet-700">Lead</span>}
                    </p>
                    <p className="truncate text-xs text-slate-500">{agent.title}</p>
                  </div>
                  {locked ? <Lock className="h-4 w-4 text-slate-400" /> : <span className="h-2 w-2 rounded-full bg-brand-500" title="Online" />}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-semibold text-slate-900">Needs your attention</h2>
          {pending.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Nothing waiting. Actions proposed by missions will appear here for approval.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pending.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <AgentAvatar agent={getAgent(a.agentId)!} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.risk} risk · {relativeTime(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/app/approvals" className="btn-secondary mt-5 w-full">
            Open approval inbox <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Activity & audit trail</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {activity.map((event) => {
              const agent = event.agentId ? getAgent(event.agentId) : undefined;
              return (
                <li key={event.id} className="flex items-start gap-3 py-3">
                  {agent ? <AgentAvatar agent={agent} size="sm" /> : <span className="h-8 w-8 shrink-0 rounded-lg bg-slate-100" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800">{event.message}</p>
                    <p className="text-xs text-slate-500">{relativeTime(event.at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900">KPIs your swarm watches</h2>
            <ul className="mt-3 space-y-2">
              {industry.kpis.map((kpi) => (
                <li key={kpi} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{kpi}</span>
                  <span className="text-xs text-slate-400">awaiting data</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <Plug className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Connect accounting, POS and payments in <Link href="/app/settings#integrations" className="font-medium text-brand-700 hover:underline">Settings</Link> so Pulse can track these live.</span>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900">AI credits</h2>
            <p className="mt-2 text-sm text-slate-600">
              {credits.used.toLocaleString()} of {credits.limit.toLocaleString()} used this month
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (credits.used / credits.limit) * 100)}%` }} />
            </div>
            <Link href="/app/billing" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">View plans</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
