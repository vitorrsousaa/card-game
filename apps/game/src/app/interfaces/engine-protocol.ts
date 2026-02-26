/**
 * JSON protocol for communication with the Lua engine (state machine).
 * Engine runs as a separate process; input is sent via stdin, output read from stdout.
 * One JSON message per line (NDJSON) for streaming, or single JSON for request/response.
 */

import type { GameEventDto, GameStateDto } from "@repo/contracts/game/sessions";

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
export type GameState = GameStateDto & Record<string, unknown>;

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
export type GameEvent = GameEventDto;

export type EngineResult = EngineOutput | EngineErrorOutput;
