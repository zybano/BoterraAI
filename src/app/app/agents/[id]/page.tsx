import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { requireWorkspace } from "@/lib/auth";
import { getAgent, getDepartment } from "@/lib/catalog/agents";
import { clearConversation, getConversation } from "@/lib/db";
import { canUseAgent } from "@/lib/entitlements";
import { AgentAvatar } from "@/components/agent-avatar";
import { revalidatePath } from "next/cache";
import { ChatPanel } from "./chat-panel";

export async function generateMetadata({ params }: PageProps<"/app/agents/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getAgent(id)?.name ?? "Agent" };
}

export default async function AgentChatPage({ params }: PageProps<"/app/agents/[id]">) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();
  const { workspace } = await requireWorkspace();
  if (!canUseAgent(workspace, agent)) redirect("/app/billing");

  const conversation = await getConversation(workspace.id, agent.id);

  async function resetConversation() {
    "use server";
    const { workspace: ws } = await requireWorkspace();
    await clearConversation(ws.id, id);
    revalidatePath(`/app/agents/${id}`);
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <Link href="/app/agents" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Back to agents">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <AgentAvatar agent={agent} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{agent.name}</p>
          <p className="truncate text-xs text-slate-500">{agent.title} · {getDepartment(agent.department).name}</p>
        </div>
        {conversation && conversation.messages.length > 0 && (
          <form action={resetConversation}>
            <button className="btn-ghost px-3 py-2 text-xs" title="Start a new conversation">
              <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">New chat</span>
            </button>
          </form>
        )}
      </header>
      <ChatPanel
        key={conversation?.updatedAt ?? "new"}
        agentId={agent.id}
        agentName={agent.name}
        starterPrompts={agent.starterPrompts}
        initialMessages={(conversation?.messages ?? []).map(({ role, content }) => ({ role, content }))}
        avatar={<AgentAvatar agent={agent} size="sm" />}
      />
    </div>
  );
}
