"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import type { Plan } from "@/lib/catalog/plans";

function ctaHref(plan: Plan) {
  return plan.id === "enterprise" ? "mailto:sales@boterra.ai" : `/signup?plan=${plan.id}`;
}

export function PricingTable({ plans }: { plans: Plan[] }) {
  const [yearly, setYearly] = useState(true);
  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-medium">
          <button type="button" onClick={() => setYearly(false)} className={`rounded-lg px-4 py-2 ${!yearly ? "bg-slate-900 text-white" : "text-slate-600"}`}>
            Monthly
          </button>
          <button type="button" onClick={() => setYearly(true)} className={`rounded-lg px-4 py-2 ${yearly ? "bg-slate-900 text-white" : "text-slate-600"}`}>
            Yearly <span className="ml-1 text-xs text-brand-500">save 20%</span>
          </button>
        </div>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          return (
            <div
              key={plan.id}
              className={`card relative flex flex-col p-6 ${plan.highlighted ? "border-brand-500 ring-2 ring-brand-500" : ""}`}
            >
              {plan.highlighted && (
                <span className="chip absolute -top-3 left-6 bg-brand-600 text-white">Most popular</span>
              )}
              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-1 min-h-10 text-sm text-slate-500">{plan.tagline}</p>
              <p className="mt-5">
                {price === null ? (
                  <span className="text-3xl font-bold text-slate-900">Custom</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-slate-900">${price}</span>
                    <span className="text-sm text-slate-500"> / month</span>
                  </>
                )}
              </p>
              <p className="mt-1 h-5 text-xs text-slate-500">
                {price ? (yearly ? "billed annually" : "billed monthly") : price === 0 ? "free forever" : ""}
              </p>
              <Link href={ctaHref(plan)} className={`mt-6 ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}>
                {plan.cta}
              </Link>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
