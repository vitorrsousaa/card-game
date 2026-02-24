import type { ICacheProvider } from "@application/interfaces/cache-provider";
import { RedisCacheProvider } from "@infra/cache/redis-cache-provider";
import { InMemoryCacheProvider } from "@infra/cache/in-memory-cache-provider";

/**
 * Factory that creates the appropriate cache provider based on environment.
 * Falls back to in-memory cache if Redis is not configured.
 */
export function makeCacheProvider(): ICacheProvider {
	const redisUrl = process.env.REDIS_URL;

	if (redisUrl) {
		return new RedisCacheProvider(redisUrl);
	}

	// Fallback to in-memory if Redis is not configured
	return new InMemoryCacheProvider();
}
