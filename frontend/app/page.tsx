"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Scale } from "lucide-react";

const BG = "#EAE0D5";
const BLACK = "#1C1412";
const MAROON = "#631212";
const GREEN = "#2D5A3D";
const BODY = "#4A3728";
const MUTED = "#8B7B6B";
const CARD = "#FDFBF7";
const BORDER = "#D8CCB8";

const LINE_BG = `repeating-linear-gradient(
  to bottom,
  transparent,
  transparent 39px,
  rgba(160,140,120,0.13) 39px,
  rgba(160,140,120,0.13) 40px
)`;

const GITHUB = "https://github.com/antara-chhabra/claudehackathon";

/* ── Nav matches platform tab order ──────────────────────────── */
const NAV_LINKS = [
  { label: "PROBLEM",    href: "#problem"       },
  { label: "FEED",       href: "#feed"          },
  { label: "BREWING",    href: "#brewing"       },
  { label: "KEY DATES",  href: "#key-dates"     },
  { label: "ASK AI",     href: "#ask-ai"        },
  { label: "MY PROFILE", href: "#my-profile"    },
  { label: "TRUST",      href: "#trust"         },
];

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 60, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 5vw",
      background: scrolled ? "rgba(234,224,213,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${BORDER}` : "1px solid transparent",
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <Scale size={17} strokeWidth={1.8} style={{ color: MAROON }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: BLACK, letterSpacing: "-0.01em" }}>
          BillMe
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {NAV_LINKS.map(({ label, href }) => (
          <a key={label} href={href} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.09em",
            color: BODY, textDecoration: "none", opacity: 0.72,
          }}>
            {label}
          </a>
        ))}
      </div>

      <Link href="/dashboard" style={{
        fontSize: 13, fontWeight: 500, color: BLACK,
        border: `1.5px solid ${BLACK}`, borderRadius: 999,
        padding: "7px 18px", textDecoration: "none",
      }}>
        Enter Platform →
      </Link>
    </nav>
  );
}

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
      color: MUTED, marginBottom: 48,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      {num}
      <span style={{ display: "inline-block", width: 32, height: 1, background: BORDER }} />
      {title}
    </div>
  );
}

function BillCard({ number, category, title, sub }: {
  number: string; category: string; title: string; sub: string;
}) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 16, padding: "24px 28px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", color: MAROON }}>
          {number} · {category}
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.06em", color: MUTED }}>FOR YOU</div>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: BLACK, lineHeight: 1.25, marginBottom: 8, fontFamily: "'Instrument Serif', Georgia, serif" }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>{sub}</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: BG, color: BLACK, fontFamily: "'Inter', -apple-system, sans-serif", overflowX: "hidden" }}>
      <LandingNav />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", padding: "0 5vw",
        display: "flex", flexDirection: "column",
        paddingTop: 60, position: "relative",
        backgroundImage: LINE_BG, backgroundColor: BG,
      }}>
        <div style={{ paddingTop: "4vh", flex: 1 }}>
          <div style={{
            fontSize: "clamp(46px, 6.5vw, 92px)", fontWeight: 800,
            lineHeight: 1.04, letterSpacing: "-0.03em", color: BLACK, marginBottom: 8,
          }}>
            Government decisions<br />shape your life.
          </div>
          <div style={{
            fontSize: "clamp(46px, 6.5vw, 92px)",
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: "italic", fontWeight: 400,
            lineHeight: 1.04, color: MAROON, marginBottom: 36,
          }}>
            Understanding them<br />should be a right.
          </div>

          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: BLACK, color: BG, fontSize: 15, fontWeight: 600,
            padding: "14px 28px", borderRadius: 999, textDecoration: "none",
            letterSpacing: "-0.01em", marginBottom: 18,
          }}>
            Enter BillMe →
          </Link>

          <p style={{ maxWidth: 420, fontSize: 16, color: BODY, lineHeight: 1.7, margin: 0 }}>
            BillMe transforms legislation, elections, and ballot measures into personalized
            AI-powered explanations. Built for Californians who deserve clarity.
          </p>
        </div>

        <div style={{ paddingBottom: 36 }}>
          <div style={{
            display: "flex", justifyContent: "flex-end",
            alignItems: "center", gap: 12, marginBottom: 28, flexWrap: "wrap",
          }}>
            <Link href="/onboarding" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: BLACK, color: BG, fontSize: 14, fontWeight: 500,
              padding: "12px 22px", borderRadius: 999, textDecoration: "none",
            }}>
              Build Your Profile →
            </Link>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", fontSize: 14,
              fontWeight: 500, padding: "12px 22px", borderRadius: 999,
              textDecoration: "none", border: `1.5px solid ${BLACK}`, color: BLACK,
            }}>
              See How It Works
            </a>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 11, letterSpacing: "0.08em", color: MUTED,
          }}>
            <span>BILLME © 2026</span>
            <span>SCROLL ↓</span>
          </div>
        </div>
      </section>

      {/* ── 01 THE PROBLEM ────────────────────────────────────────── */}
      <section id="problem" style={{
        minHeight: "100vh", padding: "12vh 5vw",
        display: "flex", flexDirection: "column", justifyContent: "center",
        backgroundImage: LINE_BG, backgroundColor: BG,
      }}>
        <SectionLabel num="01" title="THE PROBLEM" />
        <div style={{
          fontSize: "clamp(44px, 6vw, 84px)",
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontWeight: 400, lineHeight: 1.1, maxWidth: "58%", color: BLACK,
        }}>
          Most people don&apos;t avoid democracy because they don&apos;t care.
        </div>
        <div style={{
          fontSize: "clamp(44px, 6vw, 84px)",
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: "italic", fontWeight: 400,
          lineHeight: 1.1, maxWidth: "58%", color: MAROON, marginTop: 28,
        }}>
          They avoid it because it&apos;s overwhelming.
        </div>
      </section>

      {/* ── 02 FEED ───────────────────────────────────────────────── */}
      <section id="feed" style={{
        minHeight: "100vh", padding: "12vh 5vw",
        display: "flex", flexDirection: "column", justifyContent: "center",
        backgroundColor: BG,
      }}>
        <SectionLabel num="02" title="FEED" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <h2 style={{
              fontSize: "clamp(36px, 4.5vw, 64px)", fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-0.025em", color: BLACK, marginBottom: 36,
            }}>
              Complexity,<br />becoming clarity.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                "Plain-English summaries of every bill",
                "Explain Like I'm 15 — for any legislation",
                "Personalized impact based on your life",
                "Both sides of every debate, no spin",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 16, color: BODY, fontSize: 16 }}>
                  <div style={{ width: 28, height: 1, background: BORDER, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
            <Link href="/dashboard" style={{
              display: "inline-flex", marginTop: 40, padding: "12px 24px",
              borderRadius: 999, border: `1.5px solid ${BLACK}`,
              fontSize: 14, fontWeight: 500, color: BLACK, textDecoration: "none",
            }}>
              Browse the Feed →
            </Link>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 20, padding: 36,
              boxShadow: "0 8px 40px rgba(61,43,31,0.08)",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.09em", color: MUTED, marginBottom: 20, fontWeight: 600 }}>
                SUMMARY
              </div>
              <div style={{
                fontSize: 22, fontWeight: 700, color: BLACK, lineHeight: 1.25,
                marginBottom: 16, fontFamily: "'Instrument Serif', Georgia, serif",
              }}>
                What it actually does
              </div>
              <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, margin: "0 0 28px" }}>
                Allocates $2.1B for K-12 facility upgrades across California,
                prioritizing under-funded districts. Creates a fast-track approval
                process for seismic retrofits.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: "0.07em", color: MUTED }}>
                <span>STEP 02 / 03</span>
                <span>AI summary</span>
              </div>
            </div>
            <div style={{
              position: "absolute", top: -12, right: -12,
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: "8px 14px",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: MAROON,
            }}>
              AB-2456 · EDUCATION
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 WHAT'S BREWING ─────────────────────────────────────── */}
      <section id="brewing" style={{
        minHeight: "100vh", padding: "0 5vw",
        display: "flex", flexDirection: "column", justifyContent: "center",
        backgroundImage: LINE_BG, backgroundColor: BG,
      }}>
        <SectionLabel num="03" title="WHAT'S BREWING" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <h2 style={{
              fontSize: "clamp(36px, 4.5vw, 62px)", fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-0.025em", color: BLACK, marginBottom: 24,
            }}>
              California politics,<br />
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontWeight: 400, color: MAROON }}>
                in real time.
              </span>
            </h2>
            <p style={{ fontSize: 17, color: BODY, lineHeight: 1.7, maxWidth: 380, marginBottom: 36 }}>
              Live news from CalMatters, the LA Times, and more —
              with AI civic interpretation layered on top. Know what&apos;s happening
              before it affects you.
            </p>
            <Link href="/brewing" style={{
              display: "inline-flex", padding: "12px 24px", borderRadius: 999,
              background: BLACK, fontSize: 14, fontWeight: 500, color: BG, textDecoration: "none",
            }}>
              See What&apos;s Brewing →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { cat: "HOUSING",   headline: "California landlord groups push back on SB-9 renter expansion" },
              { cat: "CLIMATE",   headline: "Governor signs $3B wildfire resilience package into law" },
              { cat: "EDUCATION", headline: "LAUSD faces $500M budget gap heading into 2026-27 school year" },
            ].map(({ cat, headline }) => (
              <div key={headline} style={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 14, padding: "18px 22px",
                display: "flex", alignItems: "flex-start", gap: 16,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: MAROON, minWidth: 72, paddingTop: 3 }}>
                  {cat}
                </div>
                <div style={{ fontSize: 14, color: BLACK, fontWeight: 600, lineHeight: 1.4 }}>{headline}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 KEY DATES ──────────────────────────────────────────── */}
      <section id="key-dates" style={{
        minHeight: "100vh", padding: "12vh 5vw",
        display: "flex", flexDirection: "column", justifyContent: "center",
        backgroundColor: BG,
      }}>
        <SectionLabel num="04" title="KEY DATES" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <h2 style={{
              fontSize: "clamp(36px, 4.5vw, 62px)", fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-0.025em", color: BLACK, marginBottom: 24,
            }}>
              Never miss a<br />
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontWeight: 400, color: MAROON }}>
                civic deadline.
              </span>
            </h2>
            <p style={{ fontSize: 17, color: BODY, lineHeight: 1.7, maxWidth: 380, marginBottom: 36 }}>
              Registration cutoffs, mail ballot windows, early voting, and election
              day — all in one place with countdown timers so nothing slips by.
            </p>
            <Link href="/timeline" style={{
              display: "inline-flex", padding: "12px 24px", borderRadius: 999,
              border: `1.5px solid ${BLACK}`, fontSize: 14, fontWeight: 500,
              color: BLACK, textDecoration: "none",
            }}>
              View Key Dates →
            </Link>
          </div>

          {/* Timeline mockup */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { type: "Registration", date: "Feb 18, 2026", days: "285 days", color: "#3b7eed", done: false },
              { type: "Mail Ballot",  date: "May 4, 2026",  days: "160 days", color: "#D4AF37", done: false },
              { type: "Early Voting", date: "May 9, 2026",  days: "155 days", color: "#22c55e", done: false },
              { type: "Election Day", date: "Jun 2, 2026",  days: "Soon",     color: "#B31942", done: false },
            ].map(({ type, date, days, color }, i) => (
              <div key={type} style={{ display: "flex", gap: 20, alignItems: "flex-start", position: "relative" }}>
                {/* Line */}
                {i < 3 && (
                  <div style={{
                    position: "absolute", left: 15, top: 32, bottom: -16,
                    width: 1, background: BORDER, zIndex: 0,
                  }} />
                )}
                {/* Dot */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: `${color}18`, border: `1.5px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", zIndex: 1, marginTop: 16,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                </div>
                {/* Card */}
                <div style={{
                  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
                  padding: "12px 18px", flex: 1, marginBottom: 12,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 2 }}>{type}</div>
                    <div style={{ fontSize: 13, color: BODY }}>{date}</div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                    padding: "3px 10px", borderRadius: 999,
                    background: `${color}15`, color,
                  }}>
                    {days}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 ASK AI ─────────────────────────────────────────────── */}
      <section id="ask-ai" style={{
        minHeight: "100vh", padding: "12vh 5vw",
        display: "flex", flexDirection: "column", justifyContent: "center",
        backgroundImage: LINE_BG, backgroundColor: BG,
      }}>
        <SectionLabel num="05" title="ASK AI" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <h2 style={{
              fontSize: "clamp(36px, 4.5vw, 62px)", fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-0.025em", color: BLACK, marginBottom: 24,
            }}>
              Explain it like<br />I&apos;m{" "}
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
                fifteen.
              </span>
            </h2>
            <p style={{ fontSize: 17, color: BODY, lineHeight: 1.7, maxWidth: 380, marginBottom: 36 }}>
              Ask anything. BillMe replies in clear language —
              patient, honest, and grounded in primary sources. No jargon. No spin.
            </p>
            <Link href="/chat" style={{
              display: "inline-flex", padding: "12px 24px", borderRadius: 999,
              border: `1.5px solid ${BLACK}`, fontSize: 14, fontWeight: 500,
              color: BLACK, textDecoration: "none",
            }}>
              Ask the AI →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                background: BLACK, color: BG, fontSize: 15, lineHeight: 1.5,
                padding: "14px 20px", borderRadius: "20px 20px 4px 20px", maxWidth: "80%",
              }}>
                What does AB-2456 actually do? Explain it like I&apos;m 15.
              </div>
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: MAROON }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: BODY }}>BILLME</span>
              </div>
              <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, margin: "0 0 20px" }}>
                Sure. AB-2456 takes about $2 billion from the state surplus and gives it to
                public schools — but only the ones that really need building repairs, like
                fixing earthquake damage or old roofs. Construction starts next fall.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["leginfo.ca.gov", "CDE Fact Sheet", "LAO Analysis"].map(src => (
                  <span key={src} style={{
                    fontSize: 12, padding: "4px 12px", borderRadius: 999,
                    border: `1px solid ${BORDER}`, color: MUTED,
                  }}>{src}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                fontSize: 14, color: BODY, padding: "10px 18px",
                borderRadius: 999, border: `1px solid ${BORDER}`, background: CARD,
              }}>
                Tell me who supports it →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 MY PROFILE ─────────────────────────────────────────── */}
      <section id="my-profile" style={{
        minHeight: "100vh", padding: "8vh 5vw",
        display: "flex", flexDirection: "column", justifyContent: "center",
        backgroundColor: BG,
      }}>
        <SectionLabel num="06" title="MY PROFILE" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <h2 style={{
              fontSize: "clamp(32px, 3.8vw, 56px)", fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-0.025em", color: BLACK, marginBottom: 0,
            }}>
              Civic intelligence,
            </h2>
            <div style={{
              fontSize: "clamp(32px, 3.8vw, 56px)",
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: "italic", fontWeight: 400,
              lineHeight: 1.1, color: MAROON, marginBottom: 20,
            }}>
              tuned to you.
            </div>
            <p style={{ fontSize: 15, color: BODY, lineHeight: 1.65, maxWidth: 400, marginBottom: 20 }}>
              Tell us a little about your life — where you live, what you do,
              what you care about. BillMe surfaces the policies that genuinely move your world.
            </p>
            {[
              ["ROLE",       "High-school teacher"],
              ["CITY",       "San Diego, CA"],
              ["HOUSING",    "Renter"],
              ["PRIORITIES", "Education · Climate · Housing"],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13,
              }}>
                <span style={{ color: MUTED, letterSpacing: "0.07em", fontWeight: 600, fontSize: 11 }}>{label}</span>
                <span style={{ color: BODY }}>{value}</span>
              </div>
            ))}
            <Link href="/onboarding" style={{
              display: "inline-flex", marginTop: 22, padding: "12px 24px",
              borderRadius: 999, background: BLACK, fontSize: 14,
              fontWeight: 500, color: BG, textDecoration: "none",
            }}>
              Build My Civic Profile →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <BillCard number="AB-2456" category="EDUCATION"
              title="+$2.1B school facility funding"
              sub="Your district qualifies for tier-1 retrofits beginning Fall 2026." />
            <BillCard number="SB-9" category="HOUSING"
              title="Renter protections extended"
              sub="Just-cause eviction now applies to single-family rentals statewide." />
            <BillCard number="PROP 30" category="CLIMATE"
              title="EV incentives for low-income families"
              sub="Expands rebates and adds charging infrastructure to your county." />
          </div>
        </div>
      </section>

      {/* ── 07 TRUST ──────────────────────────────────────────────── */}
      <section id="trust" style={{
        padding: "12vh 5vw 14vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        backgroundImage: LINE_BG, backgroundColor: BG,
      }}>
        <SectionLabel num="07" title="TRANSPARENCY" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <h2 style={{
              fontSize: "clamp(36px, 4.5vw, 62px)", fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-0.025em", color: BLACK, marginBottom: 0,
            }}>
              AI should clarify<br />democracy —
            </h2>
            <div style={{
              fontSize: "clamp(36px, 4.5vw, 62px)",
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: "italic", fontWeight: 400,
              lineHeight: 1.1, color: GREEN, marginBottom: 36,
            }}>
              not manipulate it.
            </div>
            <p style={{ fontSize: 17, color: BODY, lineHeight: 1.7, maxWidth: 380 }}>
              Every claim is sourced. Every confidence score is shown.
              Every viewpoint is balanced. BillMe is built so you can
              question it — and verify it.
            </p>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            border: `1px solid ${BORDER}`, borderRadius: 20,
            overflow: "hidden", background: CARD,
          }}>
            {[
              { title: "SOURCE CITATIONS",    body: "Every claim links to legislation, LAO analyses, or official records." },
              { title: "CONFIDENCE SCORES",   body: "Each summary shows model certainty and gaps in available data." },
              { title: "VIEWPOINT BALANCE",   body: "Arguments for and against — surfaced together, never in isolation." },
              { title: "WHY AM I SEEING THIS?", body: "Personalization is always inspectable, and always reversible." },
            ].map((item, i) => (
              <div key={item.title} style={{
                padding: "28px 24px",
                borderRight: i % 2 === 0 ? `1px solid ${BORDER}` : "none",
                borderBottom: i < 2 ? `1px solid ${BORDER}` : "none",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", color: MAROON, marginBottom: 12 }}>
                  {item.title}
                </div>
                <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 80, fontSize: 13, letterSpacing: "0.06em", color: MUTED,
        }}>
          <span>BILLME © 2026</span>
          <span>Built by Antara and Mohammad</span>
        </div>
      </section>
    </div>
  );
}
