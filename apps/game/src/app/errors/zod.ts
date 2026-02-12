import type { ZodError as TZodError } from "zod";

export class ZodError {
	public readonly message: { field: string | number; message: string }[];
	public readonly statusCode: number;

	constructor(error: TZodError) {
		this.message = error.errors.map((error) => {
			return {
				field: error.path.map((path) => path.toString()).join("-"),
				message: error.message,
			};
		});
		this.statusCode = 422;
	}
}
