import { health } from "@server/routes/health-routes";
import { sessions } from "@server/routes/sessions-routes";
import { Hono } from "hono";
import { cors } from "hono/cors";

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

app.route("/health", health);
app.route("/sessions", sessions);

export { app };
