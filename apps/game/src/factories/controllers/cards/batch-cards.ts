import { BatchCardsController } from "@application/modules/cards/controllers/batch-cards";
import { makeBatchCardsService } from "@factories/services/cards/batch-cards";

export function makeBatchCardsController(): BatchCardsController {
	const batchCardsService = makeBatchCardsService();
	return new BatchCardsController(batchCardsService);
}
