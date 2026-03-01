export function delay(ms = 3000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
