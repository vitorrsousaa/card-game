import type { IController } from "@application/interfaces/controller";
import type { IRequest, IResponse } from "@application/interfaces/http";
import { errorHandler } from "@application/utils/error-handler";
import type { ICreateSessionService } from "@application/modules/sessions/services/create-session";

export class CreateSessionController implements IController {
	constructor(private readonly createSessionService: ICreateSessionService) {}

	async handle(request: IRequest): Promise<IResponse> {
		try {
			const result = await this.createSessionService.execute({
				userId: request.userId,
			});

			return {
				statusCode: 200,
				body: result.sessions,
			};
		} catch (error) {
			return errorHandler(error);
		}
	}
}
