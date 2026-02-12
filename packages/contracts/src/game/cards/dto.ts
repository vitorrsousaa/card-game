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
