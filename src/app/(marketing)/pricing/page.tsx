import type { Metadata } from "next";
import { AGENTS } from "@/lib/catalog/agents";
import { PLANS, TRIAL_DAYS, planIncludes } from "@/lib/catalog/plans";
import { PricingTable } from "@/components/pricing-table";

export const metadata: Metadata = { title: "Pricing" };

const FAQ = [
  {
    q: "How does the free trial work?",
    a: `Every new workspace gets the full Scale plan for ${TRIAL_DAYS} days — all agents, missions and autopilot. No card needed. Afterwards you keep the free Starter team unless you upgrade.`,
  },
  {
    q: "What is an AI credit?",
    a: "One message to an agent uses 1 credit, a scheduled routine run uses 2 and a multi-agent mission uses 5. Credits reset every month.",
  },
  {
    q: "Do the agents take actions on my behalf?",
    a: "Only as far as you allow. In Advise mode they recommend; in Assist mode they prepare drafts; in Autopilot they complete low-risk work. Anything involving money, legal commitments or regulators always waits for your approval.",
  },
  {
    q: "Is Boterra a replacement for my lawyer or accountant?",
    a: "No — it makes them cheaper. Agents handle the groundwork, drafts and checklists, and flag where a licensed professional should sign off.",
  },
  {
    q: "Can I pay in my local currency?",
    a: "USD card billing is live. Local-currency and mobile-money billing for emerging markets is on our roadmap.",
  },
];

export default function PricingPage() {
  const tiers = PLANS.filter((p) => p.id !== "enterprise");
  return (
    <>
      <section className="hero-glow py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Simple pricing for a whole AI team</h1>
          <p className="mt-4 text-lg text-slate-300">
            Less than the cost of one part-time hire. Start with a {TRIAL_DAYS}-day full trial, keep a free team forever.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <PricingTable plans={PLANS} />

        <h2 className="mt-20 text-2xl font-bold text-slate-900">Which agents come with each plan</h2>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="p-4 font-semibold text-slate-900">Agent</th>
                {tiers.map((p) => (
                  <th key={p.id} className="p-4 text-center font-semibold text-slate-900">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((agent) => (
                <tr key={agent.id} className="border-b border-slate-100 last:border-0">
                  <td className="p-4">
                    <span className="font-medium text-slate-900">{agent.name}</span>{" "}
                    <span className="text-slate-500">· {agent.title}</span>
                  </td>
                  {tiers.map((p) => (
                    <td key={p.id} className="p-4 text-center">
                      {planIncludes(p.id, agent.minPlan) ? <span className="text-brand-600">●</span> : <span className="text-slate-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-20 text-2xl font-bold text-slate-900">Frequently asked questions</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.q} className="card p-6">
              <h3 className="font-semibold text-slate-900">{item.q}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
