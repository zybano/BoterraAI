import { getCurrentUser } from "@/lib/auth";
import { getAgent } from "@/lib/catalog/agents";
import { appendMessages, getConversation, getWorkspace, logActivity, type ChatMessage } from "@/lib/db";
import { canUseAgent, consumeCredits, CREDIT_COST } from "@/lib/entitlements";
import { streamAgentReply } from "@/lib/ai/claude";

/** How many previous messages are sent back to the model for context. */
const HISTORY_WINDOW = 30;

export async function POST(request: Request, ctx: RouteContext<"/api/agents/[id]/chat">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user?.workspaceId) return Response.json({ error: "Not signed in." }, { status: 401 });
  const workspace = await getWorkspace(user.workspaceId);
  if (!workspace) return Response.json({ error: "Workspace not found." }, { status: 404 });

  const agent = getAgent(id);
  if (!agent) return Response.json({ error: "Unknown agent." }, { status: 404 });
  if (!canUseAgent(workspace, agent)) {
    return Response.json({ error: `${agent.name} isn't included in your plan. Upgrade to unlock.` }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { message?: unknown } | null;
  const text = typeof body?.message === "string" ? body.message.trim().slice(0, 8000) : "";
  if (!text) return Response.json({ error: "Message is empty." }, { status: 400 });

  if (!(await consumeCredits(workspace, CREDIT_COST.chat))) {
    return Response.json({ error: "You're out of AI credits for this month. Upgrade to keep chatting." }, { status: 402 });
  }

  const previous = (await getConversation(workspace.id, agent.id))?.messages ?? [];
  const userMessage: ChatMessage = { role: "user", content: text, at: new Date().toISOString() };
  const history = [...previous.slice(-HISTORY_WINDOW), userMessage];
  // The API requires the first message to come from the user.
  while (history.length && history[0].role !== "user") history.shift();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let reply = "";
      try {
        for await (const chunk of streamAgentReply(agent, workspace, history)) {
          reply += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error(`Agent ${agent.id} failed`, err);
        const note = "\n\n_Sorry — I hit a problem generating that answer. Please try again in a moment._";
        reply += note;
        controller.enqueue(encoder.encode(note));
      } finally {
        await appendMessages(workspace.id, agent.id, [
          userMessage,
          { role: "assistant", content: reply, at: new Date().toISOString() },
        ]);
        if (previous.length === 0) {
          await logActivity({ workspaceId: workspace.id, agentId: agent.id, kind: "chat", message: `${user.name} started working with ${agent.name}.` });
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
