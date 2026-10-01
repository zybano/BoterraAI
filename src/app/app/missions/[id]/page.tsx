import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { requireWorkspace } from "@/lib/auth";
import { getAgent } from "@/lib/catalog/agents";
import { getMission } from "@/lib/db";
import { AgentAvatar } from "@/components/agent-avatar";
import { AutoRefresh } from "@/components/auto-refresh";
import { Markdown } from "@/components/markdown";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Mission" };

export default async function MissionPage({ params }: PageProps<"/app/missions/[id]">) {
  const { id } = await params;
  const { workspace } = await requireWorkspace();
  const mission = await getMission(workspace.id, id);
  if (!mission) notFound();
  const atlas = getAgent("atlas")!;
  const running = mission.status === "running";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <AutoRefresh active={running} />
      <Link href="/app/missions" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> All missions
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mission</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">{mission.goal}</h1>
          </div>
          <StatusBadge value={mission.status} />
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-violet-50 p-4">
          <AgentAvatar agent={atlas} size="sm" />
          <p className="text-sm text-slate-700">
            {mission.plan || (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Atlas is planning the mission and choosing agents…</span>
            )}
          </p>
        </div>
      </div>

      {mission.assignments.length > 0 && (
        <section>
          <h2 className="font-semibold text-slate-900">Workstreams</h2>
          <div className="mt-3 space-y-3">
            {mission.assignments.map((a) => {
              const agent = getAgent(a.agentId)!;
              return (
                <details key={a.agentId} className="card group p-5" open={!running && mission.assignments.length <= 2}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                    <AgentAvatar agent={agent} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{agent.name} <span className="font-normal text-slate-500">· {agent.title}</span></p>
                      <p className="text-sm text-slate-600">{a.task}</p>
                    </div>
                    {a.output ? <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" /> : <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-500" />}
                  </summary>
                  {a.output && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <Markdown>{a.output}</Markdown>
                    </div>
                  )}
                </details>
              );
            })}
          </div>
        </section>
      )}

      {mission.summary && (
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <AgentAvatar agent={atlas} size="sm" />
            <h2 className="font-semibold text-slate-900">Atlas&apos;s executive summary</h2>
          </div>
          <div className="mt-4">
            <Markdown>{mission.summary}</Markdown>
          </div>
        </section>
      )}

      {mission.actions.length > 0 && (
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Proposed actions</h2>
            <Link href="/app/approvals" className="text-sm font-medium text-brand-700 hover:underline">Review in approval inbox</Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {mission.actions.map((action) => {
              const agent = getAgent(action.agentId);
              return (
                <li key={action.id} className="flex items-center gap-3 py-3">
                  {agent && <AgentAvatar agent={agent} size="sm" />}
                  <p className="flex-1 text-sm text-slate-800">{action.title}</p>
                  <StatusBadge value={action.risk} suffix=" risk" />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
