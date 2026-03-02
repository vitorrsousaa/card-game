import { AppError } from "@application/errors/app-error";

export class SessionNotFound extends AppError {
	constructor() {
		super("Session not found", 404);
	}
}
