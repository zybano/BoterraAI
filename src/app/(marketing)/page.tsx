import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { AGENTS, agentsByDepartment, getAgent } from "@/lib/catalog/agents";
import { INDUSTRIES } from "@/lib/catalog/industries";
import { DIFFERENTIATORS } from "@/lib/catalog/benchmark";
import { PLANS, TRIAL_DAYS } from "@/lib/catalog/plans";
import { DEPARTMENTS } from "@/lib/catalog/agents";
import { AgentAvatar } from "@/components/agent-avatar";
import { Icon } from "@/components/icon";

const MISSION_PREVIEW = [
  { id: "vision", task: "Pricing & positioning review", state: "done" },
  { id: "quinn", task: "Cash-flow impact forecast", state: "done" },
  { id: "nova", task: "90-day campaign plan", state: "working" },
  { id: "sentinel", task: "Licence check for new location", state: "working" },
] as const;

const STEPS = [
  { title: "Onboard in 3 minutes", body: "Tell us about your business, industry and goals. No integrations required to start." },
  { title: "Atlas assembles your swarm", body: "Your Chief of Staff agent picks the right departmental agents and routines for your industry." },
  { title: "Delegate missions & routines", body: "Chat with any agent, launch multi-agent missions, or schedule recurring monitoring." },
  { title: "Approve, track, scale", body: "Review proposed actions in one inbox. Everything is logged. Turn up autonomy as trust grows." },
];

export default function HomePage() {
  const liveIndustries = INDUSTRIES.filter((i) => i.id !== "general");
  return (
    <>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden text-white">
        <div className="grid-fade absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-2 lg:pt-24">
          <div>
            <span className="chip border border-brand-400/30 bg-brand-400/10 text-brand-200">
              <Sparkles className="h-3.5 w-3.5" /> The agentic operating system for SMEs
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your business,
              <br />
              run by an <span className="bg-gradient-to-r from-brand-300 to-gold-400 bg-clip-text text-transparent">AI workforce</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Boterra AI gives small and medium businesses a coordinated swarm of {AGENTS.length} specialist agents —
              executive, finance, operations, sales, HR, legal and compliance — working together to monitor, run and scale your company.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                Start free — {TRIAL_DAYS}-day full trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/agents" className="btn border border-white/20 px-6 py-3 text-base text-white hover:bg-white/10">
                Meet the agents
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">No credit card required · Free plan forever · Cancel anytime</p>
          </div>

          {/* Mission preview */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur sm:p-6">
            <div className="flex items-center gap-3">
              <AgentAvatar agent={getAgent("atlas")!} />
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-300">Mission · launched by Atlas</p>
                <p className="font-semibold">Open a second location by Q3</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {MISSION_PREVIEW.map((row) => {
                const agent = getAgent(row.id)!;
                return (
                  <div key={row.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                    <AgentAvatar agent={agent} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{agent.name} <span className="text-slate-400">· {agent.title}</span></p>
                      <p className="truncate text-xs text-slate-400">{row.task}</p>
                    </div>
                    {row.state === "done" ? (
                      <CheckCircle2 className="h-5 w-5 text-brand-400" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 rounded-xl border border-gold-400/30 bg-gold-400/10 p-3 text-sm">
              <p className="font-medium text-gold-400">2 actions waiting for your approval</p>
              <p className="text-xs text-slate-300">Sign supplier quote (Vendor · high risk) · Publish launch campaign (Nova · medium)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 text-center sm:px-6 md:grid-cols-4">
          {[
            [AGENTS.length, "specialist agents"],
            [DEPARTMENTS.length, "departments covered"],
            [liveIndustries.length, "industry packs"],
            [`${TRIAL_DAYS} days`, "full-access free trial"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Every department, staffed</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything it takes to run a full business</h2>
          <p className="mt-4 text-slate-600">
            Most AI tools stop at marketing. Boterra covers the whole organisation chart — including the back-office work that keeps owners up at night.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agentsByDepartment().map(({ department, agents }) => (
            <div key={department.id} className="card p-5">
              <span className={`chip ${department.accent}`}>{department.name}</span>
              <p className="mt-3 text-sm text-slate-600">{department.tagline}</p>
              <div className="mt-4 space-y-2">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3">
                    <AgentAvatar agent={agent} size="sm" />
                    <p className="text-sm">
                      <span className="font-semibold text-slate-900">{agent.name}</span>{" "}
                      <span className="text-slate-500">· {agent.title}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">From sign-up to a working AI team in minutes</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl bg-slate-50 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Why Boterra stands out</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Not another chatbot. A management system.</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-8">
          <Link href="/compare" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            See how we compare with Symphony, Sintra and others <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-ink-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Industry packs</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Tuned for your industry, on day one</h2>
              <p className="mt-4 text-slate-400">KPIs, regulations and routines pre-configured — and new verticals ship continuously.</p>
            </div>
            <Link href="/industries" className="btn-light">Explore industries</Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {liveIndustries.map((industry) => (
              <div key={industry.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-brand-300 [&_svg]:h-6 [&_svg]:w-6"><Icon name={industry.icon} /></span>
                  {industry.status !== "live" && (
                    <span className="chip bg-white/10 text-slate-300">{industry.status === "beta" ? "Beta" : "Coming soon"}</span>
                  )}
                </div>
                <h3 className="mt-3 font-semibold">{industry.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="card overflow-hidden lg:grid lg:grid-cols-2">
          <div className="p-8 sm:p-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Start free. Scale when you&apos;re ready.</h2>
            <p className="mt-4 text-slate-600">
              Every new workspace gets {TRIAL_DAYS} days of the full Scale plan, then keeps a free Starter team forever.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              {PLANS.slice(0, 3).map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-brand-600" />
                  <span className="font-semibold">{p.name}</span> —{" "}
                  {p.priceMonthly === 0 ? "free" : `$${p.priceMonthly}/mo`} · {p.tagline}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">Create your workspace</Link>
              <Link href="/pricing" className="btn-secondary">Compare plans</Link>
            </div>
          </div>
          <div className="hero-glow flex items-center p-8 text-white sm:p-10">
            <blockquote>
              <p className="text-xl font-medium leading-relaxed">
                “It&apos;s like hiring a CFO, an operations manager and a compliance officer for less than the cost of one part-time assistant.”
              </p>
              <footer className="mt-4 text-sm text-slate-400">The promise we build Boterra around</footer>
            </blockquote>
          </div>
        </div>
      </section>
    </>
  );
}
