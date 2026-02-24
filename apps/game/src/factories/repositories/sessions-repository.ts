import type { ISessionsRepository } from "@application/interfaces/sessions-repository";
import { RedisSessionsRepository } from "@infra/repositories/sessions/redis-sessions-repository";
import { makeCacheProvider } from "@factories/providers/cache-provider";

/**
 * Factory that creates the sessions repository with the appropriate cache provider.
 */
export function makeSessionsRepository(): ISessionsRepository {
	const cacheProvider = makeCacheProvider();

	return new RedisSessionsRepository(cacheProvider);
}
