"use client";
import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import { getProfile } from "@/lib/profile";
import { CivicProfile } from "@/lib/types";

const SUGGESTED = [
  "What's the most significant housing bill this session?",
  "How does California's school funding work?",
  "What are my rights as a renter in California?",
  "What is a ballot proposition and how does it become law?",
  "How do I find out who represents me in Sacramento?",
  "What's the difference between a primary and general election?",
];

export default function ChatPage() {
  const [profile, setProfile] = useState<CivicProfile | null>(null);
  useEffect(() => { setProfile(getProfile()); }, []);


  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
        Ask the AI
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Ask anything about California politics, legislation, or civic participation. Get plain-language,
        nonpartisan answers.
      </p>

      <div className="card p-6">
        <ChatInterface
          initialContext={
            profile
              ? `Hi! I'm BillMe's AI assistant. I know you're ${
                  profile.profession ? `a ${profile.profession}` : "a California resident"
                }${profile.county ? ` in ${profile.county} County` : ""}. What would you like to understand about California politics or legislation?`
              : "Hi! I'm BillMe's AI. I can explain California bills, ballot measures, how the legislature works, and more. What would you like to know?"
          }
          suggestedQuestions={SUGGESTED}
        />
      </div>
    </div>
  );
}
