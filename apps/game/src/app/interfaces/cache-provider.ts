/**
 * Generic cache provider interface.
 * Allows swapping cache implementations (Redis, Memcached, in-memory, etc.)
 * without changing application code.
 */
export interface ICacheProvider {
	/**
	 * Get a value from cache by key.
	 * @param key Cache key
	 * @returns The cached value, or null if not found/expired
	 */
	get<T>(key: string): Promise<T | null>;

	/**
	 * Set a value in cache with optional TTL.
	 * @param key Cache key
	 * @param value Value to cache (will be JSON serialized)
	 * @param ttlSeconds Optional time-to-live in seconds
	 */
	set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

	/**
	 * Delete a key from cache.
	 * @param key Cache key to delete
	 * @returns true if key was deleted, false if it didn't exist
	 */
	delete(key: string): Promise<boolean>;

	/**
	 * Check if a key exists in cache.
	 * @param key Cache key to check
	 * @returns true if key exists and is not expired
	 */
	exists(key: string): Promise<boolean>;

	/**
	 * Clear cache entries matching a pattern.
	 * @param pattern Optional pattern (e.g., "session:*"). If not provided, clears all.
	 */
	clear(pattern?: string): Promise<void>;
}
