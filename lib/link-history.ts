export const LINK_HISTORY_STORAGE_KEY = "pendek:recent-links:v1";
export const MAX_RECENT_LINKS = 8;

export type RecentLink = {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
};

function isRecentLink(value: unknown): value is RecentLink {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["shortCode", "shortUrl", "originalUrl", "createdAt"].every((key) => typeof item[key] === "string");
}

export function readRecentLinks(serialized: string | null): RecentLink[] {
  if (!serialized) return [];
  try {
    const value: unknown = JSON.parse(serialized);
    return Array.isArray(value) ? value.filter(isRecentLink).slice(0, MAX_RECENT_LINKS) : [];
  } catch {
    return [];
  }
}

export function prependRecentLink(history: RecentLink[], item: RecentLink): RecentLink[] {
  return [item, ...history.filter((entry) => entry.shortCode !== item.shortCode)].slice(0, MAX_RECENT_LINKS);
}

export function removeRecentLink(history: RecentLink[], shortCode: string): RecentLink[] {
  return history.filter((entry) => entry.shortCode !== shortCode);
}
