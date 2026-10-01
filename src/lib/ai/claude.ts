import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AnthropicBeta } from "@anthropic-ai/sdk/resources/beta/beta";
import type { BetaMessageParam } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import type { Agent } from "../catalog/agents";
import type { ChatMessage, Workspace } from "../db";
import { agentSystemPrompt } from "./prompts";
import { demoReply } from "./demo";

export const MODEL = process.env.BOTERRA_MODEL ?? "claude-opus-5-5";

/** Server-side refusal fallback: re-runs a declined request on Anthropic's recommended model. */
export const FALLBACK_PARAMS: { betas: AnthropicBeta[]; fallbacks: "default" } = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
};

export function isLiveAI(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | null = null;
export function anthropic(): Anthropic {
  client ??= new Anthropic();
  return client;
}

function toMessages(history: ChatMessage[]): BetaMessageParam[] {
  return history.map((m) => ({ role: m.role, content: m.content }));
}

const REFUSAL_NOTE = "\n\n_I can't help with that request. Try rephrasing it or ask a different agent._";

/**
 * Stream an agent's reply as plain text chunks. The last entry of `history`
 * must be the user's new message.
 */
export async function* streamAgentReply(agent: Agent, ws: Workspace, history: ChatMessage[]): AsyncGenerator<string> {
  if (!isLiveAI()) {
    const text = demoReply(agent, ws, history[history.length - 1]?.content ?? "");
    for (const chunk of text.match(/[\s\S]{1,24}/g) ?? []) {
      await new Promise((r) => setTimeout(r, 12));
      yield chunk;
    }
    return;
  }

  const stream = anthropic().beta.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    system: [{ type: "text", text: agentSystemPrompt(agent, ws), cache_control: { type: "ephemeral" } }],
    messages: toMessages(history),
    output_config: { effort: "medium" },
    ...FALLBACK_PARAMS,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") yield REFUSAL_NOTE;
}

/** Run a single agent on one prompt and return the full text (used by routines and missions). */
export async function runAgentOnce(agent: Agent, ws: Workspace, prompt: string): Promise<string> {
  if (!isLiveAI()) return demoReply(agent, ws, prompt);

  const message = await anthropic()
    .beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      system: [{ type: "text", text: agentSystemPrompt(agent, ws), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: prompt }],
      output_config: { effort: "medium" },
      ...FALLBACK_PARAMS,
    })
    .finalMessage();

  if (message.stop_reason === "refusal") return REFUSAL_NOTE.trim();
  return message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
