"use client";
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";
import { sendChat } from "@/lib/api";
import { getProfile } from "@/lib/profile";

interface Props {
  billId?: number;
  initialContext?: string;
  suggestedQuestions?: string[];
}

export default function ChatInterface({ billId, initialContext, suggestedQuestions }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialContext ? [{ role: "assistant", content: initialContext }] : []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const updated: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const profile = getProfile() || undefined;
      const reply = await sendChat(updated, billId, profile ?? undefined);
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...updated, {
        role: "assistant",
        content: "Sorry, the AI couldn't respond. Check that the backend is running on port 8000.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3" style={{ minHeight: 300 }}>

      {/* Suggested questions */}
      {suggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: "var(--card-border)",
                color: "var(--muted)",
                border: "1px solid transparent",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3" style={{ maxHeight: 320 }}>
        {messages.length === 0 && (
          <p className="text-sm text-center pt-8" style={{ color: "var(--muted)" }}>
            Ask anything about this bill or California civic topics.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={
                m.role === "user"
                  ? { background: "var(--accent)", color: "white" }
                  : { background: "#0d1526", border: "1px solid var(--card-border)", color: "var(--foreground)" }
              }
            >
              {m.role === "assistant" && (
                <span className="text-xs font-bold block mb-1" style={{ color: "var(--accent)" }}>BillMe AI</span>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl text-sm flex items-center gap-2" style={{ background: "#0d1526", border: "1px solid var(--card-border)", color: "var(--muted)" }}>
              <div className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="flex gap-2 mt-auto">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a question and press Enter…"
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="accent-btn"
          style={{ padding: "10px 18px", opacity: loading || !input.trim() ? 0.5 : 1, whiteSpace: "nowrap" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
