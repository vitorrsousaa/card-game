import { httpGameClient } from "@/services/http-game-client";
import type { CreateSessionResponseDto } from "@repo/contracts/game/sessions";

export async function createSession(): Promise<CreateSessionResponseDto> {
	const response =
		await httpGameClient.post<CreateSessionResponseDto>("/sessions");

	return response.data;
}
