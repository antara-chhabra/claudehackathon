"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CivicProfile } from "@/lib/types";
import { getProfile, saveProfile, DEFAULT_PROFILE } from "@/lib/profile";

const CA_COUNTIES = [
  "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa",
  "Contra Costa", "Del Norte", "El Dorado", "Fresno", "Glenn", "Humboldt",
  "Imperial", "Inyo", "Kern", "Kings", "Lake", "Lassen", "Los Angeles",
  "Madera", "Marin", "Mariposa", "Mendocino", "Merced", "Modoc", "Mono",
  "Monterey", "Napa", "Nevada", "Orange", "Placer", "Plumas", "Riverside",
  "Sacramento", "San Benito", "San Bernardino", "San Diego", "San Francisco",
  "San Joaquin", "San Luis Obispo", "San Mateo", "Santa Barbara", "Santa Clara",
  "Santa Cruz", "Shasta", "Sierra", "Siskiyou", "Solano", "Sonoma", "Stanislaus",
  "Sutter", "Tehama", "Trinity", "Tulare", "Tuolumne", "Ventura", "Yolo", "Yuba",
];

const INTEREST_OPTIONS = [
  "Housing & Rent", "Education", "Healthcare", "Environment & Climate",
  "Public Safety", "Economy & Jobs", "Immigration", "Transportation",
  "Technology & Privacy", "Voting Rights",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CivicProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getProfile();
    if (existing) setProfile(existing);
  }, []);

  function toggle(interest: string) {
    setProfile((p) => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter((i) => i !== interest)
        : [...p.interests, interest],
    }));
  }

  function submit() {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
        Your Civic Profile
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
        Tell us a bit about yourself so BillMe can show you how California policies actually
        affect your life. All data stays in your browser — we never store it.
      </p>

      <div className="space-y-6">
        {/* Profession */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
            What do you do?
          </label>
          <input
            value={profile.profession}
            onChange={(e) => setProfile((p) => ({ ...p, profession: e.target.value }))}
            placeholder="e.g. teacher, nurse, gig worker, student, retired…"
          />
        </div>

        {/* County */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
            Which county do you live in?
          </label>
          <select
            value={profile.county}
            onChange={(e) => setProfile((p) => ({ ...p, county: e.target.value }))}
          >
            <option value="">Select a county…</option>
            {CA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
            Which apply to you?
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "is_renter", label: "I rent my home" },
              { key: "is_student", label: "I'm a student" },
              { key: "is_parent", label: "I have kids" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  style={{ width: "auto", padding: 0 }}
                  checked={profile[key as keyof CivicProfile] as boolean}
                  onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.checked }))}
                />
                <span className="text-sm" style={{ color: "var(--foreground)" }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
            Policy areas you care about
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const active = profile.interests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggle(interest)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: active ? "var(--accent)" : "var(--card)",
                    color: active ? "white" : "var(--muted)",
                    border: `1px solid ${active ? "var(--accent)" : "var(--card-border)"}`,
                  }}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={submit}
          className="accent-btn w-full text-base"
          style={{ padding: "14px" }}
        >
          {saved ? "Saved! Redirecting…" : "Save Profile & Go to Dashboard →"}
        </button>
      </div>
    </div>
  );
}
