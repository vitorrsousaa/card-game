import { missingFields } from "@application/errors/missing-fields";
import type { IController } from "@application/interfaces/controller";
import type { IRequest, IResponse } from "@application/interfaces/http";
import type { IBatchCardsService } from "@application/modules/cards/services/batch-cards";
import { errorHandler } from "@application/utils/error-handler";
import { batchCardsSchema } from "./schema";

export class BatchCardsController implements IController {
	constructor(private readonly batchCardsService: IBatchCardsService) {}

	async handle(request: IRequest): Promise<IResponse> {
		try {
			const [status, parsedBody] = missingFields(
				batchCardsSchema,
				request.body,
			);

			if (!status) return parsedBody;

			const result = await this.batchCardsService.execute(parsedBody);

			return {
				statusCode: 200,
				body: { cards: result.cards },
			};
		} catch (error) {
			return errorHandler(error);
		}
	}
}
