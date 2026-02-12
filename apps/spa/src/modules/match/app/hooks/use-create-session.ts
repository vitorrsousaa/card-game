import { useMutation } from "@tanstack/react-query";
import { createSession } from "../services/create-session";

export function useCreateSession() {
	const { mutate } = useMutation({
		mutationFn: createSession,
	});

	return {
		createSession: mutate,
	};
}
