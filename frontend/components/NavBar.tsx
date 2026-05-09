"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Feed" },
  { href: "/brewing", label: "What's Brewing" },
  { href: "/timeline", label: "Key Dates" },
  { href: "/chat", label: "Ask AI" },
];

export default function NavBar() {
  const path = usePathname();
  return (
    <nav
      style={{
        background: "#080d1a",
        borderBottom: "1px solid var(--card-border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: "var(--accent)" }}>
          <span style={{ fontSize: 22 }}>⚖️</span> BillMe
        </Link>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: path.startsWith(l.href) ? "var(--accent)" : "var(--muted)",
                background: path.startsWith(l.href) ? "var(--accent-glow)" : "transparent",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/onboarding"
            className="ml-2 accent-btn text-sm"
            style={{ padding: "6px 14px", borderRadius: 8 }}
          >
            My Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
