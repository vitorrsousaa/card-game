import type { IEngineBridge } from "@application/interfaces/engine-bridge";
import type { IService } from "@application/interfaces/service";
import type { ISessionsRepository } from "@application/interfaces/sessions-repository";
import { SessionCreationFailed } from "@application/modules/sessions/errors/session-creation-failed";
import { createLogger } from "@application/utils/logger";
import type {
	CreateSessionInput,
	CreateSessionOutput,
	SessionDto,
} from "@repo/contracts/game/sessions";
import { getCatalog } from "./get-catalog";
import { getMockDeck } from "./get-mock-deck";
import { getMockEnemyDeck } from "./get-mock-enemy-deck";

const logger = createLogger("create-session-service");

export interface ICreateSessionService
	extends IService<CreateSessionInput, CreateSessionOutput> {}

export class CreateSessionService implements ICreateSessionService {
	constructor(
		private readonly engineBridge: IEngineBridge,
		private readonly sessionsRepository: ISessionsRepository,
	) {}

	async execute(input: CreateSessionInput): Promise<CreateSessionOutput> {
		try {
			// Read and validate catalog
			const catalog = await getCatalog();

			// Generate mock decks for player and enemy
			const deckIds = getMockDeck();
			const enemyDeckIds = getMockEnemyDeck();

			const engineInput = {
				type: "init" as const,
				payload: {
					options: {
						userId: input.userId,
						catalog,
						deckIds,
						enemyDeckIds,
					},
				},
			};

			logger.debug("CreateSessionService - calling engine bridge", {
				engineInput,
			});
			const result = await this.engineBridge.run(engineInput);
			logger.debug("CreateSessionService - engine bridge response", {
				ok: result.ok,
				sessionId: result.ok ? result.state.sessionId : undefined,
			});

			if (!result.ok) {
				logger.warn("CreateSessionService - engine returned error", {
					error: result.error,
					code: result.code,
				});
				logger.error("CreateSessionService - engine returned error", {
					error: result.error,
					code: result.code,
				});
				throw new SessionCreationFailed();
			}

			// Create full session DTO (same format as Get Session)
			const sessionId =
				(result.state.sessionId as string) ?? crypto.randomUUID();
			const now = new Date();
			const nowIso = now.toISOString();

			const sessionDto: SessionDto = {
				id: sessionId,
				state: result.state,
				userId: input.userId,
				createdAt: nowIso,
				updatedAt: nowIso,
			};

			// Save full session to cache
			await this.sessionsRepository.save(sessionDto);

			return { session: sessionDto };
		} catch (error) {
			logger.error("CreateSessionService - unhandled error", { error });
			throw error;
		}
	}
}
