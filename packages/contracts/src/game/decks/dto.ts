/**
 * Deck DTO.
 * Represents a player's deck configuration.
 */
export interface DeckDto {
	/** Unique deck identifier */
	id: string;
	/** Deck name */
	name: string;
	/** User ID who owns this deck */
	userId: string;
	/** List of card IDs in this deck (can have duplicates) */
	cardIds: string[];
	/** When the deck was created */
	createdAt: string; // ISO string
	/** Last update timestamp */
	updatedAt: string; // ISO string
	/** Optional: whether this is the default/active deck */
	isDefault?: boolean;
}
