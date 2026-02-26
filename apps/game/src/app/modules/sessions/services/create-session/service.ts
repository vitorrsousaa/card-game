import type { IEngineBridge } from "@application/interfaces/engine-bridge";
import type { IService } from "@application/interfaces/service";
import type { ISessionsRepository } from "@application/interfaces/sessions-repository";
import { createLogger } from "@application/utils/logger";
import type {
	CreateSessionInput,
	CreateSessionOutput,
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
				// For now we still return an array; later throw AppError
				return { sessions: [] };
			}

			// Create session DTO
			const sessionId =
				(result.state.sessionId as string) ?? crypto.randomUUID();
			const now = new Date();

			const sessionDto = {
				id: sessionId,
				state: result.state,
				events: result.events,
				userId: input.userId,
			};

			// Save session to cache
			await this.sessionsRepository.save(sessionDto);

			// Return session with Date objects for the output DTO
			const session = {
				id: sessionId,
				userId: input.userId,
				createdAt: now,
				updatedAt: now,
			};

			logger.info("CreateSessionService - session created and saved", {
				sessionId: session.id,
				eventsCount: result.events.length,
			});

			return { sessions: [session] };
		} catch (error) {
			logger.error("CreateSessionService - unhandled error", { error });
			throw error;
		}
	}
}
