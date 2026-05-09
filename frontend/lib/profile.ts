import { CivicProfile } from "./types";

const KEY = "civicmirror_profile";

export function getProfile(): CivicProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProfile(profile: CivicProfile): void {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  localStorage.removeItem(KEY);
}

export const DEFAULT_PROFILE: CivicProfile = {
  profession: "",
  county: "",
  is_renter: false,
  is_student: false,
  is_parent: false,
  interests: [],
};
