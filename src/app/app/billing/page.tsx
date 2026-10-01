import type { Metadata } from "next";
import { Check } from "lucide-react";
import { requireWorkspace } from "@/lib/auth";
import { PLANS, getPlan } from "@/lib/catalog/plans";
import { creditStatus, effectivePlan, isTrialing, trialDaysLeft } from "@/lib/entitlements";
import { changePlan } from "../actions";

export const metadata: Metadata = { title: "Plan & billing" };

export default async function BillingPage({ searchParams }: PageProps<"/app/billing">) {
  const { cycle: cycleParam } = await searchParams;
  const { workspace } = await requireWorkspace();
  const cycle = cycleParam === "monthly" ? "monthly" : "yearly";
  const trialing = isTrialing(workspace);
  const current = getPlan(workspace.plan);
  const credits = creditStatus(workspace);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plan & billing</h1>
        <p className="mt-1 text-slate-600">
          {trialing ? (
            <>You&apos;re on a free trial of <strong>Scale</strong> — {trialDaysLeft(workspace)} days left. Afterwards you&apos;ll move to <strong>{current.name}</strong> unless you choose a plan.</>
          ) : (
            <>You&apos;re on the <strong>{current.name}</strong> plan ({workspace.billingCycle}).</>
          )}{" "}
          {credits.remaining.toLocaleString()} of {credits.limit.toLocaleString()} credits remaining this month.
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-medium">
        <a href="?cycle=monthly" className={`rounded-lg px-4 py-2 ${cycle === "monthly" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Monthly</a>
        <a href="?cycle=yearly" className={`rounded-lg px-4 py-2 ${cycle === "yearly" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Yearly · save 20%</a>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === workspace.plan && !(trialing && plan.id === "free");
          const price = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
          return (
            <div key={plan.id} className={`card flex flex-col p-6 ${plan.id === effectivePlan(workspace) ? "ring-2 ring-brand-500" : ""}`}>
              <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {price === null ? "Custom" : `$${price}`}
                {price ? <span className="text-sm font-normal text-slate-500"> / mo</span> : null}
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {plan.id === "enterprise" ? (
                  <a href="mailto:sales@boterra.ai" className="btn-secondary w-full">Talk to sales</a>
                ) : isCurrent && workspace.billingCycle === cycle ? (
                  <span className="btn w-full bg-slate-100 text-slate-500">Current plan</span>
                ) : (
                  <form action={changePlan.bind(null, plan.id, cycle)}>
                    <button className={`w-full ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}>
                      {plan.id === "free" ? "Switch to Starter" : `Choose ${plan.name}`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Demo billing: plan changes apply instantly without payment. Connect Stripe, Paystack or Flutterwave in production — see README.
      </p>
    </div>
  );
}
