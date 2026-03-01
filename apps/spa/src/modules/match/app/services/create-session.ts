import { httpGameClient } from "@/services/http-game-client";
import type {
	CreateSessionRequest,
	CreateSessionResponseDto,
} from "@repo/contracts/game/sessions";

export async function createSession(
	input: CreateSessionRequest,
): Promise<CreateSessionResponseDto> {
	const response = await httpGameClient.post<CreateSessionResponseDto>(
		"/sessions",
		input,
	);
	return response.data;
}
