import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { getSession } from "../services/get-session";

export function useGetSession(sessionId: string | undefined) {
	const {
		data: session,
		isLoading: isLoadingSession,
		isError: isErrorGetSession,
		error: errorGetSession,
		refetch,
	} = useQuery({
		queryKey: QUERY_KEYS.SESSIONS.DETAIL(sessionId ?? ""),
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
