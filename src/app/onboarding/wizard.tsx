"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Icon } from "@/components/icon";
import { completeOnboarding } from "./actions";

interface IndustryOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const AUTONOMY_OPTIONS = [
  { id: "advise", name: "Advise", body: "Agents recommend. You decide and do everything yourself." },
  { id: "assist", name: "Assist", body: "Agents prepare ready-to-use drafts. Actions wait for your approval.", recommended: true },
  { id: "autopilot", name: "Autopilot", body: "Agents complete low-risk work automatically. Money, legal and regulators still need you." },
];

const STEPS = ["Your business", "Size & focus", "Goals & autonomy"];

export function OnboardingWizard(props: {
  firstName: string;
  industries: IndustryOption[];
  countries: string[];
  teamSizes: string[];
  revenueBands: string[];
  goalOptions: string[];
}) {
  const [state, formAction, pending] = useActionState(completeOnboarding, {});
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [country, setCountry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [revenue, setRevenue] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [autonomy, setAutonomy] = useState("assist");

  const canContinue = [
    businessName.trim() && industryId && country,
    teamSize && revenue,
    true,
  ][step];

  const toggleGoal = (goal: string) =>
    setGoals((g) => (g.includes(goal) ? g.filter((x) => x !== goal) : [...g, goal]));

  return (
    <form
      action={formAction}
      onKeyDown={(e) => {
        // Enter should advance the wizard, not submit a half-filled form.
        if (e.key === "Enter" && step < STEPS.length - 1 && (e.target as HTMLElement).tagName === "INPUT") {
          e.preventDefault();
          if (canContinue) setStep((s) => s + 1);
        }
      }}
    >
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i < step ? "bg-brand-600 text-white" : i === step ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`hidden text-sm font-medium sm:block ${i === step ? "text-slate-900" : "text-slate-500"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      <section className={step === 0 ? "mt-8" : "hidden"}>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {props.firstName}! Let&apos;s meet your business.</h1>
        <p className="mt-1 text-slate-600">Atlas uses this to assemble the right agents for you.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="businessName" className="label">Business name</label>
            <input id="businessName" name="businessName" className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Lagos Fresh Foods" />
          </div>
          <div>
            <label htmlFor="country" className="label">Where do you operate?</label>
            <select id="country" name="country" className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="" disabled>Select a country</option>
              {props.countries.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <p className="label mt-6">Industry</p>
        <input type="hidden" name="industryId" value={industryId} />
        <div className="grid gap-3 sm:grid-cols-2">
          {props.industries.map((ind) => (
            <button
              type="button"
              key={ind.id}
              onClick={() => setIndustryId(ind.id)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                industryId === ind.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="text-brand-700 [&_svg]:h-5 [&_svg]:w-5"><Icon name={ind.icon} /></span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{ind.name}</span>
                <span className="block text-xs text-slate-500">{ind.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2 */}
      <section className={step === 1 ? "mt-8" : "hidden"}>
        <h2 className="text-2xl font-bold text-slate-900">How big is the business today?</h2>
        <p className="mt-1 text-slate-600">Rough answers are fine — it helps agents pitch advice at the right scale.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="teamSize" className="label">Team size</label>
            <select id="teamSize" name="teamSize" className="input" value={teamSize} onChange={(e) => setTeamSize(e.target.value)}>
              <option value="" disabled>Select</option>
              {props.teamSizes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="monthlyRevenue" className="label">Monthly revenue</label>
            <select id="monthlyRevenue" name="monthlyRevenue" className="input" value={revenue} onChange={(e) => setRevenue(e.target.value)}>
              <option value="" disabled>Select</option>
              {props.revenueBands.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="description" className="label">What does your business do? <span className="font-normal text-slate-400">(optional)</span></label>
          <textarea id="description" name="description" rows={4} maxLength={600} className="input" placeholder="Products or services, customers, what makes you different…" />
        </div>
      </section>

      {/* Step 3 */}
      <section className={step === 2 ? "mt-8" : "hidden"}>
        <h2 className="text-2xl font-bold text-slate-900">What should your AI team focus on?</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {props.goalOptions.map((goal) => (
            <label
              key={goal}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                goals.includes(goal) ? "border-brand-500 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <input type="checkbox" name="goals" value={goal} className="sr-only" checked={goals.includes(goal)} onChange={() => toggleGoal(goal)} />
              {goal}
            </label>
          ))}
        </div>
        <input name="customGoal" className="input mt-3" placeholder="Anything else? e.g. Launch our app in Ghana by December" maxLength={200} />

        <p className="label mt-8">How much autonomy should agents have?</p>
        <input type="hidden" name="autonomy" value={autonomy} />
        <div className="grid gap-3 sm:grid-cols-3">
          {AUTONOMY_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => setAutonomy(opt.id)}
              className={`rounded-xl border p-4 text-left transition ${
                autonomy === opt.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center justify-between text-sm font-semibold text-slate-900">
                {opt.name}
                {opt.recommended && <span className="chip bg-brand-100 text-brand-800">Recommended</span>}
              </span>
              <span className="mt-1 block text-xs text-slate-600">{opt.body}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">You can change this any time in Settings.</p>
      </section>

      {state.error && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>}

      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
        <button type="button" className="btn-ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button key="continue" type="button" className="btn-primary" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button key="submit" type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Assembling your swarm…" : "Launch my AI workforce"}
          </button>
        )}
      </div>
    </form>
  );
}
