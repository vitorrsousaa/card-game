import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/auth";
import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Signin() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const navigate = useNavigate();

	const { signin } = useAuth();

	const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log(email, password);
		signin("accessToken");
		navigate(ROUTES.HUB);
	};

	return (
		<div className="min-h-screen flex items-center justify-center relative overflow-hidden">
			{/* Animated background */}
			<div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background">
				<div className="absolute inset-0 opacity-20">
					{[...Array(20)].map((_, i) => (
						<div
							key={i}
							className="absolute rounded-full bg-primary animate-pulse"
							style={{
								width: Math.random() * 100 + 50 + "px",
								height: Math.random() * 100 + 50 + "px",
								top: Math.random() * 100 + "%",
								left: Math.random() * 100 + "%",
								animationDelay: Math.random() * 3 + "s",
								animationDuration: Math.random() * 3 + 3 + "s",
							}}
						/>
					))}
				</div>
			</div>

			{/* Login Form */}
			<Card className="w-full max-w-md mx-4 z-10 bg-secondary/90 backdrop-blur-md border-2 border-primary/30 shadow-2xl shadow-primary/20">
				<CardHeader className="text-center space-y-2 pb-4">
					<div className="mx-auto mb-2">
						<div className="text-6xl animate-float">⏳</div>
					</div>
					<CardTitle className="text-3xl font-bold text-balance">
						Chronomancers of the Eternal Flux
					</CardTitle>
					<CardDescription className="text-base">
						Enter the realm of temporal mastery
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="chronomancer@eonspire.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="bg-background/50"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-background/50"
								required
							/>
						</div>
						<Button type="submit" className="w-full" size="lg">
							Enter the Timeline
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full bg-transparent"
							size="lg"
						>
							Create Account
						</Button>
					</form>
					<p className="text-center text-sm text-muted-foreground mt-6 italic">
						The timeline awaits your command.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
