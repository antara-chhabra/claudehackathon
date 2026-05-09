import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BillMe — Understand California Politics",
  description:
    "AI-powered civic intelligence platform that explains California legislation, ballot measures, and elections in plain language.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
