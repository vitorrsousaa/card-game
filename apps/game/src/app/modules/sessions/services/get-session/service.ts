import type { IService } from "@application/interfaces/service";
import type { ISessionsRepository } from "@application/interfaces/sessions-repository";
import { SessionNotFound } from "@application/modules/sessions/errors/session-not-found";
import type {
	GetSessionInput,
	GetSessionOutput,
} from "@repo/contracts/game/sessions";

export interface IGetSessionService
	extends IService<GetSessionInput, GetSessionOutput> {}

export class GetSessionService implements IGetSessionService {
	constructor(private readonly sessionsRepository: ISessionsRepository) {}

	async execute(input: GetSessionInput): Promise<GetSessionOutput> {
		const session = await this.sessionsRepository.findById(input.sessionId);

		if (!session) {
			throw new SessionNotFound();
		}

		return { session };
	}
}
