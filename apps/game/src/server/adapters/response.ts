import type { Context } from "hono";
import type { IResponse } from "@application/interfaces/http";

const VALID_STATUS_CODES = [200, 201, 400, 404, 500] as const;
type ValidStatus = (typeof VALID_STATUS_CODES)[number];

function toValidStatus(code: number): ValidStatus {
	if (VALID_STATUS_CODES.includes(code as ValidStatus))
		return code as ValidStatus;
	return 500;
}

export function responseAdapter(c: Context, response: IResponse): Response {
	return c.json(response.body, toValidStatus(response.statusCode));
}
