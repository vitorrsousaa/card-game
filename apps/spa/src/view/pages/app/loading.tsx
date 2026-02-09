"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const loadingMessages = [
	"Stabilizing timeline...",
	"Calculating temporal outcomes...",
	"Synchronizing chronal frequencies...",
	"Preparing battlefield matrix...",
	"Loading temporal arsenal...",
];

export function LoadingPage() {
	const navigate = useNavigate();

	useEffect(() => {
		const timer = setTimeout(() => {
			navigate("/match");
		}, 3000);

		return () => clearTimeout(timer);
	}, [navigate]);

	const randomMessage =
		loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background relative overflow-hidden">
			{/* Animated background particles */}
			<div className="absolute inset-0 opacity-30">
				{[...Array(15)].map((_, i) => (
					<div
						key={i}
						className="absolute rounded-full bg-primary animate-pulse"
						style={{
							width: Math.random() * 60 + 30 + "px",
							height: Math.random() * 60 + 30 + "px",
							top: Math.random() * 100 + "%",
							left: Math.random() * 100 + "%",
							animationDelay: Math.random() * 2 + "s",
							animationDuration: Math.random() * 2 + 2 + "s",
						}}
					/>
				))}
			</div>

			{/* Loading content */}
			<div className="z-10 text-center space-y-8">
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
			</div>
		</div>
	);
}
