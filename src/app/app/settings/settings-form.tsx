"use client";

import { useActionState } from "react";
import { saveSettings } from "../actions";

export function SettingsForm(props: {
  businessName: string;
  description: string;
  country: string;
  industryId: string;
  autonomy: string;
  autopilotAllowed: boolean;
  countries: string[];
  industries: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(saveSettings, {});
  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="businessName" className="label">Business name</label>
          <input id="businessName" name="businessName" defaultValue={props.businessName} className="input" required />
        </div>
        <div>
          <label htmlFor="country" className="label">Country / jurisdiction</label>
          <select id="country" name="country" defaultValue={props.country} className="input">
            {props.countries.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="industryId" className="label">Industry pack</label>
        <select id="industryId" name="industryId" defaultValue={props.industryId} className="input">
          {props.industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <p className="mt-1 text-xs text-slate-500">Changing industry resets your recommended agents and routines.</p>
      </div>
      <div>
        <label htmlFor="description" className="label">About the business</label>
        <textarea id="description" name="description" rows={4} maxLength={600} defaultValue={props.description} className="input" />
      </div>
      <fieldset>
        <legend className="label">Agent autonomy</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["advise", "Advise", "Recommendations only"],
            ["assist", "Assist", "Drafts; actions need approval"],
            ["autopilot", "Autopilot", props.autopilotAllowed ? "Low-risk work runs automatically" : "Requires the Scale plan"],
          ].map(([value, name, body]) => (
            <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input type="radio" name="autonomy" value={value} defaultChecked={props.autonomy === value} disabled={value === "autopilot" && !props.autopilotAllowed} className="mt-1 accent-brand-600" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{name}</span>
                <span className="block text-xs text-slate-500">{body}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {state.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}
      {state.ok && <p className="text-sm text-brand-700">{state.ok}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
