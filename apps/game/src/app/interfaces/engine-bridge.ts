import type {
	EngineErrorOutput,
	EngineInput,
	EngineOutput,
} from "./engine-protocol";

export type EngineBridgeResult = EngineOutput | EngineErrorOutput;

/**
 * Bridge to the Lua engine running in a separate process.
 * Communication is done via JSON over stdin/stdout (or NDJSON for streaming).
 * Implemented in infra/engine/process-engine-bridge.ts using child_process.
 */
export interface IEngineBridge {
	/**
	 * Send a command to the engine and get the result.
	 * Process is spawned per call (or reused via pool) depending on implementation.
	 */
	run(input: EngineInput): Promise<EngineBridgeResult>;
}
