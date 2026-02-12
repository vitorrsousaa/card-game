import type { IEngineBridge } from "@application/interfaces/engine-bridge";
import type {
	EngineInput,
	EngineOutput,
} from "@application/interfaces/engine-protocol";

/**
 * Stub implementation for development before @repo/engine is available.
 * Returns a minimal valid state so POST /sessions works without the Lua process.
 */
export class StubEngineBridge implements IEngineBridge {
	async run(input: EngineInput): Promise<EngineOutput> {
		if (input.type === "init") {
			return {
				ok: true,
				state: {
					sessionId: crypto.randomUUID(),
					turn: 1,
					phase: "play",
					players: [],
				},
				events: [{ type: "game_initialized", payload: {} }],
			};
		}

		return {
			ok: true,
			state: input.state ?? {},
			events: [{ type: "step_processed", payload: { action: input } }],
		};
	}
}
