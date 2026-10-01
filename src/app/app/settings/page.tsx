import type { Metadata } from "next";
import { requireWorkspace } from "@/lib/auth";
import { INDUSTRIES } from "@/lib/catalog/industries";
import { planIncludes } from "@/lib/catalog/plans";
import { COUNTRIES } from "@/lib/catalog/regions";
import { effectivePlan } from "@/lib/entitlements";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

const INTEGRATIONS = [
  { name: "QuickBooks", category: "Accounting", agents: "Ledger, Quinn, Pulse" },
  { name: "Xero", category: "Accounting", agents: "Ledger, Quinn, Pulse" },
  { name: "Stripe", category: "Payments", agents: "Tally, Quinn" },
  { name: "Paystack / Flutterwave", category: "Payments", agents: "Tally, Quinn" },
  { name: "Shopify", category: "Commerce", agents: "Stock, Nova, Haven" },
  { name: "Google Workspace", category: "Email & calendar", agents: "Ada, Docket" },
  { name: "Microsoft 365", category: "Email & calendar", agents: "Ada, Docket" },
  { name: "WhatsApp Business", category: "Messaging", agents: "Haven, Hunter" },
  { name: "Slack", category: "Team chat", agents: "Atlas" },
  { name: "HubSpot", category: "CRM", agents: "Hunter, Loyal" },
];

export default async function SettingsPage() {
  const { workspace } = await requireWorkspace();
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <section className="card p-6">
        <h2 className="mb-5 font-semibold text-slate-900">Business profile</h2>
        <SettingsForm
          businessName={workspace.businessName}
          description={workspace.description}
          country={workspace.country}
          industryId={workspace.industryId}
          autonomy={workspace.autonomy}
          autopilotAllowed={planIncludes(effectivePlan(workspace), "scale")}
          countries={COUNTRIES.map((c) => c.name)}
          industries={INDUSTRIES.map(({ id, name }) => ({ id, name }))}
        />
      </section>
      <section id="integrations" className="card p-6">
        <h2 className="font-semibold text-slate-900">Integrations</h2>
        <p className="mt-1 text-sm text-slate-600">
          Connect your tools so agents can work with live data. Connectors are rolling out over the coming releases.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {INTEGRATIONS.map((i) => (
            <li key={i.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{i.name}</p>
                <p className="text-xs text-slate-500">{i.category} · powers {i.agents}</p>
              </div>
              <span className="chip shrink-0 bg-slate-100 text-slate-600">Coming soon</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
