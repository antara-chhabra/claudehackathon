"use client";
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";
import { sendChat } from "@/lib/api";
import { getProfile } from "@/lib/profile";
import { Send, Bot } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";

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
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                background: "#F5EFE6",
                color: "#7A6352",
                border: "1px solid #E0D4C0",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3" style={{ maxHeight: 340 }}>
        {messages.length === 0 && (
          <p className="text-sm text-center pt-8" style={{ color: "#7A6352" }}>
            Ask anything about this bill or California civic topics.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0 mt-1"
                style={{ background: "#D4AF3720", border: "1px solid #D4AF3740" }}
              >
                <Bot size={14} strokeWidth={1.5} style={{ color: "#631212" }} />
              </div>
            )}
            <div
              className="max-w-[82%] rounded-2xl px-4 py-3 text-sm"
              style={
                m.role === "user"
                  ? {
                      background: "#631212",
                      color: "#FDFBF7",
                      borderBottomRightRadius: 4,
                    }
                  : {
                      background: "#F5EFE6",
                      border: "1px solid #E0D4C0",
                      color: "#3D2B1F",
                      lineHeight: 1.65,
                      borderBottomLeftRadius: 4,
                    }
              }
            >
              {m.role === "assistant" && (
                <span
                  className="text-xs font-bold block mb-1"
                  style={{ color: "#631212", letterSpacing: "0.04em" }}
                >
                  BillMe AI
                </span>
              )}
              {m.role === "assistant" ? <MarkdownContent text={m.content} /> : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#D4AF3720", border: "1px solid #D4AF3740" }}
            >
              <Bot size={14} strokeWidth={1.5} style={{ color: "#631212" }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl text-sm flex items-center gap-2"
              style={{ background: "#F5EFE6", border: "1px solid #E0D4C0", color: "#7A6352" }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#D4AF37",
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span>Thinking…</span>
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
          placeholder="Ask anything…"
          disabled={loading}
          style={{ flex: 1, borderRadius: 10 }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="accent-btn"
          style={{
            padding: "10px 16px",
            opacity: loading || !input.trim() ? 0.45 : 1,
            borderRadius: 10,
          }}
        >
          <Send size={15} strokeWidth={2} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
