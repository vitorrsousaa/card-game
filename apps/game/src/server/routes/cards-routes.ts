import { Hono } from "hono";
import { makeBatchCardsController } from "@factories/controllers/cards/batch-cards";
import { requestAdapter } from "@server/adapters/request";
import { responseAdapter } from "@server/adapters/response";

const cards = new Hono();

cards.post("/batch", async (c) => {
	const controller = makeBatchCardsController();
	const request = await requestAdapter(c);
	const response = await controller.handle(request);
	return responseAdapter(c, response);
});

export { cards };
