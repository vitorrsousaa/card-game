import { z } from "zod";

export const CreateSessionInputDTO = z.object({
	userId: z.uuid("User ID is required"),
});

export type CreateSessionInput = z.infer<typeof CreateSessionInputDTO>;

export const CreateSessionOutputDTO = z.object({
	sessions: z.array(
		z.object({
			id: z.uuid("Session ID is required"),
			userId: z.uuid("User ID is required"),
			createdAt: z.date("Created at is required"),
			updatedAt: z.date("Updated at is required"),
		}),
	),
});

export type CreateSessionOutput = z.infer<typeof CreateSessionOutputDTO>;
