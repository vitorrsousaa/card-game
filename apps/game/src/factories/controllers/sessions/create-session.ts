import { CreateSessionController } from "@application/modules/sessions/controllers/create-session";
import { makeCreateSessionService } from "@factories/services/sessions/create-session";

export function makeCreateSessionController(): CreateSessionController {
	const createSessionService = makeCreateSessionService();
	return new CreateSessionController(createSessionService);
}
