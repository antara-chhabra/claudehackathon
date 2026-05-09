"use client";
import Link from "next/link";
import { PolicyCard as PolicyCardType } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  Introduced: "#3b7eed",
  Passed: "#22c55e",
  Failed: "#ef4444",
  Vetoed: "#ef4444",
  Enrolled: "#22c55e",
  Engrossed: "#f59e0b",
  Draft: "#6b7fa3",
};

interface Props {
  bill: PolicyCardType;
  relevanceTags?: string[];
}

export default function PolicyCard({ bill, relevanceTags }: Props) {
  const color = STATUS_COLORS[bill.status] || "#6b7fa3";
  return (
    <Link href={`/policy/${bill.bill_id}`} className="block">
      <div
        className="card p-5 hover:border-blue-500 transition-all cursor-pointer"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
            {bill.number}
          </span>
          <span
            className="status-badge"
            style={{ background: `${color}22`, color }}
          >
            {bill.status}
          </span>
        </div>
        <h3 className="font-semibold text-sm leading-snug mb-2" style={{ color: "var(--foreground)" }}>
          {bill.title}
        </h3>
        {relevanceTags && relevanceTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {relevanceTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Updated {bill.status_date || "recently"}
        </p>
      </div>
    </Link>
  );
}
