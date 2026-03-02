import { GetSessionService } from "@application/modules/sessions/services/get-session";
import { makeSessionsRepository } from "@factories/repositories/sessions-repository";

export function makeGetSessionService(): GetSessionService {
	const sessionsRepository = makeSessionsRepository();
	return new GetSessionService(sessionsRepository);
}
