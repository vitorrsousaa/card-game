export function delay(ms = 4000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
