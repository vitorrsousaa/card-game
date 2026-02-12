import type { IResponse } from "@application/interfaces/http";
import { AppError } from "@application/errors/app-error";
import { ServerError } from "@application/errors/server-error";

export function errorHandler(error: unknown): IResponse {
	if (error instanceof AppError) {
		return {
			statusCode: error.statusCode,
			body: {
				message: error.message,
			},
		};
	}

	return new ServerError().toResponse();
}
