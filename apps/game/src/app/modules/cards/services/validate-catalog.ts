import { z } from "zod";

export const CardSchema = z.object({
	id: z.string().min(1, "Card ID is required"),
	name: z.string().min(1, "Card name is required"),
	manaCost: z.number().int().min(0, "Mana cost must be a non-negative integer"),
	attack: z.number().int().min(0, "Attack must be a non-negative integer"),
	health: z.number().int().min(0, "Health must be a non-negative integer"),
	description: z.string().optional(),
});

export const CatalogArraySchema = z
	.array(CardSchema)
	.min(1, "Catalog must contain at least one card");

export type Card = z.infer<typeof CardSchema>;
export type CatalogArray = z.infer<typeof CatalogArraySchema>;

export type Catalog = {
	[cardId: string]: Card;
};

/**
 * Validates an array of cards and converts it to a catalog object indexed by ID.
 * Also validates that there are no duplicate IDs.
 */
export function validateCatalog(cards: unknown): Catalog {
	// Validate array structure
	const validatedCards = CatalogArraySchema.parse(cards);

	// Check for duplicate IDs
	const ids = validatedCards.map((card) => card.id);
	const uniqueIds = new Set(ids);
	if (ids.length !== uniqueIds.size) {
		throw new Error("Catalog contains duplicate card IDs");
	}

	// Convert array to object indexed by ID
	const catalog: Catalog = {};
	for (const card of validatedCards) {
		catalog[card.id] = card;
	}

	return catalog;
}
