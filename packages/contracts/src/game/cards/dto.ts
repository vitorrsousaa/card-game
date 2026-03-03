import { z } from "zod";

/**
 * Card DTO (catalog entry).
 * Represents a card definition in the game catalog.
 */
export interface CardDto {
	/** Unique card identifier */
	id: string;
	/** Card name (display) */
	name: string;
	/** Mana cost to play this card */
	manaCost: number;
	/** Attack value (for creatures/attacks) */
	attack: number;
	/** Health value (for creatures/defense) */
	health: number;
	/** Card type (Attack / Spell / Defense) */
	type: "Attack" | "Spell" | "Defense";
	/** Description/flavor text */
	description: string;
	/** Optional: image URL for UI */
	imageUrl?: string;
}

/** Schema for batch cards input (ids array) */
export const BatchCardsInputSchema = z.object({
	ids: z.array(z.string().min(1)).min(1, "At least one card ID is required"),
});
export type BatchCardsInput = z.infer<typeof BatchCardsInputSchema>;

/** Schema for catalog card format (matches data/cards.json - no type field) */
export const BatchCardDtoSchema = z.object({
	id: z.string(),
	name: z.string(),
	manaCost: z.number(),
	attack: z.number(),
	health: z.number(),
	description: z.string().optional(),
});
export type BatchCardDto = z.infer<typeof BatchCardDtoSchema>;

/** Schema for batch cards output */
export const BatchCardsOutputSchema = z.object({
	cards: z.array(BatchCardDtoSchema),
});
export type BatchCardsOutput = z.infer<typeof BatchCardsOutputSchema>;
