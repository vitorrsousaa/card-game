export const SECTIONS = {
	BY_PROJECT: (projectId: string) => ["sections", "by-project", projectId],
};

export const SESSIONS = {
	ALL: ["sessions", "all"],
	DETAIL: (sessionId: string) => ["sessions", "detail", sessionId],
	CREATE: ["sessions", "create"],
};

export const QUERY_KEYS = { SECTIONS, SESSIONS } as const;
