import { createMemoryRateLimiter } from "@/lib/rate-limit";
import { describe, expect, it } from "vitest";

describe("memory rate limit fallback", () => {
  it("accepts requests up to the configured window limit and rejects the next request", () => {
    const consume = createMemoryRateLimiter();
    const first = consume("198.51.100.42", 2, 60_000);
    const second = consume("198.51.100.42", 2, 60_000);
    const blocked = consume("198.51.100.42", 2, 60_000);

    expect(first).toMatchObject({ allowed: true, remaining: 1, source: "memory" });
    expect(second).toMatchObject({ allowed: true, remaining: 0, source: "memory" });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keeps counters isolated per requester", () => {
    const consume = createMemoryRateLimiter();
    consume("198.51.100.42", 1, 60_000);
    expect(consume("203.0.113.9", 1, 60_000).allowed).toBe(true);
  });
});

