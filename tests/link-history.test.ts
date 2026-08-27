import { MAX_RECENT_LINKS, prependRecentLink, readRecentLinks, type RecentLink } from "@/lib/link-history";
import { describe, expect, it } from "vitest";

const sample = (shortCode: string): RecentLink => ({ shortCode, shortUrl: `https://pendek.test/${shortCode}`, originalUrl: `https://example.com/${shortCode}`, createdAt: "2026-08-27T00:00:00.000Z" });

describe("local link history", () => {
  it("ignores malformed local storage data", () => {
    expect(readRecentLinks("not-json")).toEqual([]);
    expect(readRecentLinks(JSON.stringify([{ shortCode: "missing-fields" }]))).toEqual([]);
  });

  it("puts a new link first, removes prior duplicates, and limits retention", () => {
    const initial = Array.from({ length: MAX_RECENT_LINKS }, (_, index) => sample(`code-${index}`));
    const deduplicated = prependRecentLink(initial, sample("code-4"));
    const extended = prependRecentLink(deduplicated, sample("new-code"));

    expect(deduplicated).toHaveLength(MAX_RECENT_LINKS);
    expect(deduplicated[0].shortCode).toBe("code-4");
    expect(extended).toHaveLength(MAX_RECENT_LINKS);
    expect(extended[0].shortCode).toBe("new-code");
  });
});
