import type { IService } from "@application/interfaces/service";
import type {
	BatchCardsInput,
	BatchCardsOutput,
} from "@repo/contracts/game/cards";
import { getCatalog } from "../get-catalog";

export interface IBatchCardsService
	extends IService<BatchCardsInput, BatchCardsOutput> {}

export class BatchCardsService implements IBatchCardsService {
	async execute(input: BatchCardsInput): Promise<BatchCardsOutput> {
		const catalog = await getCatalog();
		const seen = new Set<string>();
		const cards = [];

		for (const id of input.ids) {
			if (seen.has(id)) continue;
			seen.add(id);

			const card = catalog[id];
			if (card) {
				cards.push({
					id: card.id,
					name: card.name,
					manaCost: card.manaCost,
					attack: card.attack,
					health: card.health,
					description: card.description,
				});
			}
		}

		return { cards };
	}
}
