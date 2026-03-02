import { httpGameClient } from "@/services/http-game-client";
import type { GetSessionResponseDto } from "@repo/contracts/game/sessions";

export async function getSession(
	sessionId: string,
): Promise<GetSessionResponseDto> {
	const response = await httpGameClient.get<GetSessionResponseDto>(
		`/sessions/${sessionId}`,
	);
	return response.data;
}
