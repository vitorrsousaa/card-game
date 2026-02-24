import Redis from "ioredis";
import { createLogger } from "@application/utils/logger";
import type { ICacheProvider } from "@application/interfaces/cache-provider";

const logger = createLogger("redis-cache-provider");

/**
 * Redis implementation of the cache provider.
 * Uses ioredis for Redis connectivity.
 */
export class RedisCacheProvider implements ICacheProvider {
	private client: Redis;

	constructor(redisUrl: string) {
		this.client = new Redis(redisUrl);
		logger.info("RedisCacheProvider initialized", { redisUrl });
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			const value = await this.client.get(key);
			if (!value) {
				return null;
			}
			return JSON.parse(value) as T;
		} catch (error) {
			logger.error("RedisCacheProvider.get - error", { key, error });
			throw error;
		}
	}

	async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
		try {
			const serialized = JSON.stringify(value);
			if (ttlSeconds) {
				await this.client.setex(key, ttlSeconds, serialized);
			} else {
				await this.client.set(key, serialized);
			}
		} catch (error) {
			logger.error("RedisCacheProvider.set - error", {
				key,
				ttlSeconds,
				error,
			});
			throw error;
		}
	}

	async delete(key: string): Promise<boolean> {
		try {
			const result = await this.client.del(key);
			return result > 0;
		} catch (error) {
			logger.error("RedisCacheProvider.delete - error", { key, error });
			throw error;
		}
	}

	async exists(key: string): Promise<boolean> {
		try {
			const result = await this.client.exists(key);
			return result === 1;
		} catch (error) {
			logger.error("RedisCacheProvider.exists - error", { key, error });
			throw error;
		}
	}

	async clear(pattern?: string): Promise<void> {
		try {
			if (pattern) {
				const keys = await this.client.keys(pattern);
				if (keys.length > 0) {
					await this.client.del(...keys);
				}
			} else {
				await this.client.flushdb();
			}
		} catch (error) {
			logger.error("RedisCacheProvider.clear - error", { pattern, error });
			throw error;
		}
	}
}
