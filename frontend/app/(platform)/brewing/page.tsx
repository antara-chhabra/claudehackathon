"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrewingStory } from "@/lib/types";
import { getBrewing } from "@/lib/api";
import MarkdownContent from "@/components/MarkdownContent";

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
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function StoryCard({ story, onAnalyze, onAsk, onBill }: {
  story: BrewingStory;
  onAnalyze: () => void;
  onAsk: () => void;
  onBill?: () => void;
}) {
  const color = CATEGORY_COLORS[story.category] || "#6b7fa3";
  const date = formatDate(story.published_date);

  return (
    <div className="card p-6 transition-all hover:border-blue-500" style={{ borderColor: "var(--card-border)" }}>
      {/* Category + source + date row */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="status-badge" style={{ background: `${color}22`, color }}>
          {story.category}
        </span>
        {story.source && (
          <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
            {story.source}
          </span>
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
            onClick={(e) => e.stopPropagation()}
          >
            Read Original ↗
          </a>
        )}
      </div>

      {/* Exact original headline */}
      <h2 className="font-bold text-lg leading-snug mb-3" style={{ color: "var(--foreground)" }}>
        {story.headline}
      </h2>

      {/* AI Insight Summary */}
      <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        <MarkdownContent text={story.insight_summary} />
      </div>

      {/* Why This Matters */}
      {story.why_it_matters?.length > 0 && (
        <div className="rounded-lg p-4 mb-4" style={{ background: "#F5EFE6", border: "1px solid var(--card-border)" }}>
          <p className="text-xs font-bold mb-2" style={{ color: "var(--accent)" }}>WHY THIS MATTERS</p>
          <ul className="space-y-1">
            {story.why_it_matters.map((bullet, i) => (
              <li key={i} className="text-xs flex gap-2" style={{ color: "var(--foreground)" }}>
                <span style={{ color: "var(--accent)", flexShrink: 0 }}>▸</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onAnalyze} className="accent-btn text-sm" style={{ padding: "8px 16px" }}>
          Read Full Analysis
        </button>
        <button
          onClick={onAsk}
          className="text-sm px-4 py-2 rounded-lg"
          style={{ background: "var(--card-border)", color: "var(--foreground)", border: "none", cursor: "pointer" }}
        >
          Ask AI About This
        </button>
        {onBill && (
          <button
            onClick={onBill}
            className="text-sm"
            style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            View bill →
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse" style={{ height: 220 }}>
      <div className="flex gap-2 mb-4">
        <div className="h-5 rounded-full w-20" style={{ background: "var(--card-border)" }} />
        <div className="h-5 rounded w-24" style={{ background: "var(--card-border)" }} />
      </div>
      <div className="h-6 rounded mb-2" style={{ background: "var(--card-border)", width: "85%" }} />
      <div className="h-6 rounded mb-4" style={{ background: "var(--card-border)", width: "60%" }} />
      <div className="h-16 rounded" style={{ background: "var(--card-border)" }} />
    </div>
  );
}

export default function BrewingPage() {
  const router = useRouter();
  const [bills, setBills] = useState<BrewingStory[]>([]);
  const [news, setNews] = useState<BrewingStory[]>([]);
  const [tab, setTab] = useState<"news" | "bills">("news");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBrewing()
      .then(({ bills: b, news: n }) => {
        setBills(b);
        setNews(n);
      })
      .catch(() => setError("Could not load stories. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const stories = tab === "news" ? news : bills;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
          What's Brewing
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Real-time California politics news and legislative analysis — with AI civic interpretation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--card-border)", width: "fit-content" }}>
        {(["news", "bills"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === t ? "#631212" : "transparent",
              color: tab === t ? "#FDFBF7" : "var(--muted)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t === "news" ? "Current News" : "Current Bills"}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-xs mb-5" style={{ color: "var(--muted)" }}>
        {tab === "news"
          ? "Live news articles from CalMatters, NYT, LA Times and more — with AI-generated civic context."
          : "Key California bills in this session — explained with AI analysis, perspectives, and civic action steps."}
      </p>

      {/* Error */}
      {error && (
        <div className="card p-6 text-center mb-4" style={{ border: "1px solid var(--danger)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state for news tab when still loading from backend */}
      {!loading && tab === "news" && news.length === 0 && !error && (
        <div className="card p-8 text-center">
          <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
            News articles are being fetched and processed by AI…
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            This may take a moment on first load. Try refreshing in 30 seconds.
          </p>
        </div>
      )}

      {/* Stories */}
      {!loading && (
        <div className="space-y-4">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onAnalyze={() => router.push(`/brewing/${story.id}`)}
              onAsk={() => router.push(`/brewing/${story.id}?chat=1`)}
              onBill={story.bill_id ? () => router.push(`/policy/${story.bill_id}`) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
