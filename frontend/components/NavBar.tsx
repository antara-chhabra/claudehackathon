"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale } from "lucide-react";

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
        background: "rgba(253, 251, 247, 0.92)",
        borderBottom: "1px solid #E0D4C0",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-base" style={{ color: "#631212" }}>
          <Scale size={18} strokeWidth={1.5} />
          BillMe
        </Link>

        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                color: path.startsWith(l.href) ? "#631212" : "#7A6352",
                background: path.startsWith(l.href) ? "#63121210" : "transparent",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/onboarding"
            className="ml-3 text-sm font-semibold px-4 py-1.5 rounded-lg transition-all"
            style={{
              background: "#631212",
              color: "#FDFBF7",
              borderRadius: 8,
            }}
          >
            My Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
