import { ROUTES } from "@/config/routes";
import { DashboardLayout } from "@/layouts/app/dashboard-layout";
import { LoadingPage } from "@/pages/app/loading";
import { Suspense, lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Hub = lazy(() =>
	import("@/pages/app/hub").then((module) => ({
		default: module.Hub,
	})),
);

const Shop = lazy(() =>
	import("@/pages/app/shop").then((module) => ({
		default: module.Shop,
	})),
);

const Deck = lazy(() =>
	import("@/pages/app/deck").then((module) => ({
		default: module.Deck,
	})),
);

const Match = lazy(() =>
	import("@/pages/app/match").then((module) => ({
		default: module.Match,
	})),
);

export const appRoutes: RouteObject = {
	element: <DashboardLayout />,
	children: [
		{
			path: ROUTES.HUB,
			element: <Hub />,
		},
		{
			path: ROUTES.SHOP,
			element: <Shop />,
		},
		{
			path: ROUTES.DECK,
			element: <Deck />,
		},
		{
			path: ROUTES.MATCH_PATTERN,
			element: (
				<Suspense fallback={<LoadingPage />}>
					<Match />
				</Suspense>
			),
		},
	],
};
