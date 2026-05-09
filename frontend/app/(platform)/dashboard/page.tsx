"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PolicyCard as PolicyCardType, CivicProfile } from "@/lib/types";
import { getPolicies } from "@/lib/api";
import { getProfile } from "@/lib/profile";
import PolicyCard from "@/components/PolicyCard";

const INTEREST_KEYWORDS: Record<string, string[]> = {
  "Housing & Rent": ["rent", "housing", "evict", "tenant", "landlord", "apartment", "social housing", "homeless"],
  "Education": ["school", "education", "teacher", "student", "university", "college", "curriculum", "classroom", "meal", "tuition"],
  "Healthcare": ["health", "medi-cal", "medical", "hospital", "mental health", "patient", "healthcare", "insurance", "medicaid"],
  "Environment & Climate": ["environment", "climate", "clean energy", "wildfire", "water", "plastic", "pollution", "air quality", "emission", "warehouse"],
  "Public Safety": ["safety", "police", "firearm", "gun", "crime", "criminal", "violence", "ghost gun"],
  "Economy & Jobs": ["job", "worker", "wage", "gig", "economy", "eitc", "calworks", "income", "tax", "minimum wage", "unemployment"],
  "Immigration": ["immigration", "immigrant", "undocumented", "daca", "asylum"],
  "Transportation": ["transit", "transportation", "commute", "vehicle", "bus", "rail", "youth transit", "fare"],
  "Technology & Privacy": ["technology", "ai", "artificial intelligence", "privacy", "data", "tech", "algorithm", "surveillance"],
  "Voting Rights": ["vote", "voting", "voter", "ballot", "election", "registration", "primary"],
};

const PROFESSION_KEYWORDS: Record<string, string[]> = {
  teacher: ["school", "education", "student", "teacher", "classroom", "curriculum", "university", "college", "meal"],
  nurse: ["health", "medi-cal", "medical", "hospital", "mental health", "patient", "healthcare"],
  doctor: ["health", "medi-cal", "medical", "hospital", "mental health", "patient", "healthcare"],
  engineer: ["technology", "ai", "artificial intelligence", "infrastructure", "energy", "tech", "warehouse"],
  lawyer: ["court", "legal", "criminal", "justice", "law", "penalty", "firearm", "gun"],
  "social worker": ["homelessness", "housing", "mental health", "calworks", "child", "family"],
  farmer: ["water", "agriculture", "environment", "pesticide", "land", "air quality"],
  student: ["student", "education", "school", "university", "college", "loan", "transit", "meal"],
  parent: ["child", "school", "education", "family", "youth", "parent", "meal"],
  "gig worker": ["gig", "worker", "wage", "job", "income", "transit"],
  firefighter: ["wildfire", "safety", "emergency", "climate", "fire"],
};

function getRelevanceTags(bill: PolicyCardType, profile: CivicProfile): string[] {
  const text = `${bill.title} ${bill.description}`.toLowerCase();
  const tags: string[] = [];

  // Interest area matching
  for (const interest of profile.interests || []) {
    const keywords = INTEREST_KEYWORDS[interest] || [];
    if (keywords.some((kw) => text.includes(kw))) {
      tags.push(interest);
    }
  }

  // Profession matching
  const profKey = profile.profession?.toLowerCase();
  if (profKey) {
    const keywords = PROFESSION_KEYWORDS[profKey] || [profKey];
    if (keywords.some((kw) => text.includes(kw))) {
      tags.push(`For ${profile.profession}s`);
    }
  }

  // Demographic matching
  if (profile.is_renter && /rent|tenant|evict|housing|landlord/.test(text)) {
    tags.push("Affects renters");
  }
  if (profile.is_student && /student|school|education|college|university|loan/.test(text)) {
    tags.push("Affects students");
  }
  if (profile.is_parent && /child|parent|school|youth|family|meal/.test(text)) {
    tags.push("Affects parents");
  }

  return [...new Set(tags)];
}

function isRelevant(bill: PolicyCardType, profile: CivicProfile): boolean {
  return getRelevanceTags(bill, profile).length > 0;
}

export default function DashboardPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<PolicyCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ReturnType<typeof getProfile>>(null);

  useEffect(() => {
    setProfile(getProfile());
    getPolicies()
      .then(setPolicies)
      .catch(() => setError("Could not load policies. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            California Policy Feed
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Live bills from the California legislature, explained by AI
            {profile?.profession ? ` for ${profile.profession}s` : ""}.
          </p>
        </div>
        {!profile && (
          <button
            onClick={() => router.push("/onboarding")}
            className="accent-btn text-sm"
            style={{ padding: "8px 16px" }}
          >
            Set Up My Profile
          </button>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="card p-5 animate-pulse"
              style={{ height: 120 }}
            >
              <div className="h-3 rounded mb-3" style={{ background: "var(--card-border)", width: "40%" }} />
              <div className="h-4 rounded mb-2" style={{ background: "var(--card-border)" }} />
              <div className="h-4 rounded" style={{ background: "var(--card-border)", width: "80%" }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          className="card p-6 text-center"
          style={{ border: "1px solid var(--danger)", color: "var(--danger)" }}
        >
          <p className="font-semibold mb-1">Backend not reachable</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{error}</p>
          <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
            Make sure the FastAPI backend is running on port 8000.
          </p>
        </div>
      )}

      {!loading && !error && (() => {
        const hasProfile = !!profile;
        const hasPreferences = hasProfile && (
          (profile!.interests?.length > 0) ||
          !!profile!.profession ||
          profile!.is_renter ||
          profile!.is_student ||
          profile!.is_parent
        );

        const withTags = policies.map((bill) => ({
          bill,
          tags: hasProfile ? getRelevanceTags(bill, profile!) : [],
        }));

        // Filter to relevant only when the user has set preferences
        const filtered = hasPreferences
          ? withTags.filter(({ tags }) => tags.length > 0)
          : withTags;

        // Sort by number of matching tags
        const sorted = [...filtered].sort((a, b) => b.tags.length - a.tags.length);

        return (
          <>
            {hasPreferences && (
              <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                Showing {sorted.length} bill{sorted.length !== 1 ? "s" : ""} relevant to your profile.{" "}
                {filtered.length < policies.length && (
                  <a href="/onboarding" style={{ color: "var(--accent)" }}>Update interests</a>
                )}
              </p>
            )}
            {sorted.length === 0 && hasPreferences && (
              <div className="card p-8 text-center">
                <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>
                  No bills matched your current profile.
                </p>
                <a href="/onboarding" className="accent-btn text-sm inline-block">Update My Profile</a>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map(({ bill, tags }) => (
                <PolicyCard key={bill.bill_id} bill={bill} relevanceTags={tags} />
              ))}
            </div>
          </>
        );
      })()}
    </div>
  );
}
