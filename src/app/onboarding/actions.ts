"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAgent } from "@/lib/catalog/agents";
import { getIndustry, INDUSTRIES } from "@/lib/catalog/industries";
import { TRIAL_DAYS } from "@/lib/catalog/plans";
import { COUNTRIES, GOAL_OPTIONS, REVENUE_BANDS, TEAM_SIZES, currencyFor } from "@/lib/catalog/regions";
import { createWorkspace, logActivity, replaceRoutines, type Autonomy } from "@/lib/db";

export interface OnboardingState {
  error?: string;
}

const AUTONOMY: Autonomy[] = ["advise", "assist", "autopilot"];

export async function completeOnboarding(_prev: OnboardingState, form: FormData): Promise<OnboardingState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.workspaceId) redirect("/app");

  const businessName = String(form.get("businessName") ?? "").trim();
  const industryId = String(form.get("industryId") ?? "");
  const country = String(form.get("country") ?? "");
  const teamSize = String(form.get("teamSize") ?? "");
  const monthlyRevenue = String(form.get("monthlyRevenue") ?? "");
  const description = String(form.get("description") ?? "").trim().slice(0, 600);
  const goals = form.getAll("goals").map(String).filter((g) => GOAL_OPTIONS.includes(g));
  const customGoal = String(form.get("customGoal") ?? "").trim().slice(0, 200);
  const autonomy = String(form.get("autonomy") ?? "assist") as Autonomy;

  if (!businessName) return { error: "Please enter your business name." };
  if (!INDUSTRIES.some((i) => i.id === industryId)) return { error: "Please choose an industry." };
  if (!COUNTRIES.some((c) => c.name === country)) return { error: "Please choose a country." };
  if (!TEAM_SIZES.includes(teamSize) || !REVENUE_BANDS.includes(monthlyRevenue)) return { error: "Please complete your business size." };
  if (!AUTONOMY.includes(autonomy)) return { error: "Please choose an autonomy level." };

  const industry = getIndustry(industryId);
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86_400_000).toISOString();

  const workspace = await createWorkspace(user.id, {
    businessName,
    industryId,
    country,
    currency: currencyFor(country),
    teamSize,
    monthlyRevenue,
    description,
    goals: customGoal ? [...goals, customGoal] : goals,
    activeAgentIds: industry.recommendedAgents,
    autonomy,
    plan: "free",
    billingCycle: "monthly",
    trialEndsAt,
  });

  await replaceRoutines(
    workspace.id,
    industry.routines.map((r) => ({
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

  await logActivity({ workspaceId: workspace.id, agentId: null, kind: "system", message: `${businessName} joined Boterra AI with the ${industry.name} pack.` });
  await logActivity({
    workspaceId: workspace.id,
    agentId: "atlas",
    kind: "system",
    message: `Atlas assembled your swarm: ${industry.recommendedAgents.map((id) => getAgent(id)?.name).join(", ")}.`,
  });

  redirect("/app?welcome=1");
}
