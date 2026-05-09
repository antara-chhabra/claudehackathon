export interface CivicProfile {
  profession: string;
  county: string;
  is_renter: boolean;
  is_student: boolean;
  is_parent: boolean;
  interests: string[];
}

export interface PolicyCard {
  bill_id: number;
  number: string;
  title: string;
  description: string;
  status: string;
  status_date: string;
  url: string;
}

export interface PolicyDetail {
  bill_id: number;
  number: string;
  title: string;
  description: string;
  status: string;
  status_date: string;
  url: string;
  sponsors: { name: string; party: string }[];
  history: { date: string; action: string }[];
  ai: {
    summary: string;
    eli15: string;
    affected_groups: string[];
    why_it_matters: string;
    supporters_argue: string;
    opponents_argue: string;
  };
}

export interface TimelineItem {
  id: number;
  date: string;
  title: string;
  description: string;
  type: "registration" | "mail" | "voting" | "election" | "results";
  urgent: boolean;
}

export interface BrewingStory {
  id: number;
  headline: string;
  source: string;
  published_date?: string;
  url?: string;
  insight_summary: string;
  why_it_matters: string[];
  category: string;
  bill_number: string;
  bill_id: number | null;
}

export interface BrewingAnalysis {
  summary: string;
  policy_context: string;
  stakeholders: {
    supporters: string;
    opponents: string;
  };
  impact: {
    short_term: string;
    long_term: string;
  };
  uncertainty_note: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
