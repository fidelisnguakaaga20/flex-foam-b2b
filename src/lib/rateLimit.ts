// src/lib/rateLimit.ts

// Simple in-memory sliding-window rate limiter.
// NOTE: This is fine for a single-node TEST/staging setup.
// For production you’d use Redis or another shared store.

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryInMs: number };

const BUCKETS = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  {
    limit,
    windowMs,
  }: {
    limit: number;
    windowMs: number;
  },
): RateLimitResult {
  const now = Date.now();

  // Keep only hits within the window
  const existing = BUCKETS.get(key) ?? [];
  const bucket = existing.filter((t) => now - t < windowMs);

  // If already at or over limit, compute retry time
  if (bucket.length >= limit) {
    const oldest = bucket[0] ?? now; // TS-safe: fallback to now
    const retryInMs = windowMs - (now - oldest);
    return { ok: false, retryInMs };
  }

  // Record this hit
  bucket.push(now);
  BUCKETS.set(key, bucket);

  return { ok: true };
}

