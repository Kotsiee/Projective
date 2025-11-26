type BucketInfo = {
	count: number;
	resetAt: number;
};

// Note: In a serverless environment (Deno Deploy), this Map is not shared across regions/isolates.
// For strict global rate limiting, you must use Deno KV.
// For now, this is "per-isolate" limiting.
const buckets = new Map<string, BucketInfo>();

export function rateLimitByIP(ip: string, limit = 20, windowMs = 60_000) {
	const now = Date.now();
	const bucket = buckets.get(ip);

	if (!bucket || now > bucket.resetAt) {
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
