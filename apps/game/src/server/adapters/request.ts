import type { Context } from "hono";
import type { IRequest } from "@application/interfaces/http";

export async function requestAdapter(c: Context): Promise<IRequest> {
	const headers: Record<string, string | undefined> = {};
	c.req.raw.headers.forEach((value, key) => {
		headers[key] = value;
	});

	const params = (c.req.param() ?? {}) as Record<string, string | undefined>;

	const url = new URL(c.req.raw.url);
	const query: Record<string, string | undefined> = {};
	url.searchParams.forEach((value, key) => {
		query[key] = value;
	});

	const body = (await c.req.json().catch(() => ({}))) as Record<
		string,
		unknown
	>;

	return {
		body: body ?? {},
		params,
		headers,
		query,
		userId: c.get("userId") ?? null,
	};
}
