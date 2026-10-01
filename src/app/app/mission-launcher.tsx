"use client";

import { useActionState, useState } from "react";
import { Rocket } from "lucide-react";
import { launchMission } from "./actions";

const EXAMPLES = [
  "Increase revenue 20% next quarter without raising prices",
  "Get us ready to apply for a bank loan",
  "Cut operating costs by 10% this year",
  "Prepare to hire our first two employees",
];

export function MissionLauncher({ compact = false }: { compact?: boolean }) {
  const [state, formAction, pending] = useActionState(launchMission, {});
  const [goal, setGoal] = useState("");
  return (
    <form action={formAction}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="input flex-1 py-3"
          placeholder="Give Atlas a goal, e.g. “Win 50 new customers this quarter”"
          maxLength={500}
          required
        />
        <button className="btn-primary py-3" disabled={pending}>
          <Rocket className="h-4 w-4" /> {pending ? "Briefing agents…" : "Launch mission"}
        </button>
      </div>
      {state.error && <p className="mt-2 text-sm text-red-600" role="alert">{state.error}</p>}
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button type="button" key={ex} onClick={() => setGoal(ex)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700">
              {ex}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
