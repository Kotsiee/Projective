// packages/server-utils/rateLimiter.ts

type BucketInfo = {
	count: number;
	resetAt: number; // ms timestamp
};

// naive in-memory store (resets on server restart)
const buckets = new Map<string, BucketInfo>();

export function rateLimitByIP(ip: string, limit = 20, windowMs = 60_000) {
	const now = Date.now();
	const bucket = buckets.get(ip);

	if (!bucket || now > bucket.resetAt) {
		// start/reset bucket
		buckets.set(ip, {
			count: 1,
			resetAt: now + windowMs,
		});
		return { allowed: true, remaining: limit - 1 };
	}

	if (bucket.count >= limit) {
		return { allowed: false, remaining: 0 };
	}

	bucket.count += 1;
	return { allowed: true, remaining: limit - bucket.count };
}
