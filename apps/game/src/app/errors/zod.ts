import type { ZodError as LibZodError } from "zod";

export class ZodError {
	public readonly message: { field: string | number; message: string }[];
	public readonly statusCode: number;

	constructor(error: LibZodError) {
		const issues = error?.issues ?? [];
		this.message = issues.map((issue) => ({
			field: issue.path.map((path) => path.toString()).join("-"),
			message: issue.message,
		}));
		this.statusCode = 422;
	}
}
