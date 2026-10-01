import type { Metadata } from "next";
import { requireWorkspace } from "@/lib/auth";
import { getAgent } from "@/lib/catalog/agents";
import { getPlan } from "@/lib/catalog/plans";
import { listRoutines } from "@/lib/db";
import { canUseAgent, effectivePlan } from "@/lib/entitlements";
import { AgentAvatar } from "@/components/agent-avatar";
import { Markdown } from "@/components/markdown";
import { relativeTime } from "@/components/relative-time";
import { toggleRoutine } from "../actions";
import { RunRoutineButton } from "./run-button";

export const metadata: Metadata = { title: "Routines" };

export default async function RoutinesPage() {
  const { workspace } = await requireWorkspace();
  const routines = await listRoutines(workspace.id);
  const limit = getPlan(effectivePlan(workspace)).routines;
  const enabledCount = routines.filter((r) => r.enabled).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Routines</h1>
        <p className="mt-1 text-slate-600">
          Recurring work your agents do to keep the business monitored — briefings, cash checks, compliance scans and more.
          Your plan allows <strong>{limit}</strong> active routine{limit === 1 ? "" : "s"} ({enabledCount} active).
        </p>
      </div>
      <ul className="space-y-4">
        {routines.map((routine) => {
          const agent = getAgent(routine.agentId)!;
          const unlocked = canUseAgent(workspace, agent);
          const canEnable = routine.enabled || enabledCount < limit;
          return (
            <li key={routine.id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <AgentAvatar agent={agent} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{routine.name}</p>
                  <p className="text-sm text-slate-500">
                    {agent.name} · runs {routine.cadence} · {routine.lastRunAt ? `last run ${relativeTime(routine.lastRunAt)}` : "never run"}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <form action={toggleRoutine.bind(null, routine.id, !routine.enabled)}>
                    <button
                      className={`btn px-3 py-2 text-xs ${routine.enabled ? "bg-brand-50 text-brand-800" : "border border-slate-200 text-slate-600"}`}
                      disabled={!canEnable}
                      title={canEnable ? undefined : "Upgrade to enable more routines"}
                    >
                      {routine.enabled ? "Active" : "Paused"}
                    </button>
                  </form>
                  {unlocked ? (
                    <RunRoutineButton routineId={routine.id} />
                  ) : (
                    <span className="chip bg-slate-100 text-slate-600">Requires {getPlan(agent.minPlan).name}</span>
                  )}
                </div>
              </div>
              {routine.lastOutput && (
                <details className="mt-4 rounded-xl bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">Latest report</summary>
                  <div className="mt-3"><Markdown>{routine.lastOutput}</Markdown></div>
                </details>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-slate-500">
        Scheduled execution: call <code>POST /api/cron/routines</code> from your scheduler (e.g. Vercel Cron) to run due routines automatically.
      </p>
    </div>
  );
}
