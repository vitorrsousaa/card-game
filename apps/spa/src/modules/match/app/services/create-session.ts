import { httpGameClient } from "@/services/http-game-client";

export interface GetProjectDetailInput {
	projectId: string;
}

export interface CreateSessionInput {
	userId?: string | null;
}

export interface CreateSessionOutput {
	sessions: Array<{
		id: string;
		state: unknown;
		events: unknown[];
	}>;
}

export async function createSession(
	input: CreateSessionInput,
): Promise<CreateSessionOutput> {
	const response = await httpGameClient.post<CreateSessionOutput>(
		"/sessions",
		input,
	);
	return response.data;
}
