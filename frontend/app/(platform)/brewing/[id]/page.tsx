"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrewingStory, BrewingAnalysis } from "@/lib/types";
import { getBrewing, analyzeBrewingStory } from "@/lib/api";
import ChatInterface from "@/components/ChatInterface";

const CATEGORY_COLORS: Record<string, string> = {
  Education: "#3b7eed",
  Housing: "#f59e0b",
  Healthcare: "#22c55e",
  Environment: "#10b981",
  Economy: "#8b5cf6",
  "Public Safety": "#ef4444",
  "Voting Rights": "#ec4899",
  Transportation: "#06b6d4",
  Technology: "#6366f1",
  Other: "#6b7fa3",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-2" style={{ color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </h3>
      <div className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        {children}
      </div>
    </div>
  );
}

export default function BrewingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const storyId = parseInt(id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const openChat = searchParams.get("chat") === "1";

  const [story, setStory] = useState<BrewingStory | null>(null);
  const [analysis, setAnalysis] = useState<BrewingAnalysis | null>(null);
  const [loadingStory, setLoadingStory] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [showChat, setShowChat] = useState(openChat);
  const [error, setError] = useState("");

  useEffect(() => {
    getBrewing()
      .then(({ bills, news }) => {
        const found = [...bills, ...news].find((s) => s.id === storyId);
        if (!found) setError("Story not found.");
        else setStory(found);
      })
      .catch(() => setError("Could not load story."))
      .finally(() => setLoadingStory(false));
  }, [storyId]);

  useEffect(() => {
    if (!story) return;
    setLoadingAnalysis(true);
    analyzeBrewingStory(storyId)
      .then(setAnalysis)
      .catch(() => {
        setAnalysis({
          summary: story.insight_summary,
          policy_context: "Policy context is temporarily unavailable.",
          stakeholders: { supporters: "Unavailable.", opponents: "Unavailable." },
          impact: { short_term: "Unavailable.", long_term: "Unavailable." },
          uncertainty_note: "Analysis is based on available information and may be incomplete.",
        });
      })
      .finally(() => setLoadingAnalysis(false));
  }, [story, storyId]);

  if (loadingStory) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[120, 300, 200].map((h, i) => (
          <div key={i} className="card animate-pulse" style={{ height: h }} />
        ))}
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-8 text-center" style={{ borderColor: "var(--danger)" }}>
          <p style={{ color: "var(--danger)", fontWeight: 600 }}>{error || "Story not found."}</p>
          <button onClick={() => router.push("/brewing")} className="accent-btn text-sm mt-4 inline-block">
            ← Back to What's Brewing
          </button>
        </div>
      </div>
    );
  }

  const color = CATEGORY_COLORS[story.category] || "#6b7fa3";
  const date = formatDate(story.published_date);

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Back nav */}
      <button
        onClick={() => router.push("/brewing")}
        style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 14 }}
      >
        ← What's Brewing
      </button>

      {/* Article header card */}
      <div className="card p-6">
        {/* Category + source row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="status-badge" style={{ background: `${color}22`, color }}>
            {story.category}
          </span>
          {story.source && (
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{story.source}</span>
          )}
          {date && (
            <span className="text-xs" style={{ color: "var(--muted)" }}>· {date}</span>
          )}
          {story.url && (
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs ml-auto font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Read Original Article ↗
            </a>
          )}
        </div>

        {/* Exact original headline */}
        <h1 className="text-xl font-bold leading-snug mb-4" style={{ color: "var(--foreground)" }}>
          {story.headline}
        </h1>

        {/* AI Insight Summary */}
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
          {story.insight_summary}
        </p>

        {/* Why This Matters */}
        {story.why_it_matters?.length > 0 && (
          <div className="rounded-lg p-4" style={{ background: "#F5EFE6", border: "1px solid var(--card-border)" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "var(--accent)" }}>WHY THIS MATTERS</p>
            <ul className="space-y-1.5">
              {story.why_it_matters.map((bullet, i) => (
                <li key={i} className="text-xs flex gap-2" style={{ color: "var(--foreground)" }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0 }}>▸</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Full AI Analysis card */}
      <div className="card p-6 space-y-6">
        <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Full Analysis</h2>

        {loadingAnalysis || !analysis ? (
          <div className="flex items-center gap-3 py-10" style={{ color: "var(--muted)" }}>
            <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
            <span className="text-sm">Generating in-depth analysis…</span>
          </div>
        ) : (
          <>
            <Section title="Summary">
              <p>{analysis.summary}</p>
            </Section>

            <Section title="Policy & Civic Context">
              <p>{analysis.policy_context}</p>
            </Section>

            <Section title="Stakeholder Breakdown">
              <div className="space-y-3 mt-1">
                <div className="rounded-lg p-3" style={{ background: "#EDF5F0", border: "1px solid #C8DDD3", borderLeft: "3px solid #2d6a4f" }}>
                  <p className="text-xs font-bold mb-1" style={{ color: "#2d6a4f" }}>SUPPORTERS</p>
                  <p>{analysis.stakeholders.supporters}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "#FAF0F0", border: "1px solid #E8C8C8", borderLeft: "3px solid #B31942" }}>
                  <p className="text-xs font-bold mb-1" style={{ color: "#B31942" }}>OPPONENTS</p>
                  <p>{analysis.stakeholders.opponents}</p>
                </div>
              </div>
            </Section>

            <Section title="Potential Impact">
              <div className="space-y-3 mt-1">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>SHORT-TERM (6–12 months)</p>
                  <p>{analysis.impact.short_term}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>LONG-TERM (3–5 years)</p>
                  <p>{analysis.impact.long_term}</p>
                </div>
              </div>
            </Section>

            <div className="rounded-lg p-3 flex gap-2" style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)" }}>
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>ℹ</span>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{analysis.uncertainty_note}</p>
            </div>
          </>
        )}
      </div>

      {/* Ask AI card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Ask AI About This</h2>
          {!showChat && (
            <button onClick={() => setShowChat(true)} className="accent-btn text-sm" style={{ padding: "8px 16px" }}>
              Start conversation
            </button>
          )}
        </div>

        {!showChat ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Have questions? The AI is pre-loaded with the full context of this story — ask anything.
          </p>
        ) : (
          <ChatInterface
            initialContext={`I'm here to help you understand this California news story: "${story.headline}". ${story.insight_summary} Key points: ${story.why_it_matters?.join("; ")}. What would you like to know?`}
            suggestedQuestions={[
              "What does this mean for everyday Californians?",
              "What are the strongest arguments on each side?",
              "Explain this like I'm 15",
              "What can I do to get involved?",
              "What happens if this passes?",
            ]}
          />
        )}
      </div>

      {/* View related bill if linked */}
      {story.bill_id && (
        <div className="text-center">
          <button
            onClick={() => router.push(`/policy/${story.bill_id}`)}
            className="text-sm"
            style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}
          >
            View full bill analysis for {story.bill_number} →
          </button>
        </div>
      )}
    </div>
  );
}
