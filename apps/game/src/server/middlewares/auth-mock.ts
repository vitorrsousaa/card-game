import { MOCK_USER_ID } from "@application/config/mock-user";
import type { Context, Next } from "hono";

/**
 * Mock auth middleware: sets a fixed userId on the context.
 * Same pipeline as a real auth middleware would use (e.g. JWT verify → c.set("userId", payload.sub)).
 * Replace with real authentication when ready.
 */
export async function authMockMiddleware(c: Context, next: Next) {
	c.set("userId", MOCK_USER_ID);
	await next();
}
