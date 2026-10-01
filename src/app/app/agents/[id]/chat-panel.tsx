"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import { Markdown } from "@/components/markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatPanel({
  agentId,
  agentName,
  initialMessages,
  starterPrompts,
  avatar,
}: {
  agentId: string;
  agentName: string;
  initialMessages: Message[];
  starterPrompts: string[];
  avatar: React.ReactNode;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`/api/agents/${agentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      }
      router.refresh(); // updates credit meter in the sidebar
    } catch (err) {
      setMessages((m) => m.slice(0, -2));
      setInput(message);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-xl py-10 text-center">
            <div className="flex justify-center">{avatar}</div>
            <p className="mt-4 text-lg font-semibold text-slate-900">Hi, I&apos;m {agentName}. How can I help?</p>
            <div className="mt-6 grid gap-2">
              {starterPrompts.map((p) => (
                <button key={p} onClick={() => send(p)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 hover:border-brand-300 hover:bg-brand-50/50">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm whitespace-pre-wrap text-white">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <div className="hidden sm:block">{avatar}</div>
              <div className="max-w-[90%] min-w-0 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3">
                {m.content ? <Markdown>{m.content}</Markdown> : <TypingDots />}
              </div>
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
        {error && <p className="mb-2 text-sm text-red-600" role="alert">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={`Message ${agentName}…`}
            className="input max-h-40 min-h-11 resize-none"
          />
          <button className="btn-primary h-11 w-11 shrink-0 p-0" disabled={busy || !input.trim()} aria-label="Send">
            <SendHorizontal className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-slate-400">Agents can make mistakes. Verify important financial, legal and regulatory details.</p>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-1 py-1.5" aria-label="Thinking">
      {[0, 150, 300].map((d) => (
        <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}
