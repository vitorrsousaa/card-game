import { useMutation } from "@tanstack/react-query";
import { createSession } from "../services/create-session";

export function useCreateSession() {
	const { mutate, mutateAsync, isPending, isError, data } = useMutation({
		mutationFn: createSession,
	});

	return {
		createSession: mutate,
		createSessionAsync: mutateAsync,
		isPendingCreateSession: isPending,
		isErrorCreateSession: isError,
		session: data,
	};
}
