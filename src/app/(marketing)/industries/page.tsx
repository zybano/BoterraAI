import type { Metadata } from "next";
import Link from "next/link";
import { getAgent } from "@/lib/catalog/agents";
import { INDUSTRIES } from "@/lib/catalog/industries";
import { AgentAvatar } from "@/components/agent-avatar";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Industry packs" };

const STATUS_LABEL = { live: "Live", beta: "Beta", "coming-soon": "Coming soon" } as const;
const STATUS_STYLE = {
  live: "bg-brand-100 text-brand-800",
  beta: "bg-amber-100 text-amber-800",
  "coming-soon": "bg-slate-100 text-slate-600",
} as const;

export default function IndustriesPage() {
  return (
    <>
      <section className="hero-glow py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Industry packs</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            One click tunes your swarm to your sector: the right agents, the KPIs that matter, the regulations to track and
            routines that run on autopilot. We&apos;re adding new verticals every month.
          </p>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2">
        {INDUSTRIES.map((industry) => (
          <article key={industry.id} className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 [&_svg]:h-6 [&_svg]:w-6">
                  <Icon name={industry.icon} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{industry.name}</h2>
                  <p className="text-sm text-slate-500">{industry.examples.join(" · ")}</p>
                </div>
              </div>
              <span className={`chip ${STATUS_STYLE[industry.status]}`}>{STATUS_LABEL[industry.status]}</span>
            </div>
            <p className="mt-4 text-sm text-slate-700">{industry.description}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">KPIs monitored</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {industry.kpis.map((k) => <li key={k}>• {k}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Compliance tracked</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {industry.complianceFocus.map((c) => <li key={c}>• {c}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recommended swarm</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {industry.recommendedAgents.map((id) => {
                  const agent = getAgent(id)!;
                  return (
                    <span key={id} className="flex items-center gap-1.5 rounded-full border border-slate-200 py-1 pr-3 pl-1 text-xs font-medium text-slate-700">
                      <AgentAvatar agent={agent} size="sm" /> {agent.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Don&apos;t see your industry?</h2>
          <p className="max-w-xl text-slate-600">Pick “Other / General SME” — the swarm adapts to what you tell it during onboarding.</p>
          <Link href="/signup" className="btn-primary">Get started free</Link>
        </div>
      </div>
    </>
  );
}
