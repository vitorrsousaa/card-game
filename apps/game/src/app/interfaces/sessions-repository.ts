import type { SessionDto } from "@repo/contracts/game/sessions";

/**
 * Repository interface for session persistence.
 * Abstracts cache implementation details from application layer.
 */
export interface ISessionsRepository {
	/**
	 * Save a session to cache.
	 * @param session Session DTO to save
	 */
	save(session: SessionDto): Promise<void>;

	/**
	 * Find a session by ID.
	 * @param sessionId Session ID to lookup
	 * @returns Session DTO or null if not found
	 */
	findById(sessionId: string): Promise<SessionDto | null>;

	/**
	 * Delete a session from cache.
	 * @param sessionId Session ID to delete
	 * @returns true if session was deleted, false if it didn't exist
	 */
	delete(sessionId: string): Promise<boolean>;

	/**
	 * Check if a session exists.
	 * @param sessionId Session ID to check
	 * @returns true if session exists
	 */
	exists(sessionId: string): Promise<boolean>;
}
