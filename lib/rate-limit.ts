interface RateLimitRecord {
  count: number
  resetTime: number
}

const tracker = new Map<string, RateLimitRecord>()

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, rec] of tracker.entries()) {
    if (rec.resetTime < now) tracker.delete(key)
  }
}, 60000)

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = tracker.get(identifier)

  if (!record || record.resetTime < now) {
    tracker.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count += 1
  return { allowed: true, remaining: maxRequests - record.count }
}
