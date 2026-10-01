import { getAgent } from "@/lib/catalog/agents";
import { getWorkspace, listEnabledRoutines, logActivity, updateRoutine, type Routine } from "@/lib/db";
import { canUseAgent, consumeCredits, CREDIT_COST } from "@/lib/entitlements";
import { runAgentOnce } from "@/lib/ai/claude";

const CADENCE_MS: Record<Routine["cadence"], number> = {
  daily: 86_400_000,
  weekly: 7 * 86_400_000,
  monthly: 30 * 86_400_000,
};

/**
 * Runs every routine that is due. Call from a scheduler (Vercel Cron, GitHub
 * Actions, cron + curl) with `Authorization: Bearer $CRON_SECRET`.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const due = (await listEnabledRoutines()).filter(
    (r) => !r.lastRunAt || now - new Date(r.lastRunAt).getTime() >= CADENCE_MS[r.cadence],
  );

  const results: { routineId: string; status: string }[] = [];
  for (const routine of due) {
    const workspace = await getWorkspace(routine.workspaceId);
    const agent = getAgent(routine.agentId);
    if (!workspace || !agent || !canUseAgent(workspace, agent)) {
      results.push({ routineId: routine.id, status: "skipped: not entitled" });
      continue;
    }
    if (!(await consumeCredits(workspace, CREDIT_COST.routine))) {
      results.push({ routineId: routine.id, status: "skipped: out of credits" });
      continue;
    }
    try {
      const output = await runAgentOnce(agent, workspace, routine.prompt);
      await updateRoutine(workspace.id, routine.id, { lastRunAt: new Date().toISOString(), lastOutput: output });
      await logActivity({ workspaceId: workspace.id, agentId: agent.id, kind: "routine", message: `${agent.name} ran scheduled routine “${routine.name}”.` });
      results.push({ routineId: routine.id, status: "ok" });
    } catch (err) {
      console.error(`Routine ${routine.id} failed`, err);
      results.push({ routineId: routine.id, status: "failed" });
    }
  }

  return Response.json({ ran: results.filter((r) => r.status === "ok").length, results });
}
