import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { createInterface } from "node:readline";
import { createLogger } from "@application/utils/logger";
import type {
	IEngineBridge,
	EngineBridgeResult,
} from "@application/interfaces/engine-bridge";
import type { EngineInput } from "@application/interfaces/engine-protocol";

const logger = createLogger("process-engine-bridge");

export interface ProcessEngineBridgeOptions {
	/** Working directory (package root so Lua can require "json"). Default: dir of scriptPath parent. */
	cwd?: string;
	/** Command to run (e.g. "lua", "lua5.4"). Default: "lua". */
	command?: string;
	/** Extra args passed after script path. Default: []. */
	args?: string[];
}

/**
 * Calls the Lua engine (@repo/engine) as a subprocess.
 * Protocol: one JSON line in (stdin) -> one JSON line out (stdout).
 */
export class ProcessEngineBridge implements IEngineBridge {
	constructor(
		private readonly scriptPath: string,
		private readonly options: ProcessEngineBridgeOptions = {},
	) {}

	async run(input: EngineInput): Promise<EngineBridgeResult> {
		const {
			cwd = dirname(dirname(this.scriptPath)),
			command = "lua",
			args = [],
		} = this.options;

		logger.debug("ProcessEngineBridge.run - spawning Lua process", {
			command,
			scriptPath: this.scriptPath,
			cwd,
			inputType: input.type,
		});

		return new Promise((resolve, reject) => {
			const child = spawn(command, [this.scriptPath, ...args], {
				stdio: ["pipe", "pipe", "pipe"],
				cwd,
			});

			const rl = createInterface({
				input: child.stdout,
				crlfDelay: Number.POSITIVE_INFINITY,
			});
			let resolved = false;

			rl.once("line", (line) => {
				if (resolved) return;
				resolved = true;
				logger.debug("ProcessEngineBridge - received line from engine", {
					line,
				});
				try {
					const result = JSON.parse(line) as EngineBridgeResult;
					logger.debug("ProcessEngineBridge - parsed result", {
						ok: result.ok,
						sessionId: result.ok ? result.state.sessionId : undefined,
					});
					resolve(result);
				} catch (parseError) {
					logger.error("ProcessEngineBridge - JSON parse error", {
						line,
						error: parseError,
					});
					resolve({
						ok: false,
						error: "Invalid JSON from engine",
						code: "ENGINE_PARSE_ERROR",
					});
				}
				rl.close();
				child.kill();
			});

			child.stderr?.on("data", (chunk) => {
				// Log engine stderr but don't fail the request
				const stderrMessage = chunk.toString();
				logger.warn("ProcessEngineBridge - engine stderr", {
					stderr: stderrMessage,
				});
				process.stderr.write(chunk);
			});

			child.on("error", (err) => {
				if (!resolved) {
					resolved = true;
					logger.error("ProcessEngineBridge - spawn error", {
						error: err,
						message: err.message,
						command,
						scriptPath: this.scriptPath,
					});
					reject(err);
				}
			});

			child.on("exit", (code, signal) => {
				if (!resolved) {
					resolved = true;
					logger.error("ProcessEngineBridge - process exited without output", {
						code,
						signal,
						command,
						scriptPath: this.scriptPath,
					});
					resolve({
						ok: false,
						error:
							code !== 0
								? `Engine exited with code ${code}`
								: "No output from engine",
						code: "ENGINE_EXIT",
					});
				}
			});

			const inputJson = JSON.stringify(input);
			logger.debug("ProcessEngineBridge - writing to stdin", { inputJson });
			child.stdin?.write(`${inputJson}\n`, (err) => {
				if (err && !resolved) {
					resolved = true;
					logger.error("ProcessEngineBridge - stdin write error", {
						error: err,
					});
					reject(err);
				}
				child.stdin?.end();
			});
		});
	}
}
