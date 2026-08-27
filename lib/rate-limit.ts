type RateLimitRecord = { count: number; resetAt: number };

const store = new Map<string, RateLimitRecord>();

/** Best-effort process-local protection; use distributed edge limiting at scale. */
export function takeRateLimitToken(key: string, limit = 12, windowMs = 60_000) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
