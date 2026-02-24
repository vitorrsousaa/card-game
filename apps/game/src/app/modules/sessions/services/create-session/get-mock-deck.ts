/**
 * Generates a mock deck for testing purposes.
 * Returns an array of card IDs that will be used to build the player's deck.
 *
 * Current implementation: 2 cards, 3 copies of each = 6 cards total.
 * In the future, this will fetch the deck from the database based on userId.
 */
export function getMockDeck(): string[] {
	// Mock deck: 2 cards, 3 copies of each = 6 cards total
	return [
		"flux_strike",
		"chrono_guard",
		"flux_strike",
		"chrono_guard",
		"flux_strike",
		"chrono_guard",
	];
}
