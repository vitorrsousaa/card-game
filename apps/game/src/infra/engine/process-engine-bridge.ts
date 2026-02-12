import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { createInterface } from "node:readline";
import type {
	IEngineBridge,
	EngineBridgeResult,
} from "@application/interfaces/engine-bridge";
import type { EngineInput } from "@application/interfaces/engine-protocol";

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
				try {
					const result = JSON.parse(line) as EngineBridgeResult;
					resolve(result);
				} catch {
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
				process.stderr.write(chunk);
			});

			child.on("error", (err) => {
				if (!resolved) {
					resolved = true;
					reject(err);
				}
			});

			child.on("exit", (code, signal) => {
				if (!resolved) {
					resolved = true;
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

			child.stdin?.write(`${JSON.stringify(input)}\n`, (err) => {
				if (err && !resolved) {
					resolved = true;
					reject(err);
				}
				child.stdin?.end();
			});
		});
	}
}
