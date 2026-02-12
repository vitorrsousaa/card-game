import { defineConfig } from "tsup";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/common/index.ts",
		"src/game/index.ts",
		"src/game/sessions/index.ts",
		"src/game/cards/index.ts",
		"src/game/decks/index.ts",
	],
	format: ["esm"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
});
