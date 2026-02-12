import { AppError } from "@application/errors/app-error";
import { ServerError } from "@application/errors/server-error";
import type { IResponse } from "@application/interfaces/http";
import { createLogger } from "./logger";

const logger = createLogger("error-handler");

export function errorHandler(error: unknown): IResponse {
	if (error instanceof AppError) {
		return {
			statusCode: error.statusCode,
			body: {
				message: error.message,
			},
		};
	}

	logger.error("Unhandled error", {
		error,
	});

	return new ServerError().toResponse();
}
