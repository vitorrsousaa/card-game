import { STORAGE_KEYS } from "@/config/storage";
import { delay } from "@/utils/delay";
import axios from "axios";
import { AppError } from "../errors/app-error";

const { VITE_GAME_API_BASE_URL, DEV: IS_DEVELOPMENT } = import.meta.env;

export const httpGameClient = axios.create({
	baseURL: VITE_GAME_API_BASE_URL,
});

httpGameClient.interceptors.request.use((config) => {
	const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

	if (storedAccessToken) {
		config.headers.Authorization = `Bearer ${storedAccessToken}`;
	}

	return config;
});

httpGameClient.interceptors.request.use((config) => {
	// config.headers.set("Access-Control-Allow-Origin", "https://app.grypp.com.br");
	config.headers["Content-Type"] = "application/json";

	return config;
});

httpGameClient.interceptors.response.use(
	async (data) => {
		if (IS_DEVELOPMENT) {
			await delay();
		}

		return data;
	},
	async (error) => {
		if (IS_DEVELOPMENT) {
			await delay();
		}

		return Promise.reject(new AppError(error));
	},
);
