import type { IResponse } from "@application/interfaces/http";
import { AppError } from "./app-error";

export class ServerError extends AppError {
	constructor() {
		super("Internal server error", 500);
	}

	public toResponse(): IResponse {
		return {
			statusCode: this.statusCode,
			body: {
				message: this.message,
			},
		};
	}
}
