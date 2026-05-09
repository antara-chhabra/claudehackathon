"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import { PolicyDetail } from "@/lib/types";
import { getPolicy, getImpact, getActions, ActionItem } from "@/lib/api";
import { getProfile } from "@/lib/profile";
import { CivicProfile } from "@/lib/types";
import PerspectivesPanel from "@/components/PerspectivesPanel";
import ChatInterface from "@/components/ChatInterface";
import MarkdownContent from "@/components/MarkdownContent";
import {
  FileText, UserCheck, Megaphone, Users, Clock,
  ExternalLink, MessageSquare, ChevronRight, Loader2,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Introduced: "#3b7eed",
  Passed:     "#22c55e",
  Failed:     "#B31942",
  Vetoed:     "#B31942",
  Enrolled:   "#22c55e",
  Engrossed:  "#D4AF37",
};

export default function PolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const billId = parseInt(id);

  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState<CivicProfile | null>(null);

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
        {[280, 200, 160].map((h, i) => (
          <div key={i} className="card animate-pulse" style={{ height: h }} />
        ))}
      </div>
    );
  }

  if (loadError || !policy) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 text-center" style={{ borderColor: "#B31942" }}>
          <p style={{ color: "#B31942", fontWeight: 600, marginBottom: 8 }}>
            {loadError || "Bill not found."}
          </p>
          <p className="text-sm" style={{ color: "#7A6352" }}>
            Make sure the backend is running on port 8000.
          </p>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[policy.status] || "#7A6352";

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <FileText size={14} strokeWidth={1.5} style={{ color: "#631212" }} />
            <span className="text-sm font-bold tracking-wide" style={{ color: "#631212" }}>
              {policy.number}
            </span>
          </div>
          <span className="status-badge" style={{ background: `${statusColor}18`, color: statusColor }}>
            {policy.status}
          </span>
        </div>
        <h1
          className="text-2xl font-bold mb-3 leading-snug"
          style={{ color: "#631212", lineHeight: 1.35, fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {policy.title}
        </h1>
        <p className="text-sm mb-4" style={{ color: "#3D2B1F", lineHeight: 1.65 }}>
          {policy.description}
        </p>
        {policy.sponsors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {policy.sponsors.map((s, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: "#F5EFE6", color: "#7A6352", border: "1px solid #E0D4C0" }}
              >
                {s.name}{s.party ? ` (${s.party})` : ""}
              </span>
            ))}
          </div>
        )}
        {policy.url && (
          <a
            href={policy.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: "#631212" }}
          >
            View official bill text
            <ExternalLink size={11} strokeWidth={2} />
          </a>
        )}
      </div>

      {/* AI Summary */}
      {policy.ai && (
        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-lg" style={{ color: "#631212" }}>AI Summary</h2>

          <div className="text-sm" style={{ color: "#3D2B1F" }}>
            <MarkdownContent text={policy.ai.summary} />
          </div>

          {/* ELI15 — pull quote */}
          <div
            className="rounded-xl p-5"
            style={{ background: "#D4AF3710", border: "1px solid #D4AF3730", borderLeft: "3px solid #D4AF37" }}
          >
            <p
              className="text-xs font-bold mb-3 tracking-widest uppercase"
              style={{ color: "#D4AF37" }}
            >
              Explain Like I&apos;m 15
            </p>
            <p className="pull-quote" style={{ color: "#3D2B1F" }}>
              &ldquo;{policy.ai.eli15}&rdquo;
            </p>
          </div>

          <div>
            <p className="text-xs font-bold mb-2 tracking-widest uppercase" style={{ color: "#7A6352" }}>
              Why It Matters Now
            </p>
            <div className="text-sm" style={{ color: "#3D2B1F" }}>
              <MarkdownContent text={policy.ai.why_it_matters} />
            </div>
          </div>

          {policy.ai.affected_groups?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={13} strokeWidth={1.5} style={{ color: "#7A6352" }} />
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#7A6352" }}>
                  Who&apos;s Affected
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {policy.ai.affected_groups.map((g) => (
                  <span
                    key={g}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ background: "#F5EFE6", color: "#3D2B1F", border: "1px solid #E0D4C0" }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTAs */}
      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4" style={{ color: "#631212" }}>
          What Does This Mean For You?
        </h2>

        {!profile ? (
          <div className="text-center py-6">
            <p className="text-sm mb-4" style={{ color: "#7A6352" }}>
              Set up your profile to get personalized impact analysis.
            </p>
            <a href="/onboarding" className="accent-btn text-sm inline-flex">
              Create My Profile <ChevronRight size={14} />
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleCTA("impact")}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: activePanel === "impact" ? "#D4AF3714" : "#F5EFE6",
                  border: `1px solid ${activePanel === "impact" ? "#D4AF3750" : "#E0D4C0"}`,
                  cursor: "pointer",
                }}
              >
                <UserCheck
                  size={20}
                  strokeWidth={1.5}
                  className="mb-2"
                  style={{ color: activePanel === "impact" ? "#631212" : "#7A6352" }}
                />
                <div className="font-semibold text-sm" style={{ color: "#3D2B1F" }}>
                  How does this affect me?
                </div>
                <div className="text-xs mt-1" style={{ color: "#7A6352" }}>
                  Personalized for{profile.profession ? ` ${profile.profession}s` : " you"}
                  {profile.county ? ` in ${profile.county}` : ""}
                </div>
              </button>

              <button
                onClick={() => handleCTA("action")}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: activePanel === "action" ? "#EDF5F0" : "#F5EFE6",
                  border: `1px solid ${activePanel === "action" ? "#2d6a4f" : "#E0D4C0"}`,
                  cursor: "pointer",
                }}
              >
                <Megaphone
                  size={20}
                  strokeWidth={1.5}
                  className="mb-2"
                  style={{ color: activePanel === "action" ? "#2d6a4f" : "#7A6352" }}
                />
                <div className="font-semibold text-sm" style={{ color: "#3D2B1F" }}>
                  What can I do?
                </div>
                <div className="text-xs mt-1" style={{ color: "#7A6352" }}>
                  Civic actions you can take right now
                </div>
              </button>
            </div>

            {activePanel && (
              <div
                className="rounded-xl p-4"
                style={{ background: "#F5EFE6", border: "1px solid #E0D4C0" }}
              >
                {panelLoading ? (
                  <div className="flex items-center gap-2" style={{ color: "#7A6352" }}>
                    <Loader2 size={16} className="animate-spin" style={{ color: "#631212" }} />
                    <span className="text-sm">Analyzing…</span>
                  </div>
                ) : activePanel === "impact" && typeof panelContent === "string" ? (
                  <div className="text-sm" style={{ color: "#3D2B1F" }}>
                    <MarkdownContent text={panelContent} />
                  </div>
                ) : activePanel === "action" && Array.isArray(panelContent) ? (
                  <div className="space-y-4">
                    {panelContent.map((action, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                          style={{ background: "#FFFDF9", border: "1px solid #E0D4C0" }}
                        >
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-0.5" style={{ color: "#3D2B1F" }}>
                            {action.title}
                          </p>
                          <p className="text-xs" style={{ color: "#7A6352", lineHeight: 1.55 }}>
                            {action.description}
                          </p>
                          {action.link && (
                            <a
                              href={action.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs mt-1 font-medium"
                              style={{ color: "#631212" }}
                            >
                              {action.link_text}
                              <ExternalLink size={10} strokeWidth={2} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "#7A6352" }}>{String(panelContent)}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Perspectives */}
      {policy.ai && (
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-1" style={{ color: "#631212" }}>Multiple Perspectives</h2>
          <p className="text-xs mb-4" style={{ color: "#7A6352" }}>
            BillMe presents both sides. We do not endorse either position.
          </p>
          <PerspectivesPanel supporters={policy.ai.supporters_argue} opponents={policy.ai.opponents_argue} />
        </div>
      )}

      {/* Chat */}
      <div className="card p-6" style={{ minHeight: 420 }}>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={16} strokeWidth={1.5} style={{ color: "#631212" }} />
          <h2 className="font-bold text-lg" style={{ color: "#631212" }}>Ask the AI About This Bill</h2>
        </div>
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
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} strokeWidth={1.5} style={{ color: "#7A6352" }} />
            <h2 className="font-bold text-lg" style={{ color: "#631212" }}>Legislative History</h2>
          </div>
          <div className="space-y-3">
            {policy.history.map((h, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span
                  className="text-xs font-mono mt-0.5 shrink-0 tabular-nums"
                  style={{ color: "#631212" }}
                >
                  {h.date}
                </span>
                <span className="text-sm" style={{ color: "#3D2B1F", lineHeight: 1.55 }}>
                  {h.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
