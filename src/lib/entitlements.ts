import "server-only";
import { AGENTS, type Agent } from "./catalog/agents";
import { getPlan, planIncludes, type PlanId } from "./catalog/plans";
import { updateWorkspace, type Workspace } from "./db";

export const CREDIT_COST = { chat: 1, routine: 2, mission: 5 } as const;

export function isTrialing(ws: Workspace): boolean {
  return ws.plan === "free" && !!ws.trialEndsAt && new Date(ws.trialEndsAt) > new Date();
}

/** The plan whose limits apply right now (a free workspace on trial gets Scale). */
export function effectivePlan(ws: Workspace): PlanId {
  return isTrialing(ws) ? "scale" : ws.plan;
}

export function trialDaysLeft(ws: Workspace): number {
  if (!isTrialing(ws)) return 0;
  return Math.ceil((new Date(ws.trialEndsAt!).getTime() - Date.now()) / 86_400_000);
}

export function canUseAgent(ws: Workspace, agent: Agent): boolean {
  return planIncludes(effectivePlan(ws), agent.minPlan);
}

export function availableAgents(ws: Workspace): Agent[] {
  return AGENTS.filter((a) => canUseAgent(ws, a));
}

function periodExpired(ws: Workspace): boolean {
  const start = new Date(ws.creditsPeriodStart);
  const next = new Date(start);
  next.setMonth(next.getMonth() + 1);
  return new Date() >= next;
}

export function creditStatus(ws: Workspace) {
  const limit = getPlan(effectivePlan(ws)).credits;
  const used = periodExpired(ws) ? 0 : ws.creditsUsed;
  return { limit, used, remaining: Math.max(0, limit - used) };
}

/**
 * Reserve credits for a unit of work. Returns false when the workspace is out
 * of credits; resets the counter when a new monthly period has started.
 */
export async function consumeCredits(ws: Workspace, amount: number): Promise<boolean> {
  if (periodExpired(ws)) {
    await updateWorkspace(ws.id, { creditsUsed: 0, creditsPeriodStart: new Date().toISOString() });
    ws.creditsUsed = 0;
  }
  const { remaining } = creditStatus(ws);
  if (remaining < amount) return false;
  const updated = await updateWorkspace(ws.id, { creditsUsed: ws.creditsUsed + amount });
  ws.creditsUsed = updated.creditsUsed;
  return true;
}
