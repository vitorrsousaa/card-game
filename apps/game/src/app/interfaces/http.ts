export interface IRequest {
	body: Record<string, unknown>;
	params: Record<string, string | undefined>;
	headers: Record<string, string | undefined>;
	query: Record<string, string | undefined>;
	userId: string | null;
}

export interface IResponse {
	statusCode: number;
	// biome-ignore lint/suspicious/noExplicitAny: response body can be any JSON-serializable value
	body: Record<string, any> | unknown[] | null;
}
