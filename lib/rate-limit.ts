import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds: number;
  source: "redis" | "memory";
};

type MemoryRecord = { count: number; reset: number };

/**
 * A small development fallback. Production must define the Upstash REST URL and
 * token so all server instances draw from one shared Redis counter.
 */
export function createMemoryRateLimiter() {
  const store = new Map<string, MemoryRecord>();

  return (key: string, limit = 12, windowMs = 60_000): RateLimitResult => {
    const now = Date.now();
    const current = store.get(key);

    if (!current || current.reset <= now) {
      const reset = now + windowMs;
      store.set(key, { count: 1, reset });
      return { allowed: true, limit, remaining: limit - 1, reset, retryAfterSeconds: 0, source: "memory" };
    }

    if (current.count >= limit) {
      return { allowed: false, limit, remaining: 0, reset: current.reset, retryAfterSeconds: Math.max(1, Math.ceil((current.reset - now) / 1000)), source: "memory" };
    }

    current.count += 1;
    return { allowed: true, limit, remaining: limit - current.count, reset: current.reset, retryAfterSeconds: 0, source: "memory" };
  };
}

const consumeFromMemory = createMemoryRateLimiter();
const hasUpstashConfiguration = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const distributedLimiter = hasUpstashConfiguration
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(12, "60 s"),
      prefix: "pendek:create-link",
      analytics: false,
    })
  : null;

export async function takeRateLimitToken(key: string): Promise<RateLimitResult> {
  if (!distributedLimiter) return consumeFromMemory(key);

  try {
    const result = await distributedLimiter.limit(key);
    return {
      allowed: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfterSeconds: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      source: "redis",
    };
  } catch (error) {
    console.error("[rate-limit] Redis tidak tersedia; memakai fallback proses lokal.", error);
    return consumeFromMemory(key);
  }
}
