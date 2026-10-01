import "server-only";
import { z } from "zod/v4";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getAgent, type Agent } from "../catalog/agents";
import {
  createApprovals,
  logActivity,
  newId,
  saveMission,
  type Mission,
  type MissionAction,
  type Workspace,
} from "../db";
import { anthropic, FALLBACK_PARAMS, isLiveAI, MODEL, runAgentOnce } from "./claude";
import { demoPlan, demoSynthesis } from "./demo";
import { orchestratorPlanningPrompt, orchestratorSynthesisPrompt } from "./prompts";

const PlanSchema = z.object({
  plan: z.string().describe("Two or three sentences explaining the approach to the owner."),
  assignments: z
    .array(z.object({ agentId: z.string(), task: z.string() }))
    .describe("2 to 5 assignments, one per agent."),
});

const SynthesisSchema = z.object({
  summary: z.string().describe("Markdown executive summary for the owner."),
  actions: z.array(
    z.object({
      title: z.string(),
      agentId: z.string(),
      risk: z.enum(["low", "medium", "high"]),
    }),
  ),
});

async function planMission(goal: string, ws: Workspace, roster: Agent[]) {
  if (!isLiveAI()) return demoPlan(goal, roster);
  const response = await anthropic().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: orchestratorPlanningPrompt(ws, roster),
    messages: [{ role: "user", content: `Mission goal: ${goal}` }],
    output_config: { effort: "medium", format: betaZodOutputFormat(PlanSchema) },
    ...FALLBACK_PARAMS,
  });
  if (!response.parsed_output) throw new Error("Atlas could not produce a mission plan.");
  return response.parsed_output;
}

async function synthesize(goal: string, ws: Workspace, assignments: Mission["assignments"]) {
  if (!isLiveAI()) return demoSynthesis(goal, assignments);
  const work = assignments
    .map((a) => `### ${getAgent(a.agentId)?.name} (${a.agentId}) — task: ${a.task}\n\n${a.output}`)
    .join("\n\n---\n\n");
  const response = await anthropic().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: orchestratorSynthesisPrompt(ws),
    messages: [{ role: "user", content: `Mission goal: ${goal}\n\n## Agent deliverables\n\n${work}` }],
    output_config: { effort: "medium", format: betaZodOutputFormat(SynthesisSchema) },
    ...FALLBACK_PARAMS,
  });
  if (!response.parsed_output) throw new Error("Atlas could not summarise the mission.");
  return response.parsed_output;
}

/**
 * Atlas plans the mission, departmental agents work in parallel, then Atlas
 * synthesises one summary with next actions that feed the approval inbox
 * according to the workspace's autonomy level.
 */
export async function executeMission(mission: Mission, ws: Workspace, roster: Agent[]) {
  try {
    const planned = await planMission(mission.goal, ws, roster);
    const allowed = new Set(roster.map((a) => a.id));
    const assignments = planned.assignments
      .filter((a) => allowed.has(a.agentId) && a.agentId !== "atlas")
      .slice(0, 5);
    if (assignments.length === 0) throw new Error("No eligible agents were assigned to this mission.");

    mission.plan = planned.plan;
    mission.assignments = assignments.map((a) => ({ ...a, output: "" }));
    await saveMission(mission);

    await Promise.all(
      mission.assignments.map(async (assignment) => {
        const agent = getAgent(assignment.agentId)!;
        assignment.output = await runAgentOnce(
          agent,
          ws,
          `Atlas (Chief of Staff) has assigned you part of a mission.\n\nMission goal: ${mission.goal}\n\nYour task: ${assignment.task}\n\nDeliver your part in full.`,
        );
        await saveMission(mission);
      }),
    );

    const synthesis = await synthesize(mission.goal, ws, mission.assignments);
    mission.summary = synthesis.summary;
    mission.actions = synthesis.actions
      .filter((a) => allowed.has(a.agentId))
      .map((a): MissionAction => ({ ...a, id: newId() }));
    mission.status = "completed";
    mission.completedAt = new Date().toISOString();
    await saveMission(mission);

    await createApprovals(
      mission.actions.map((action) => ({
        workspaceId: ws.id,
        missionId: mission.id,
        agentId: action.agentId,
        title: action.title,
        risk: action.risk,
        status: ws.autonomy === "autopilot" && action.risk === "low" ? "auto-approved" : "pending",
      })),
    );
    await logActivity({
      workspaceId: ws.id,
      agentId: "atlas",
      kind: "mission",
      message: `Completed mission “${mission.goal}” with ${mission.assignments.length} agents and ${mission.actions.length} proposed actions.`,
    });
  } catch (err) {
    mission.status = "failed";
    mission.summary = `The mission could not be completed: ${err instanceof Error ? err.message : "unknown error"}`;
    mission.completedAt = new Date().toISOString();
    await saveMission(mission);
    await logActivity({ workspaceId: ws.id, agentId: "atlas", kind: "mission", message: `Mission “${mission.goal}” failed.` });
  }
}
