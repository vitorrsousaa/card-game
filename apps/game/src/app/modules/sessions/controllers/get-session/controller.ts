import { missingFields } from "@application/errors/missing-fields";
import type { IController } from "@application/interfaces/controller";
import type { IRequest, IResponse } from "@application/interfaces/http";
import type { IGetSessionService } from "@application/modules/sessions/services/get-session";
import { errorHandler } from "@application/utils/error-handler";
import { getSessionParamsSchema } from "./schema";

export class GetSessionController implements IController {
	constructor(private readonly getSessionService: IGetSessionService) {}

	async handle(request: IRequest): Promise<IResponse> {
		try {
			const [status, parsedBody] = missingFields(
				getSessionParamsSchema,
				request.params,
			);

			if (!status) return parsedBody;

			const result = await this.getSessionService.execute(parsedBody);

			return {
				statusCode: 200,
				body: result.session,
			};
		} catch (error) {
			return errorHandler(error);
		}
	}
}
