"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import { PolicyDetail } from "@/lib/types";
import { getPolicy, getImpact, getActions, ActionItem } from "@/lib/api";
import { getProfile } from "@/lib/profile";
import { CivicProfile } from "@/lib/types";
import PerspectivesPanel from "@/components/PerspectivesPanel";
import ChatInterface from "@/components/ChatInterface";

const STATUS_COLORS: Record<string, string> = {
  Introduced: "#3b7eed",
  Passed: "#22c55e",
  Failed: "#ef4444",
  Vetoed: "#ef4444",
  Enrolled: "#22c55e",
  Engrossed: "#f59e0b",
};

export default function PolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const billId = parseInt(id);

  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState<CivicProfile | null>(null);

  // CTA panel state
  const [activePanel, setActivePanel] = useState<"impact" | "action" | null>(null);
  const [panelContent, setPanelContent] = useState<string | ActionItem[] | null>(null);
  const [panelLoading, setPanelLoading] = useState(false);

  useEffect(() => { setProfile(getProfile()); }, []);

  useEffect(() => {
    getPolicy(billId)
      .then(setPolicy)
      .catch(() => setLoadError("Could not load this bill. The backend may be starting up — try refreshing."))
      .finally(() => setLoading(false));
  }, [billId]);

  async function handleCTA(type: "impact" | "action") {
    if (!profile) return;
    setActivePanel(type);
    setPanelContent(null);
    setPanelLoading(true);
    try {
      if (type === "impact") {
        const text = await getImpact(billId, profile);
        setPanelContent(text);
      } else {
        const actions = await getActions(billId, profile);
        setPanelContent(actions);
      }
    } catch {
      setPanelContent("AI analysis is temporarily unavailable. Please try again in a moment.");
    } finally {
      setPanelLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[300, 200, 150].map((h, i) => (
          <div key={i} className="card animate-pulse" style={{ height: h }} />
        ))}
      </div>
    );
  }

  if (loadError || !policy) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 text-center" style={{ borderColor: "var(--danger)" }}>
          <p style={{ color: "var(--danger)", fontWeight: 600, marginBottom: 8 }}>
            {loadError || "Bill not found."}
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Make sure the backend is running on port 8000.
          </p>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[policy.status] || "#6b7fa3";

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{policy.number}</span>
          <span className="status-badge" style={{ background: `${statusColor}22`, color: statusColor }}>
            {policy.status}
          </span>
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>{policy.title}</h1>
        <p className="text-sm mb-4" style={{ color: "var(--muted)", lineHeight: 1.6 }}>{policy.description}</p>
        {policy.sponsors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {policy.sponsors.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded" style={{ background: "var(--card-border)", color: "var(--foreground)" }}>
                {s.name}{s.party ? ` (${s.party})` : ""}
              </span>
            ))}
          </div>
        )}
        {policy.url && (
          <a href={policy.url} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--accent)" }}>
            View official bill text →
          </a>
        )}
      </div>

      {/* AI Summary */}
      {policy.ai && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>AI Summary</h2>

          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{policy.ai.summary}</p>

          <div className="rounded-lg p-4" style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "var(--accent)" }}>EXPLAIN LIKE I'M 15</p>
            <p className="text-sm" style={{ color: "var(--foreground)" }}>{policy.ai.eli15}</p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>WHY IT MATTERS NOW</p>
            <p className="text-sm" style={{ color: "var(--foreground)" }}>{policy.ai.why_it_matters}</p>
          </div>

          {policy.ai.affected_groups?.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>WHO'S AFFECTED</p>
              <div className="flex flex-wrap gap-2">
                {policy.ai.affected_groups.map((g) => (
                  <span key={g} className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--card-border)", color: "var(--foreground)" }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two CTA Buttons */}
      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>
          What Does This Mean For You?
        </h2>

        {!profile ? (
          <div className="text-center py-4">
            <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
              Set up your profile to get personalized impact analysis.
            </p>
            <a href="/onboarding" className="accent-btn text-sm inline-block">Create My Profile</a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleCTA("impact")}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: activePanel === "impact" ? "var(--accent)" : "var(--card-border)",
                  color: activePanel === "impact" ? "white" : "var(--foreground)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-sm">How does this affect me?</div>
                <div className="text-xs mt-1 opacity-70">
                  Personalized analysis for{profile.profession ? ` ${profile.profession}s` : " you"}
                  {profile.county ? ` in ${profile.county}` : ""}
                </div>
              </button>

              <button
                onClick={() => handleCTA("action")}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: activePanel === "action" ? "#22c55e" : "var(--card-border)",
                  color: activePanel === "action" ? "white" : "var(--foreground)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div className="text-2xl mb-2">📣</div>
                <div className="font-semibold text-sm">What can I do?</div>
                <div className="text-xs mt-1 opacity-70">Civic actions you can take right now</div>
              </button>
            </div>

            {/* Panel result */}
            {activePanel && (
              <div className="rounded-xl p-4" style={{ background: "#0d1526", border: "1px solid var(--card-border)" }}>
                {panelLoading ? (
                  <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <span className="text-sm">Gemini is analyzing…</span>
                  </div>
                ) : activePanel === "impact" && typeof panelContent === "string" ? (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{panelContent}</p>
                ) : activePanel === "action" && Array.isArray(panelContent) ? (
                  <div className="space-y-3">
                    {panelContent.map((action, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="text-xl shrink-0">{action.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{action.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted)", lineHeight: 1.5 }}>{action.description}</p>
                          {action.link && (
                            <a href={action.link} target="_blank" rel="noopener noreferrer"
                              className="text-xs mt-1 inline-block" style={{ color: "var(--accent)" }}>
                              {action.link_text}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{String(panelContent)}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Perspectives */}
      {policy.ai && (
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-1" style={{ color: "var(--foreground)" }}>Multiple Perspectives</h2>
          <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>BillMe presents both sides. We do not endorse either position.</p>
          <PerspectivesPanel supporters={policy.ai.supporters_argue} opponents={policy.ai.opponents_argue} />
        </div>
      )}

      {/* Chat */}
      <div className="card p-6" style={{ minHeight: 420 }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>Ask the AI About This Bill</h2>
        <ChatInterface
          billId={billId}
          initialContext={policy.ai
            ? `I'm here to help you understand ${policy.number}: "${policy.title}". ${policy.ai.summary} What would you like to know?`
            : `Ask me anything about ${policy.number}: "${policy.title}".`}
          suggestedQuestions={[
            "Explain this in simple terms",
            "Who benefits from this bill?",
            "What are the strongest arguments against it?",
            "How would this affect everyday Californians?",
          ]}
        />
      </div>

      {/* History */}
      {policy.history?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>Legislative History</h2>
          <div className="space-y-3">
            {policy.history.map((h, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-xs font-mono mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>{h.date}</span>
                <span className="text-sm" style={{ color: "var(--foreground)" }}>{h.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
