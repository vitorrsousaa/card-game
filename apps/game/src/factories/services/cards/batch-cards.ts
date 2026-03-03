import { BatchCardsService } from "@application/modules/cards/services/batch-cards";

export function makeBatchCardsService(): BatchCardsService {
	return new BatchCardsService();
}
