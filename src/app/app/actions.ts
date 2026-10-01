"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/auth";
import { AGENTS, getAgent } from "@/lib/catalog/agents";
import { getIndustry, INDUSTRIES } from "@/lib/catalog/industries";
import { getPlan, PLANS, type PlanId } from "@/lib/catalog/plans";
import { currencyFor } from "@/lib/catalog/regions";
import {
  decideApproval,
  getWorkspace,
  listRoutines,
  logActivity,
  newId,
  replaceRoutines,
  saveMission,
  updateRoutine,
  updateWorkspace,
  type Autonomy,
  type Mission,
} from "@/lib/db";
import { availableAgents, canUseAgent, consumeCredits, CREDIT_COST, effectivePlan } from "@/lib/entitlements";
import { executeMission } from "@/lib/ai/mission";
import { runAgentOnce } from "@/lib/ai/claude";

export interface ActionState {
  error?: string;
  ok?: string;
}

// ---------- Missions ----------

export async function launchMission(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { workspace } = await requireWorkspace();
  const goal = String(form.get("goal") ?? "").trim().slice(0, 500);
  if (goal.length < 8) return { error: "Describe the goal in a sentence so Atlas can plan it." };
  if (!getPlan(effectivePlan(workspace)).missions) {
    return { error: "Missions are available on Growth and above. Upgrade to let Atlas coordinate multiple agents." };
  }
  if (!(await consumeCredits(workspace, CREDIT_COST.mission))) {
    return { error: "You're out of AI credits for this month. Upgrade your plan to continue." };
  }

  const mission: Mission = {
    id: newId(),
    workspaceId: workspace.id,
    goal,
    status: "running",
    plan: "",
    assignments: [],
    summary: "",
    actions: [],
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  await saveMission(mission);
  await logActivity({ workspaceId: workspace.id, agentId: "atlas", kind: "mission", message: `Mission launched: “${goal}”.` });

  const roster = availableAgents(workspace).filter((a) => workspace.activeAgentIds.includes(a.id));
  after(() => executeMission(mission, workspace, roster.length >= 2 ? roster : availableAgents(workspace)));

  redirect(`/app/missions/${mission.id}`);
}

// ---------- Approvals ----------

export async function decide(approvalId: string, decision: "approved" | "rejected") {
  const { user, workspace } = await requireWorkspace();
  const approval = await decideApproval(workspace.id, approvalId, decision);
  if (approval) {
    await logActivity({
      workspaceId: workspace.id,
      agentId: approval.agentId,
      kind: "approval",
      message: `${user.name} ${decision} “${approval.title}”.`,
    });
  }
  revalidatePath("/app", "layout");
}

// ---------- Routines ----------

export async function runRoutine(routineId: string): Promise<ActionState> {
  const { workspace } = await requireWorkspace();
  const routine = (await listRoutines(workspace.id)).find((r) => r.id === routineId);
  if (!routine) return { error: "Routine not found." };
  const agent = getAgent(routine.agentId);
  if (!agent || !canUseAgent(workspace, agent)) {
    return { error: `${agent?.name ?? "This agent"} isn't included in your current plan.` };
  }
  if (!(await consumeCredits(workspace, CREDIT_COST.routine))) {
    return { error: "You're out of AI credits for this month." };
  }
  try {
    const output = await runAgentOnce(agent, workspace, routine.prompt);
    await updateRoutine(workspace.id, routine.id, { lastRunAt: new Date().toISOString(), lastOutput: output });
    await logActivity({ workspaceId: workspace.id, agentId: agent.id, kind: "routine", message: `${agent.name} ran “${routine.name}”.` });
  } catch {
    return { error: `${agent.name} couldn't complete the routine. Please try again.` };
  }
  revalidatePath("/app", "layout");
  return { ok: "Routine complete." };
}

export async function toggleRoutine(routineId: string, enabled: boolean) {
  const { workspace } = await requireWorkspace();
  const limit = getPlan(effectivePlan(workspace)).routines;
  const enabledCount = (await listRoutines(workspace.id)).filter((r) => r.enabled && r.id !== routineId).length;
  if (enabled && enabledCount >= limit) return;
  await updateRoutine(workspace.id, routineId, { enabled });
  revalidatePath("/app/routines");
}

// ---------- Agents ----------

export async function toggleAgent(agentId: string, active: boolean) {
  const { workspace } = await requireWorkspace();
  if (!AGENTS.some((a) => a.id === agentId) || agentId === "atlas") return;
  const ids = new Set(workspace.activeAgentIds);
  if (active) ids.add(agentId);
  else ids.delete(agentId);
  await updateWorkspace(workspace.id, { activeAgentIds: AGENTS.map((a) => a.id).filter((id) => ids.has(id)) });
  revalidatePath("/app", "layout");
}

// ---------- Settings ----------

const AUTONOMY: Autonomy[] = ["advise", "assist", "autopilot"];

export async function saveSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { workspace } = await requireWorkspace();
  const businessName = String(form.get("businessName") ?? "").trim();
  const description = String(form.get("description") ?? "").trim().slice(0, 600);
  const country = String(form.get("country") ?? workspace.country);
  const autonomy = String(form.get("autonomy") ?? workspace.autonomy) as Autonomy;
  const industryId = String(form.get("industryId") ?? workspace.industryId);

  if (!businessName) return { error: "Business name is required." };
  if (!AUTONOMY.includes(autonomy)) return { error: "Invalid autonomy level." };
  if (autonomy === "autopilot" && effectivePlan(workspace) !== "scale" && effectivePlan(workspace) !== "enterprise") {
    return { error: "Autopilot is available on the Scale plan." };
  }
  if (!INDUSTRIES.some((i) => i.id === industryId)) return { error: "Invalid industry." };

  const industryChanged = industryId !== workspace.industryId;
  await updateWorkspace(workspace.id, {
    businessName,
    description,
    country,
    currency: currencyFor(country),
    autonomy,
    industryId,
    ...(industryChanged ? { activeAgentIds: getIndustry(industryId).recommendedAgents } : {}),
  });
  if (industryChanged) {
    await replaceRoutines(
      workspace.id,
      getIndustry(industryId).routines.map((r) => ({
        templateId: r.id,
        agentId: r.agentId,
        name: r.name,
        cadence: r.cadence,
        prompt: r.prompt,
        enabled: true,
        lastRunAt: null,
        lastOutput: null,
      })),
    );
    await logActivity({ workspaceId: workspace.id, agentId: "atlas", kind: "system", message: `Switched to the ${getIndustry(industryId).name} industry pack.` });
  }
  revalidatePath("/app", "layout");
  return { ok: "Settings saved." };
}

// ---------- Billing ----------

/**
 * Plan changes are applied directly in this MVP. In production this is where a
 * Stripe / Paystack / Flutterwave checkout session is created, and the plan is
 * only updated from the payment provider's webhook.
 */
export async function changePlan(planId: PlanId, cycle: "monthly" | "yearly") {
  const { user, workspace } = await requireWorkspace();
  if (!PLANS.some((p) => p.id === planId) || planId === "enterprise") return;
  const fresh = (await getWorkspace(workspace.id))!;
  await updateWorkspace(workspace.id, {
    plan: planId,
    billingCycle: cycle,
    trialEndsAt: planId === "free" ? fresh.trialEndsAt : null,
  });
  await logActivity({
    workspaceId: workspace.id,
    agentId: null,
    kind: "billing",
    message: `${user.name} switched to the ${getPlan(planId).name} plan (${cycle}).`,
  });
  revalidatePath("/app", "layout");
}
