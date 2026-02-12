import { ZodError } from "@application/errors/zod";
import type { IResponse } from "@application/interfaces/http";
import type * as z from "zod";

type IReturnErrorMissingFieldOutput<S extends z.ZodType> = [
	true,
	z.SafeParseSuccess<z.output<S>>["data"],
];

type IReturnErrorMissingFieldOutputFalse = [false, IResponse];

type IReturnErrorMissingFieldOutputUnion<S extends z.ZodType> =
	| IReturnErrorMissingFieldOutput<S>
	| IReturnErrorMissingFieldOutputFalse;

export function missingFields<S extends z.ZodType>(
	schema: S,
	request: unknown,
): IReturnErrorMissingFieldOutputUnion<S> {
	const result = schema.safeParse(request);

	if (!result.success) {
		const { statusCode, message } = new ZodError(result.error);

		return [
			false,
			{
				statusCode,
				body: message,
			},
		];
	}

	return [true, result.data];
}
