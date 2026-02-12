import "dotenv/config";
import { createServer } from "node:http";
import { getRequestListener } from "@hono/node-server";
import { app } from "@server/app";
import { env } from "@application/config/environment";

const requestListener = getRequestListener(app.fetch);

/**
 * Node HTTP server. Kept as a variable so we can attach WebSocket later:
 *   server.on("upgrade", (request, socket, head) => { ... });
 */
export const server = createServer(requestListener);

server.listen(env.port, () => {
	// eslint-disable-next-line no-console
	console.log(`Game API listening on http://localhost:${env.port}`);
});
