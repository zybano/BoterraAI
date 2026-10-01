import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { AGENTS, agentsByDepartment } from "@/lib/catalog/agents";
import { getPlan } from "@/lib/catalog/plans";
import { AgentAvatar } from "@/components/agent-avatar";

export const metadata: Metadata = { title: "Agent directory" };

export default function AgentsPage() {
  return (
    <>
      <section className="hero-glow py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Meet your AI workforce</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            {AGENTS.length} specialist agents across every department, coordinated by Atlas, your Chief of Staff.
            Each one knows your business, your industry and your jurisdiction.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6">
        {agentsByDepartment().map(({ department, agents }) => (
          <section key={department.id} id={department.id}>
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{department.name}</h2>
              <p className="text-slate-500">{department.tagline}</p>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <article key={agent.id} className="card flex flex-col p-6">
                  <div className="flex items-start gap-4">
                    <AgentAvatar agent={agent} size="lg" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{agent.name}</h3>
                      <p className="text-sm text-slate-500">{agent.title}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-700">{agent.summary}</p>
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {agent.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {cap}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    Included from <span className="font-semibold text-slate-700">{getPlan(agent.minPlan).name}</span>
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Need an agent we don&apos;t have yet?</h2>
          <p className="max-w-xl text-slate-600">
            Enterprise customers can create custom agents trained on their own playbooks, SOPs and documents.
          </p>
          <Link href="/signup" className="btn-primary">Start with the free team</Link>
        </div>
      </div>
    </>
  );
}
