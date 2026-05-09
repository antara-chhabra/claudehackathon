"use client";
import { useEffect, useState } from "react";
import { TimelineItem } from "@/lib/types";
import { getTimeline } from "@/lib/api";
import { ClipboardList, Mail, CheckSquare, Star, BarChart2, ExternalLink } from "lucide-react";

const TYPE_CONFIG: Record<string, { color: string; Icon: React.ElementType; label: string }> = {
  registration: { color: "#3b7eed",  Icon: ClipboardList, label: "Registration" },
  mail:         { color: "#D4AF37",  Icon: Mail,          label: "Mail Ballot"  },
  voting:       { color: "#22c55e",  Icon: CheckSquare,   label: "Early Voting" },
  election:     { color: "#B31942",  Icon: Star,          label: "Election Day" },
  results:      { color: "#7A6352",  Icon: BarChart2,     label: "Results"      },
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
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: "#631212", fontFamily: "'Instrument Serif', Georgia, serif" }}
      >
        California Election Dates
      </h1>
      <p className="text-sm mb-8" style={{ color: "#7A6352" }}>
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
        <div
          className="absolute left-5 top-0 bottom-0 w-px"
          style={{ background: "#E0D4C0" }}
        />

        <div className="space-y-4">
          {timeline.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.registration;
            const { Icon } = config;
            const days = daysUntil(item.date);
            const isPast = days < 0;
            const isSoon = days >= 0 && days <= 30;

            return (
              <div key={item.id} className="relative flex gap-5">
                <div
                  className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                  style={{
                    background: isPast ? "#F5EFE6" : `${config.color}18`,
                    border: `1.5px solid ${isPast ? "#E0D4C0" : config.color}`,
                    opacity: isPast ? 0.5 : 1,
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} style={{ color: isPast ? "#7A6352" : config.color }} />
                </div>

                <div
                  className="card p-4 flex-1"
                  style={{
                    opacity: isPast ? 0.55 : 1,
                    borderColor: item.urgent && !isPast ? config.color : "#E0D4C0",
                    borderWidth: item.urgent && !isPast ? 1.5 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isPast ? "#7A6352" : config.color }}
                    >
                      {new Date(item.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "long", day: "numeric", year: "numeric",
                      })}
                    </span>
                    {isPast ? (
                      <span className="text-xs" style={{ color: "#7A6352" }}>Past</span>
                    ) : days === 0 ? (
                      <span className="status-badge" style={{ background: "#B3194218", color: "#B31942" }}>
                        TODAY
                      </span>
                    ) : isSoon ? (
                      <span className="status-badge" style={{ background: "#D4AF3718", color: "#B8960C" }}>
                        {days}d away
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#7A6352" }}>{days} days</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "#3D2B1F" }}>
                    {item.title}
                  </h3>
                  <p className="text-xs" style={{ color: "#7A6352", lineHeight: 1.55 }}>
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
        style={{ color: "#7A6352" }}
      >
        Dates based on California Secretary of State 2026 election calendar. Always verify with{" "}
        <a
          href="https://www.sos.ca.gov/elections"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5"
          style={{ color: "#631212" }}
        >
          sos.ca.gov <ExternalLink size={10} strokeWidth={2} />
        </a>{" "}
        for official deadlines.
      </div>
    </div>
  );
}
