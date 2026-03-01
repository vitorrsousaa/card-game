import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/config/routes";
import { useCreateSession } from "@/modules/match/app/hooks/use-create-session";
import { Button } from "@repo/ui/button";

const loadingMessages = [
	"Stabilizing timeline...",
	"Calculating temporal outcomes...",
	"Synchronizing chronal frequencies...",
	"Preparing battlefield matrix...",
	"Loading temporal arsenal...",
];

const LOADING_PARTICLE_KEYS = Array.from(
	{ length: 15 },
	(_, i) => `loading-particle-${i}`,
);

export function LoadingPage() {
	const navigate = useNavigate();
	const { createSessionAsync, isPendingCreateSession, isErrorCreateSession } =
		useCreateSession();
	const hasStarted = useRef(false);

	const randomMessage = useMemo(
		() => loadingMessages[Math.floor(Math.random() * loadingMessages.length)],
		[],
	);

	const handleCreateSession = useCallback(async () => {
		const session = await createSessionAsync();
		const sessionId = session?.id;
		if (sessionId) {
			navigate(ROUTES.MATCH(sessionId), { replace: true });
		}
	}, [createSessionAsync, navigate]);

	useEffect(() => {
		if (hasStarted.current) return;
		hasStarted.current = true;

		handleCreateSession();
	}, [handleCreateSession]);

	const handleBackToHub = () => {
		navigate(ROUTES.HUB);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background relative overflow-hidden">
			{/* Animated background particles */}
			<div className="absolute inset-0 opacity-30">
				{LOADING_PARTICLE_KEYS.map((particleKey) => (
					<div
						key={particleKey}
						className="absolute rounded-full bg-primary animate-pulse"
						style={{
							width: `${Math.random() * 60 + 30}px`,
							height: `${Math.random() * 60 + 30}px`,
							top: `${Math.random() * 100}%`,
							left: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 2}s`,
							animationDuration: `${Math.random() * 2 + 2}s`,
						}}
					/>
				))}
			</div>

			{/* Content */}
			<div className="z-10 text-center space-y-8">
				{isErrorCreateSession ? (
					<>
						<div className="text-8xl">⚠️</div>
						<div className="space-y-4">
							<h2 className="text-2xl font-bold text-destructive">
								Failed to create session
							</h2>
							<p className="text-muted-foreground">
								Something went wrong. Please try again.
							</p>
							<Button onClick={handleBackToHub} size="lg">
								Back to Hub
							</Button>
						</div>
					</>
				) : (
					<>
						<div className="relative">
							<div className="text-8xl animate-float">⏳</div>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-32 h-32 rounded-full border-4 border-primary border-t-transparent animate-spin" />
							</div>
						</div>
						<div className="space-y-4">
							<h2 className="text-2xl font-bold text-primary animate-pulse">
								{randomMessage}
							</h2>
							<p className="text-muted-foreground">Entering temporal flux...</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
