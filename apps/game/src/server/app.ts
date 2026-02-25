import { createLogger } from "@application/utils/logger";
import { authMockMiddleware } from "@server/middlewares/auth-mock";
import { health } from "@server/routes/health-routes";
import { sessions } from "@server/routes/sessions-routes";
import { Hono } from "hono";
import { cors } from "hono/cors";

const logger = createLogger("game-server");
const app = new Hono();

app.use(
	"/*",
	cors({
		origin: (origin) => {
			if (process.env.NODE_ENV === "development") {
				return origin || "*";
			}
			return origin || "*";
		},
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		exposeHeaders: ["Content-Length"],
		maxAge: 86400,
		credentials: true,
	}),
);

app.use("*", async (c, next) => {
	const start = Date.now();
	const method = c.req.method;
	const path = c.req.path;

	logger.info("Request received", { method, path });

	await next();

	const duration = Date.now() - start;
	const status = c.res.status || 200;

	logger.info("Request completed", {
		method,
		path,
		status,
		duration: `${duration}ms`,
	});
});

app.use("*", authMockMiddleware);

const routeEntries = [
	{ path: "/health", router: health },
	{ path: "/sessions", router: sessions },
] as const;

logger.info("[Routes] Loading route files", {
	routes: routeEntries.map((route) => route.path),
});

for (const route of routeEntries) {
	try {
		app.route(route.path, route.router);
		logger.info("[Routes] ✓ Loaded", { path: route.path });
	} catch (error) {
		logger.error("[Routes] ✗ Error loading", {
			path: route.path,
			error,
		});
	}
}

export { app };
