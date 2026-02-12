import { Hono } from "hono";
import { makeCreateSessionController } from "@factories/controllers/sessions/create-session";
import { requestAdapter } from "@server/adapters/request";
import { responseAdapter } from "@server/adapters/response";

const sessions = new Hono();

sessions.post("/", async (c) => {
	const controller = makeCreateSessionController();
	const request = await requestAdapter(c);
	const response = await controller.handle(request);
	return responseAdapter(c, response);
});

export { sessions };
