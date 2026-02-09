export const SETTINGS_ROUTES = {
	SETTINGS: "/settings",
} as const;

export const ROUTES = {
	USER: "/settings",
	SIGNIN: "/login",
	SIGNUP: "/signup",
	GOOGLE_CALLBACK: "/google/callback",
	HUB: "/hub",
	SETTINGS: SETTINGS_ROUTES,
	DECK: "/deck",
	SHOP: "/shop",
} as const;
