import { missingFields } from "@application/errors/missing-fields";
import type { IController } from "@application/interfaces/controller";
import type { IRequest, IResponse } from "@application/interfaces/http";
import type { ICreateSessionService } from "@application/modules/sessions/services/create-session";
import { errorHandler } from "@application/utils/error-handler";
import { createSessionSchema } from "./schema";

export class CreateSessionController implements IController {
	constructor(private readonly createSessionService: ICreateSessionService) {}

	async handle(request: IRequest): Promise<IResponse> {
		try {
			const [status, parsedBody] = missingFields(createSessionSchema, {
				...request.body,
				userId: request.userId || "",
			});

			if (!status) return parsedBody;

			const result = await this.createSessionService.execute(parsedBody);

			return {
				statusCode: 200,
				body: result.sessions,
			};
		} catch (error) {
			return errorHandler(error);
		}
	}
}
