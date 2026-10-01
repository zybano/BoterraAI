import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { requireWorkspace } from "@/lib/auth";
import { getAgent } from "@/lib/catalog/agents";
import { getPlan } from "@/lib/catalog/plans";
import { listMissions } from "@/lib/db";
import { effectivePlan } from "@/lib/entitlements";
import { AgentAvatar } from "@/components/agent-avatar";
import { AutoRefresh } from "@/components/auto-refresh";
import { relativeTime } from "@/components/relative-time";
import { StatusBadge } from "@/components/status-badge";
import { MissionLauncher } from "../mission-launcher";

export const metadata: Metadata = { title: "Missions" };

export default async function MissionsPage() {
  const { workspace } = await requireWorkspace();
  const missions = await listMissions(workspace.id);
  const allowed = getPlan(effectivePlan(workspace)).missions;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <AutoRefresh active={missions.some((m) => m.status === "running")} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Missions</h1>
        <p className="mt-1 text-slate-600">
          Give Atlas a business goal. It plans the work, assigns departmental agents to run in parallel, and returns one plan with actions for you to approve.
        </p>
      </div>
      <div className="card p-6">
        {allowed ? (
          <MissionLauncher />
        ) : (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Lock className="h-5 w-5 text-slate-400" />
            <p className="flex-1 text-sm text-slate-600">Multi-agent missions are included in Growth and Scale.</p>
            <Link href="/app/billing" className="btn-primary">Upgrade</Link>
          </div>
        )}
      </div>
      {missions.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No missions yet. Your first one takes about a minute.</p>
      ) : (
        <ul className="space-y-3">
          {missions.map((m) => (
            <li key={m.id}>
              <Link href={`/app/missions/${m.id}`} className="card flex flex-col gap-3 p-5 transition hover:border-brand-300 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{m.goal}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {relativeTime(m.createdAt)} · {m.assignments.length} agents · {m.actions.length} actions
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {m.assignments.map((a) => {
                    const agent = getAgent(a.agentId);
                    return agent ? <span key={a.agentId} className="rounded-lg ring-2 ring-white"><AgentAvatar agent={agent} size="sm" /></span> : null;
                  })}
                </div>
                <StatusBadge value={m.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
