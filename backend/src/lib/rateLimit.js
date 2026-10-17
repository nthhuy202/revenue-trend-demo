// Counts failures per key in a fixed window.
// In-memory and per process; move to Redis if the API ever runs as more than one instance.
export function createLimiter({ max, windowMs }) {
  const failures = new Map(); // key -> { count, resetAt }

  function sweep(now) {
    for (const [key, entry] of failures) if (entry.resetAt <= now) failures.delete(key);
  }

  return {
    // Seconds until the key may try again; 0 when it is not blocked.
    retryAfter(key, now = Date.now()) {
      const entry = failures.get(key);
      if (!entry || entry.resetAt <= now || entry.count < max) return 0;
      return Math.ceil((entry.resetAt - now) / 1000);
    },
    fail(key, now = Date.now()) {
      if (failures.size > 10_000) sweep(now);
      const entry = failures.get(key);
      if (!entry || entry.resetAt <= now) failures.set(key, { count: 1, resetAt: now + windowMs });
      else entry.count += 1;
    },
    reset(key) {
      failures.delete(key);
    },
  };
}
