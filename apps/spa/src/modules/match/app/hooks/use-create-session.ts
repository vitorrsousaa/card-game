import { MUTATION_KEYS } from "@/config/mutation-keys";
import { QUERY_KEYS } from "@/config/query-keys";
import type { SessionDto } from "@repo/contracts/game/sessions";
import {
	useMutation,
	useMutationState,
	useQueryClient,
} from "@tanstack/react-query";
import { createSession } from "../services/create-session";

export interface UseCreateSessionProps {
	onError?: (error: Error) => void;
	onSuccess?: (data: SessionDto) => void;
}

export function useCreateSession(props?: UseCreateSessionProps) {
	const { onError, onSuccess } = props ?? {};
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationKey: MUTATION_KEYS.SESSIONS.CREATE,
		mutationFn: createSession,
		onSuccess: (data) => {
			onSuccess?.(data);
			queryClient.setQueryData(QUERY_KEYS.SESSIONS.DETAIL(data.id), data);
		},
		onError: (error) => {
			onError?.(error);
		},
	});

	const mutationStates = useMutationState({
		filters: { mutationKey: QUERY_KEYS.SESSIONS.CREATE },
		select: (m) => m.state,
	});
	const latestState = mutationStates[mutationStates.length - 1];
	const isErrorFromCache = latestState?.status === "error";

	return {
		createSession: mutation.mutate,
		createSessionAsync: mutation.mutateAsync,
		isPendingCreateSession: mutation.isPending,
		isErrorCreateSession: mutation.isError || isErrorFromCache,
		session: mutation.data,
	};
}
