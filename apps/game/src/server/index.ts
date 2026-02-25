import { env } from "@application/config/environment";
import { createLogger } from "@application/utils/logger";
import { getRequestListener } from "@hono/node-server";
import { app } from "@server/app";
import "dotenv/config";
import { createServer } from "node:http";

const logger = createLogger("game-server");

const requestListener = getRequestListener(app.fetch);

/**
 * Node HTTP server. Kept as a variable so we can attach WebSocket later:
 *   server.on("upgrade", (request, socket, head) => { ... });
 */
export const server = createServer(requestListener);

server.on("error", (error) => {
	logger.error("Server error", { error });
	process.exit(1);
});

server.listen(env.port, () => {
	logger.info("Game API listening", {
		port: env.port,
		url: `http://localhost:${env.port}`,
	});
});
