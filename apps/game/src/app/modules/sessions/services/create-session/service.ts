import type { IService } from "@application/interfaces/service";
import type { IEngineBridge } from "@application/interfaces/engine-bridge";
import type { CreateSessionInput, CreateSessionOutput } from "./dto";

export interface ICreateSessionService
	extends IService<CreateSessionInput, CreateSessionOutput> {}

export class CreateSessionService implements ICreateSessionService {
	constructor(private readonly engineBridge: IEngineBridge) {}

	async execute(input: CreateSessionInput): Promise<CreateSessionOutput> {
		const result = await this.engineBridge.run({
			type: "init",
			payload: { options: { userId: input.userId } },
		});

		if (!result.ok) {
			// For now we still return an array; later throw AppError
			return { sessions: [] };
		}

		// For now return an array with the session state placeholder
		const sessions = [
			{
				id: (result.state.sessionId as string) ?? crypto.randomUUID(),
				state: result.state,
				events: result.events,
			},
		];

		return { sessions };
	}
}
