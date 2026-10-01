import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { COMPETITORS, DIFFERENTIATORS } from "@/lib/catalog/benchmark";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "Why Boterra" };

const MATRIX: { capability: string; boterra: boolean; others: string }[] = [
  { capability: "Marketing, social & content agents", boterra: true, others: "Common" },
  { capability: "Finance: bookkeeping, CFO, collections, tax", boterra: true, others: "Rare" },
  { capability: "Legal & contracts agents", boterra: true, others: "Rare" },
  { capability: "Regulatory compliance & data-privacy agents", boterra: true, others: "Rare" },
  { capability: "HR, recruiting & payroll agents", boterra: true, others: "Partial" },
  { capability: "Orchestrator that delegates multi-agent missions", boterra: true, others: "Some" },
  { capability: "Autonomy levels + approval inbox + audit trail", boterra: true, others: "Rare" },
  { capability: "Industry packs (KPIs, regulations, routines)", boterra: true, others: "Rare" },
  { capability: "Jurisdiction-aware guidance for emerging markets", boterra: true, others: "Rare" },
  { capability: "Free plan + full-access trial", boterra: true, others: "Varies" },
];

export default function ComparePage() {
  return (
    <>
      <section className="hero-glow py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Why Boterra AI</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            We benchmarked the leading AI-workforce products for small businesses. They&apos;re great at marketing.
            Boterra is built to run the <em>whole</em> business.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">The landscape</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {COMPETITORS.map((c) => (
            <div key={c.name} className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900">{c.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.positioning}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div><dt className="inline font-medium text-slate-900">Pricing: </dt><dd className="inline text-slate-600">{c.pricing}</dd></div>
                <div><dt className="inline font-medium text-slate-900">Strengths: </dt><dd className="inline text-slate-600">{c.strengths}</dd></div>
                <div><dt className="inline font-medium text-slate-900">Gap we fill: </dt><dd className="inline text-slate-600">{c.gap}</dd></div>
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Based on public product information, October 2026. Competitor offerings change often.</p>

        <h2 className="mt-16 text-2xl font-bold text-slate-900">Capability comparison</h2>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="p-4 font-semibold text-slate-900">Capability</th>
                <th className="p-4 text-center font-semibold text-brand-700">Boterra AI</th>
                <th className="p-4 text-center font-semibold text-slate-900">Typical alternatives</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row) => (
                <tr key={row.capability} className="border-b border-slate-100 last:border-0">
                  <td className="p-4 text-slate-700">{row.capability}</td>
                  <td className="p-4 text-center">
                    {row.boterra ? <Check className="mx-auto h-5 w-5 text-brand-600" /> : <Minus className="mx-auto h-5 w-5 text-slate-300" />}
                  </td>
                  <td className="p-4 text-center text-slate-500">{row.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-16 text-2xl font-bold text-slate-900">What makes us different</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIATORS.map((d) => (
            <div key={d.title} className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 [&_svg]:h-5 [&_svg]:w-5">
                <Icon name={d.icon} />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{d.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{d.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/signup" className="btn-primary px-6 py-3 text-base">Try the full workforce free</Link>
        </div>
      </div>
    </>
  );
}
