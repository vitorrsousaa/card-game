/**
 * JSON protocol for communication with the Lua engine (state machine).
 * Engine runs as a separate process; input is sent via stdin, output read from stdout.
 * One JSON message per line (NDJSON) for streaming, or single JSON for request/response.
 */

/** Commands sent to the engine process */
export type EngineInput =
	| { type: "init"; payload?: InitPayload }
	| { type: "step"; state: GameState; action: GameAction };

export interface InitPayload {
	/** Optional seed for deterministic PvE */
	seed?: number;
	/** Player deck / game mode config when needed */
	options?: Record<string, unknown>;
}

/** Full game state (engine is the source of truth) */
export interface GameState {
	/** Session/match identifier */
	sessionId?: string;
	/** Current turn, phase, etc. */
	turn?: number;
	phase?: string;
	/** Players state (life, resources, hand, board, etc.) */
	players?: unknown[];
	/** Any extra state the engine needs */
	[key: string]: unknown;
}

/** Actions the client can send (play card, attack, end turn, etc.) */
export interface GameAction {
	type: string;
	[key: string]: unknown;
}

/** Response from the engine process */
export interface EngineOutput {
	ok: true;
	state: GameState;
	events: GameEvent[];
}

export interface EngineErrorOutput {
	ok: false;
	error: string;
	code?: string;
}

/** Events for animations / UI feedback */
export interface GameEvent {
	type: string;
	payload?: Record<string, unknown>;
}

export type EngineResult = EngineOutput | EngineErrorOutput;
