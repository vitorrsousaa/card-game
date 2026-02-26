import { httpGameClient } from "@/services/http-game-client";
import type {
	CreateSessionInput,
	CreateSessionResponseDto,
} from "@repo/contracts/game/sessions";

export async function createSession(
	input: CreateSessionInput,
): Promise<CreateSessionResponseDto> {
	const response = await httpGameClient.post<CreateSessionResponseDto>(
		"/sessions",
		input,
	);
	return response.data;
}
