/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Sufficient for protecting auth endpoints on a single instance. For
 * horizontally-scaled deployments this should be swapped for a shared store
 * (Redis, Upstash, etc.) — the interface below is intentionally provider-agnostic.
 *
 * @param {string} key     - Unique bucket key (e.g. `ip:<addr>` or `email:<addr>`)
 * @param {number} limit   - Max requests allowed per window
 * @param {number} windowMs- Window length in milliseconds
 * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
 */

const buckets = new Map();
const MAX_BUCKETS = 10000;

function sweepExpired(now) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) sweepExpired(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/**
 * Drop all rate-limit state. Intended for tests and for clearing a
 * stuck dev server without a restart.
 */
function clearRateLimits() {
  buckets.clear();
}

/**
 * Best-effort client IP extraction for rate-limit keys. Respects the
 * X-Forwarded-For chain when present (set by reverse proxies/CDNs).
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
