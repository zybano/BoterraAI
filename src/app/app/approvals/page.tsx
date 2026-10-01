import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { requireWorkspace } from "@/lib/auth";
import { getAgent } from "@/lib/catalog/agents";
import { listApprovals } from "@/lib/db";
import { AgentAvatar } from "@/components/agent-avatar";
import { relativeTime } from "@/components/relative-time";
import { StatusBadge } from "@/components/status-badge";
import { decide } from "../actions";

export const metadata: Metadata = { title: "Approvals" };

const AUTONOMY_COPY = {
  advise: "Advise — agents only recommend; every action needs you.",
  assist: "Assist — agents prepare drafts; every action waits for your approval.",
  autopilot: "Autopilot — low-risk actions are approved automatically; medium and high risk wait for you.",
};

export default async function ApprovalsPage() {
  const { workspace } = await requireWorkspace();
  const approvals = await listApprovals(workspace.id);
  const pending = approvals.filter((a) => a.status === "pending");
  const history = approvals.filter((a) => a.status !== "pending");

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Approval inbox</h1>
        <p className="mt-1 text-slate-600">
          Current mode: <strong>{AUTONOMY_COPY[workspace.autonomy]}</strong>{" "}
          <Link href="/app/settings" className="text-brand-700 hover:underline">Change</Link>
        </p>
      </div>

      <section className="card">
        <h2 className="border-b border-slate-100 px-6 py-4 font-semibold text-slate-900">Waiting for you ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">You&apos;re all caught up.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pending.map((a) => {
              const agent = getAgent(a.agentId)!;
              return (
                <li key={a.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                  <AgentAvatar agent={agent} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">
                      Proposed by {agent.name} · {relativeTime(a.createdAt)}
                      {a.missionId && (
                        <> · <Link href={`/app/missions/${a.missionId}`} className="text-brand-700 hover:underline">view mission</Link></>
                      )}
                    </p>
                  </div>
                  <StatusBadge value={a.risk} suffix=" risk" />
                  <div className="flex gap-2">
                    <form action={decide.bind(null, a.id, "rejected")}>
                      <button className="btn-secondary px-3 py-2 text-xs"><X className="h-3.5 w-3.5" /> Reject</button>
                    </form>
                    <form action={decide.bind(null, a.id, "approved")}>
                      <button className="btn-primary px-3 py-2 text-xs"><Check className="h-3.5 w-3.5" /> Approve</button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {history.length > 0 && (
        <section className="card">
          <h2 className="border-b border-slate-100 px-6 py-4 font-semibold text-slate-900">Decision log</h2>
          <ul className="divide-y divide-slate-100">
            {history.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-6 py-3">
                <p className="min-w-0 flex-1 truncate text-sm text-slate-700">{a.title}</p>
                <span className="hidden text-xs text-slate-500 sm:inline">{a.decidedAt ? relativeTime(a.decidedAt) : ""}</span>
                <StatusBadge value={a.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
