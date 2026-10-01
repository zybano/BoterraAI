import type { Agent } from "../catalog/agents";
import { getAgent } from "../catalog/agents";
import { getIndustry } from "../catalog/industries";
import type { Workspace } from "../db";

/**
 * Deterministic offline responses used when no Anthropic credentials are
 * configured, so the whole product can be explored (and demoed) without an
 * API key. Live mode replaces all of this with Claude.
 */

export const DEMO_NOTICE =
  "_Demo mode — set `ANTHROPIC_API_KEY` on the server to switch this agent to live Claude responses._";

function topic(prompt: string): string {
  const clean = prompt.replace(/\s+/g, " ").trim();
  return clean.length > 90 ? `${clean.slice(0, 87)}…` : clean;
}

export function demoReply(agent: Agent, ws: Workspace, prompt: string): string {
  const industry = getIndustry(ws.industryId);
  const steps = agent.capabilities.map(
    (cap, i) => `${i + 1}. **${cap}** — I'll apply this to ${ws.businessName}'s situation and give you a ready-to-use output.`,
  );
  return `### ${agent.name} on: “${topic(prompt)}”

Here's how I'd tackle this for **${ws.businessName}** (${industry.name}, ${ws.country}):

${steps.join("\n")}

**What I need from you**
- Your latest numbers for: ${industry.kpis.slice(0, 3).join(", ")}
- Any constraints (budget, deadlines, people) I should respect

**Watch-outs for ${ws.country}**
- ${industry.complianceFocus.slice(0, 2).join("\n- ")}

${DEMO_NOTICE}`;
}

export function demoPlan(goal: string, roster: Agent[]) {
  const preferred = ["vision", "quinn", "nova", "flow", "sentinel", "hunter", "ledger", "haven"];
  const picked = preferred
    .map((id) => roster.find((a) => a.id === id))
    .filter((a): a is Agent => !!a)
    .slice(0, 3);
  const agents = picked.length ? picked : roster.filter((a) => a.id !== "atlas").slice(0, 3);
  return {
    plan: `To deliver “${topic(goal)}”, I'm splitting the work across ${agents.map((a) => a.name).join(", ")} so each department contributes in parallel.`,
    assignments: agents.map((a) => ({
      agentId: a.id,
      task: `From the ${a.title} perspective, produce the analysis and concrete plan needed for: ${goal}`,
    })),
  };
}

export function demoSynthesis(goal: string, assignments: { agentId: string }[]) {
  const names = assignments.map((a) => getAgent(a.agentId)?.name ?? a.agentId);
  return {
    summary: `## Mission summary\n\n**Goal:** ${goal}\n\n${names.join(", ")} each delivered a workstream. Together they cover strategy, money and execution, with compliance checks built in.\n\n### Recommended sequence\n1. Confirm the numbers each agent asked for.\n2. Approve the actions below — low-risk items can run on Autopilot.\n3. Atlas will track progress in your weekly briefing.\n\n${DEMO_NOTICE}`,
    actions: assignments.map((a, i) => ({
      title: `${names[i]}: turn the plan into a first draft deliverable`,
      agentId: a.agentId,
      risk: (["low", "medium", "high"] as const)[i % 3],
    })),
  };
}
