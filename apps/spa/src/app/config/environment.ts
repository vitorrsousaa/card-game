import { z } from "zod";

const envSchema = z.object({
	VITE_AUTH_GOOGLE_ID: z.string(),
	VITE_AUTH_REDIRECT_URI: z.string().url(),
	VITE_API_BASE_URL: z.string().url(),
	VITE_GAME_API_BASE_URL: z.string().url(),
	IS_DEVELOPMENT: z.boolean().optional(),
});

const loadEnv = () => {
	const env = {
		VITE_AUTH_GOOGLE_ID: import.meta.env.VITE_AUTH_GOOGLE_ID,
		VITE_AUTH_REDIRECT_URI: import.meta.env.VITE_AUTH_REDIRECT_URI,
		VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
		VITE_GAME_API_BASE_URL: import.meta.env.VITE_GAME_API_BASE_URL,
		IS_DEVELOPMENT: import.meta.env.DEV,
	};

	const parsedEnv = envSchema.safeParse(env);

	if (!parsedEnv.success) {
		console.error("Invalid environment variables:", parsedEnv.error.format());
		throw new Error("Invalid configuration.");
	}

	return parsedEnv.data; // returns the validated data
};

export const env = loadEnv();
