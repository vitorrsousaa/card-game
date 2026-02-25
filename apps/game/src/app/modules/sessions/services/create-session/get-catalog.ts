import { createLogger } from "@application/utils/logger";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCatalog, type Catalog } from "./validate-catalog";

const logger = createLogger("get-catalog");

/**
 * Reads and validates the cards catalog from data/cards.json.
 * Returns a catalog object indexed by card ID.
 */
export async function getCatalog(): Promise<Catalog> {
	try {
		// Get the directory of the current file
		const currentFile = fileURLToPath(import.meta.url);
		const currentDir = dirname(currentFile);
		// Navigate from src/app/modules/sessions/services/create-session to apps/game/data/cards.json
		// Go up 6 levels: create-session -> services -> sessions -> modules -> app -> src -> game
		const catalogPath = join(currentDir, "../../../../../../data/cards.json");

		const fileContent = await readFile(catalogPath, "utf-8");
		const cardsJson = JSON.parse(fileContent);

		const catalog = validateCatalog(cardsJson);

		logger.info("Catalog validated successfully", {
			cardsCount: Object.keys(catalog).length,
		});

		return catalog;
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("ENOENT")) {
				logger.error("Catalog file not found", { error: error.message });
				throw new Error("Catalog file not found: data/cards.json");
			}
			if (error.message.includes("JSON")) {
				logger.error("Invalid JSON in catalog file", { error: error.message });
				throw new Error("Invalid JSON format in catalog file");
			}
			logger.error("Error reading or validating catalog", {
				error: error.message,
			});
			throw error;
		}
		logger.error("Unknown error reading catalog", { error });
		throw new Error("Failed to read catalog");
	}
}
