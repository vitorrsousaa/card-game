import { createLogger } from "@application/utils/logger";
import type { ISessionsRepository } from "@application/interfaces/sessions-repository";
import type { ICacheProvider } from "@application/interfaces/cache-provider";
import type { SessionDto } from "@repo/contracts/game/sessions";

const logger = createLogger("redis-sessions-repository");

/**
 * Redis implementation of the sessions repository.
 * Uses ICacheProvider internally, so it's not tightly coupled to Redis.
 */
export class RedisSessionsRepository implements ISessionsRepository {
	private readonly SESSION_TTL_SECONDS = 86400; // 24 hours

	constructor(private readonly cacheProvider: ICacheProvider) {}

	private getKey(sessionId: string): string {
		return `session:${sessionId}`;
	}

	async save(session: SessionDto): Promise<void> {
		const key = this.getKey(session.id);
		logger.debug("RedisSessionsRepository.save", { sessionId: session.id });
		await this.cacheProvider.set(key, session, this.SESSION_TTL_SECONDS);
	}

	async findById(sessionId: string): Promise<SessionDto | null> {
		const key = this.getKey(sessionId);
		logger.debug("RedisSessionsRepository.findById", { sessionId });
		return this.cacheProvider.get<SessionDto>(key);
	}

	async delete(sessionId: string): Promise<boolean> {
		const key = this.getKey(sessionId);
		logger.debug("RedisSessionsRepository.delete", { sessionId });
		return this.cacheProvider.delete(key);
	}

	async exists(sessionId: string): Promise<boolean> {
		const key = this.getKey(sessionId);
		logger.debug("RedisSessionsRepository.exists", { sessionId });
		return this.cacheProvider.exists(key);
	}
}
