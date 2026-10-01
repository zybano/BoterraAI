import type { Metadata } from "next";
import Link from "next/link";
import { Lock, MessageSquare } from "lucide-react";
import { requireWorkspace } from "@/lib/auth";
import { agentsByDepartment, ORCHESTRATOR_ID } from "@/lib/catalog/agents";
import { getPlan } from "@/lib/catalog/plans";
import { canUseAgent } from "@/lib/entitlements";
import { AgentAvatar } from "@/components/agent-avatar";
import { toggleAgent } from "../actions";

export const metadata: Metadata = { title: "Agents" };

export default async function AppAgentsPage() {
  const { workspace } = await requireWorkspace();
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Your AI workforce</h1>
      <p className="mt-1 text-slate-600">
        Add agents to your team so Atlas can include them in missions, or chat with any of them directly.
      </p>
      <div className="mt-8 space-y-10">
        {agentsByDepartment().map(({ department, agents }) => (
          <section key={department.id}>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
              <span className={`chip ${department.accent}`}>{department.name}</span>
            </h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent) => {
                const unlocked = canUseAgent(workspace, agent);
                const active = workspace.activeAgentIds.includes(agent.id);
                return (
                  <div key={agent.id} className={`card flex flex-col p-5 ${unlocked ? "" : "opacity-75"}`}>
                    <div className="flex items-start gap-3">
                      <AgentAvatar agent={agent} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{agent.name}</p>
                        <p className="text-sm text-slate-500">{agent.title}</p>
                      </div>
                      {!unlocked && <Lock className="h-4 w-4 text-slate-400" />}
                    </div>
                    <p className="mt-3 flex-1 text-sm text-slate-600">{agent.summary}</p>
                    <div className="mt-4 flex items-center gap-2">
                      {unlocked ? (
                        <>
                          <Link href={`/app/agents/${agent.id}`} className="btn-primary flex-1 py-2">
                            <MessageSquare className="h-4 w-4" /> Chat
                          </Link>
                          {agent.id !== ORCHESTRATOR_ID && (
                            <form action={toggleAgent.bind(null, agent.id, !active)} className="flex-1">
                              <button className={`w-full py-2 ${active ? "btn-secondary" : "btn-ghost border border-dashed border-slate-300"}`}>
                                {active ? "On team ✓" : "Add to team"}
                              </button>
                            </form>
                          )}
                        </>
                      ) : (
                        <Link href="/app/billing" className="btn-secondary w-full py-2">
                          Unlock with {getPlan(agent.minPlan).name}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
