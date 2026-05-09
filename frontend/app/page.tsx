import Link from "next/link";

const features = [
  {
    icon: "📋",
    title: "Live Policy Feed",
    desc: "Real California bills from LegiScan, explained in plain language — not legalese.",
  },
  {
    icon: "🤖",
    title: "Explain Like I'm 15",
    desc: "Ask anything about a bill. Get a conversational answer you can actually understand.",
  },
  {
    icon: "🎯",
    title: "Personalized Impact",
    desc: "Tell us about yourself. See exactly how each policy could affect your life.",
  },
  {
    icon: "📰",
    title: "What's Brewing",
    desc: "AI-curated election intelligence. Stay informed on what's actually moving.",
  },
  {
    icon: "📅",
    title: "Key Dates",
    desc: "Never miss a registration deadline, mail ballot date, or election day.",
  },
  {
    icon: "⚖️",
    title: "Both Sides, No Spin",
    desc: "We show what supporters and opponents argue — you decide what you think.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="text-center py-20 px-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent)" }}
        >
          ⚖️ Claude Builders Club Hackathon · Track 2: Governance &amp; Collaboration
        </div>
        <h1
          className="text-5xl font-bold mb-4 leading-tight"
          style={{ color: "var(--foreground)" }}
        >
          Democracy is confusing.
          <br />
          <span style={{ color: "var(--accent)" }}>We fix that.</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          BillMe uses AI to translate California legislation, ballot measures, and elections
          into language real people understand — personalized to your life, nonpartisan by design.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/onboarding" className="accent-btn text-base">
            Build My Civic Profile →
          </Link>
          <Link href="/dashboard" className="muted-btn text-base">
            Browse Policy Feed
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {features.map((f) => (
          <div key={f.title} className="card p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>{f.title}</h3>
            <p className="text-sm" style={{ color: "var(--muted)", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Trust statement */}
      <div
        className="card p-8 text-center"
        style={{ borderColor: "var(--accent)", background: "var(--accent-glow)" }}
      >
        <p className="font-semibold text-lg mb-2" style={{ color: "var(--foreground)" }}>
          Built for informed citizens, not partisan agendas.
        </p>
        <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          BillMe never tells you how to vote. Every summary cites its source. Every perspective
          includes the other side. We illuminate — you decide.
        </p>
      </div>
    </div>
  );
}
