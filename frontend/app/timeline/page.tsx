"use client";
import { useEffect, useState } from "react";
import { TimelineItem } from "@/lib/types";
import { getTimeline } from "@/lib/api";

const TYPE_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  registration: { color: "#3b7eed", icon: "📝", label: "Registration" },
  mail: { color: "#f59e0b", icon: "✉️", label: "Mail Ballot" },
  voting: { color: "#22c55e", icon: "🗳️", label: "Early Voting" },
  election: { color: "#ef4444", icon: "⭐", label: "Election Day" },
  results: { color: "#6b7fa3", icon: "📊", label: "Results" },
};

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimeline()
      .then(setTimeline)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
        California Election Dates
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        Key civic deadlines and election dates for California 2026.
      </p>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse" style={{ height: 80 }} />
          ))}
        </div>
      )}

      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-5 top-0 bottom-0 w-0.5"
          style={{ background: "var(--card-border)" }}
        />

        <div className="space-y-4">
          {timeline.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.registration;
            const days = daysUntil(item.date);
            const isPast = days < 0;
            const isSoon = days >= 0 && days <= 30;

            return (
              <div key={item.id} className="relative flex gap-5">
                {/* Icon dot */}
                <div
                  className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 text-base"
                  style={{
                    background: isPast ? "var(--card-border)" : config.color + "22",
                    border: `2px solid ${isPast ? "var(--card-border)" : config.color}`,
                    opacity: isPast ? 0.5 : 1,
                  }}
                >
                  {config.icon}
                </div>

                <div
                  className="card p-4 flex-1"
                  style={{
                    opacity: isPast ? 0.6 : 1,
                    borderColor: item.urgent && !isPast ? config.color : "var(--card-border)",
                    borderWidth: item.urgent && !isPast ? 2 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: isPast ? "var(--muted)" : config.color }}
                      >
                        {new Date(item.date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      {isPast ? (
                        <span className="text-xs" style={{ color: "var(--muted)" }}>Past</span>
                      ) : days === 0 ? (
                        <span
                          className="status-badge"
                          style={{ background: "#ef444422", color: "#ef4444" }}
                        >
                          TODAY
                        </span>
                      ) : isSoon ? (
                        <span
                          className="status-badge"
                          style={{ background: "#f59e0b22", color: "#f59e0b" }}
                        >
                          {days}d away
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {days} days
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
                    {item.title}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="card p-4 mt-8 text-center text-xs"
        style={{ color: "var(--muted)" }}
      >
        Dates based on California Secretary of State 2026 election calendar.
        Always verify with{" "}
        <a
          href="https://www.sos.ca.gov/elections"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)" }}
        >
          sos.ca.gov
        </a>{" "}
        for official deadlines.
      </div>
    </div>
  );
}
