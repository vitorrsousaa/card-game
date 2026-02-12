import { health } from "@server/routes/health-routes";
import { sessions } from "@server/routes/sessions-routes";
import { Hono } from "hono";

const app = new Hono();

app.route("/health", health);
app.route("/sessions", sessions);

export { app };
