import { GetSessionController } from "@application/modules/sessions/controllers/get-session";
import { makeGetSessionService } from "@factories/services/sessions/get-session";

export function makeGetSessionController(): GetSessionController {
	const getSessionService = makeGetSessionService();
	return new GetSessionController(getSessionService);
}
