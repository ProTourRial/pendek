import { createLinkSchema, isPublicHttpUrl } from "@/lib/validation";
import { describe, expect, it } from "vitest";

describe("destination validation", () => {
  it("allows valid web destinations with a verification token", () => {
    expect(isPublicHttpUrl("https://example.com/docs?a=1")).toBe(true);
    expect(createLinkSchema.safeParse({ originalUrl: "http://example.com", customCode: "docs_2026", recaptchaToken: "verified-token" }).success).toBe(true);
  });

  it("rejects non-web protocols, malformed aliases, and missing verification", () => {
    expect(isPublicHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isPublicHttpUrl("not a url")).toBe(false);
    expect(createLinkSchema.safeParse({ originalUrl: "https://example.com", customCode: "API", recaptchaToken: "verified-token" }).success).toBe(false);
    expect(createLinkSchema.safeParse({ originalUrl: "https://example.com" }).success).toBe(false);
  });
});
