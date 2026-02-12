import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { CreateSessionService } from "@application/modules/sessions/services/create-session";
import { ProcessEngineBridge } from "@infra/engine/process-engine-bridge";

const require = createRequire(import.meta.url);
const engineDir = dirname(require.resolve("@repo/engine/package.json"));
const scriptPath = join(engineDir, "src", "main.lua");

export function makeCreateSessionService(): CreateSessionService {
	const engineBridge = new ProcessEngineBridge(scriptPath, { cwd: engineDir });
	return new CreateSessionService(engineBridge);
}
