"use client";
import Link from "next/link";
import { PolicyCard as PolicyCardType } from "@/lib/types";
import { FileText } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Introduced: "#3b7eed",
  Passed:     "#22c55e",
  Failed:     "#B31942",
  Vetoed:     "#B31942",
  Enrolled:   "#22c55e",
  Engrossed:  "#D4AF37",
  Draft:      "#7A6352",
};

interface Props {
  bill: PolicyCardType;
  relevanceTags?: string[];
}

export default function PolicyCard({ bill, relevanceTags }: Props) {
  const color = STATUS_COLORS[bill.status] || "#7A6352";
  const isRelevant = relevanceTags && relevanceTags.length > 0;

  return (
    <Link href={`/policy/${bill.bill_id}`} className="block group">
      <div
        className="card p-5 transition-all duration-200 group-hover:shadow-lg"
        style={{
          borderLeft: isRelevant ? "3px solid #631212" : "1px solid var(--card-border)",
          borderColor: isRelevant ? undefined : "var(--card-border)",
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <FileText size={14} strokeWidth={1.5} style={{ color: "#631212", flexShrink: 0 }} />
            <span className="text-xs font-bold tracking-wide" style={{ color: "#631212" }}>
              {bill.number}
            </span>
          </div>
          <span
            className="status-badge"
            style={{ background: `${color}18`, color }}
          >
            {bill.status}
          </span>
        </div>

        <h3
          className="font-semibold text-sm leading-snug mb-3"
          style={{ color: "#3D2B1F", lineHeight: 1.5 }}
        >
          {bill.title}
        </h3>

        {isRelevant && (
          <div className="flex flex-wrap gap-1 mb-3">
            {relevanceTags!.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: "#63121214",
                  color: "#631212",
                  border: "1px solid #63121230",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs" style={{ color: "#7A6352" }}>
          Updated {bill.status_date || "recently"}
        </p>
      </div>
    </Link>
  );
}
