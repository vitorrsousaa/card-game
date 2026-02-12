function getEnv(key: string, defaultValue?: string): string {
	const value = process.env[key] ?? defaultValue;
	if (value === undefined) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

export const env = {
	port: Number(getEnv("PORT", "3001")),
	nodeEnv: getEnv("NODE_ENV", "development"),
} as const;
