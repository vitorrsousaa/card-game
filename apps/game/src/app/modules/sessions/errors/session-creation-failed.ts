import { AppError } from "@application/errors/app-error";

export class SessionCreationFailed extends AppError {
	constructor() {
		const message = "Session creation failed";
		super(message, 502);
	}
}
