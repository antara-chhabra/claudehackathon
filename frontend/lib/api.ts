import { PolicyCard, PolicyDetail, TimelineItem, BrewingStory, BrewingAnalysis, ChatMessage, CivicProfile } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export async function getPolicies(): Promise<PolicyCard[]> {
  const data = await fetchJSON<{ policies: PolicyCard[] }>("/api/policies");
  return data.policies;
}

export async function getPolicy(billId: number): Promise<PolicyDetail> {
  return fetchJSON<PolicyDetail>(`/api/policy/${billId}`);
}

export async function getImpact(billId: number, profile: CivicProfile): Promise<string> {
  const data = await fetchJSON<{ impact: string }>(`/api/policy/${billId}/impact`, {
    method: "POST",
    body: JSON.stringify(profile),
  });
  return data.impact;
}

export async function getActions(billId: number, profile: CivicProfile): Promise<ActionItem[]> {
  const data = await fetchJSON<{ actions: ActionItem[] }>(`/api/policy/${billId}/action`, {
    method: "POST",
    body: JSON.stringify(profile),
  });
  return data.actions;
}

export async function sendChat(
  messages: ChatMessage[],
  billId?: number,
  profile?: CivicProfile
): Promise<string> {
  const data = await fetchJSON<{ reply: string }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages, bill_id: billId, profile }),
  });
  return data.reply;
}

export async function getTimeline(): Promise<TimelineItem[]> {
  const data = await fetchJSON<{ timeline: TimelineItem[] }>("/api/timeline");
  return data.timeline;
}

export async function getBrewing(): Promise<{ bills: BrewingStory[]; news: BrewingStory[] }> {
  return fetchJSON<{ bills: BrewingStory[]; news: BrewingStory[] }>("/api/brewing");
}

export async function analyzeBrewingStory(storyId: number): Promise<BrewingAnalysis> {
  const data = await fetchJSON<{ analysis: BrewingAnalysis }>(`/api/brewing/${storyId}/analyze`, {
    method: "POST",
  });
  return data.analysis;
}

export interface ActionItem {
  icon: string;
  title: string;
  description: string;
  link: string;
  link_text: string;
}
