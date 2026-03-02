import { useQuery } from "@tanstack/react-query";
import { getSession } from "../services/get-session";

export function useGetSession(sessionId: string | undefined) {
	const {
		data: session,
		isLoading: isLoadingSession,
		isError: isErrorGetSession,
		error: errorGetSession,
		refetch,
	} = useQuery({
		queryKey: ["session", sessionId],
		queryFn: () => getSession(sessionId as string),
		enabled: !!sessionId,
	});

	return {
		session,
		isLoadingSession,
		isErrorGetSession,
		errorGetSession,
		refetch,
	};
}
