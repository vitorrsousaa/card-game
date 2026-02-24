import type { ICacheProvider } from "@application/interfaces/cache-provider";

interface CacheEntry {
	value: unknown;
	expiresAt?: number;
}

/**
 * In-memory implementation of the cache provider.
 * Useful for development and testing without Redis.
 */
export class InMemoryCacheProvider implements ICacheProvider {
	private store = new Map<string, CacheEntry>();

	async get<T>(key: string): Promise<T | null> {
		const entry = this.store.get(key);
		if (!entry) {
			return null;
		}

		// Check if expired
		if (entry.expiresAt && Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return null;
		}

		return entry.value as T;
	}

	async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
		const entry: CacheEntry = {
			value,
			expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
		};

		this.store.set(key, entry);
	}

	async delete(key: string): Promise<boolean> {
		return this.store.delete(key);
	}

	async exists(key: string): Promise<boolean> {
		const entry = this.store.get(key);
		if (!entry) {
			return false;
		}

		// Check if expired
		if (entry.expiresAt && Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return false;
		}

		return true;
	}

	async clear(pattern?: string): Promise<void> {
		if (pattern) {
			// Simple pattern matching (supports * wildcard)
			const regex = new RegExp(
				pattern.replace(/\*/g, ".*").replace(/\?/g, "."),
			);
			const keysToDelete: string[] = [];

			for (const key of this.store.keys()) {
				if (regex.test(key)) {
					keysToDelete.push(key);
				}
			}

			for (const key of keysToDelete) {
				this.store.delete(key);
			}
		} else {
			this.store.clear();
		}
	}
}
