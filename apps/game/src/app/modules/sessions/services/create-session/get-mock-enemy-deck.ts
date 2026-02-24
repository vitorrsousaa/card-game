/**
 * Generates a mock deck for the enemy (PvE opponent) for testing purposes.
 * Returns an array of card IDs that will be used to build the enemy's deck.
 *
 * Current implementation: 2 cards, 3 copies of each = 6 cards total.
 * In the future, this could be configurable based on difficulty level or enemy type.
 */
export function getMockEnemyDeck(): string[] {
	// Mock enemy deck: 2 cards, 3 copies of each = 6 cards total
	// For now, using the same cards as the player deck
	// In the future, this could have different cards or be based on enemy type
	return [
		"chrono_guard",
		"flux_strike",
		"chrono_guard",
		"flux_strike",
		"chrono_guard",
		"flux_strike",
	];
}
