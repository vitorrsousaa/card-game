import { ROUTES } from "@/config/routes";
import { TopBar } from "@/modules/hub/view/components/topbar";
import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import { Library, Play, Settings, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export function Hub() {
	return (
		<div className="min-h-screen bg-background">
			<TopBar />

			<main className="max-w-7xl mx-auto px-6 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
						Eonspire Command Center
					</h1>
					<p className="text-lg text-muted-foreground">
						Master the flow of time across the Eternal Flux
					</p>
				</div>

				{/* Main Action Cards */}
				<div className="grid md:grid-cols-2 gap-6 mb-8">
					<Link to="/loading?next=match" className="block group">
						<Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 border-2 hover:border-primary bg-gradient-to-br from-secondary/50 to-secondary/30 backdrop-blur-sm">
							<CardHeader>
								<div className="flex items-center gap-3 mb-2">
									<div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
										<Play className="w-8 h-8 text-primary" />
									</div>
									<CardTitle className="text-2xl">Start Match</CardTitle>
								</div>
								<CardDescription className="text-base">
									Enter the temporal battlefield and test your mastery against
									AI opponents
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button className="w-full" size="lg">
									Begin Timeline Duel
								</Button>
							</CardContent>
						</Card>
					</Link>

					<Link to={ROUTES.DECK} className="block group">
						<Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent/30 border-2 hover:border-accent bg-gradient-to-br from-secondary/50 to-secondary/30 backdrop-blur-sm">
							<CardHeader>
								<div className="flex items-center gap-3 mb-2">
									<div className="p-3 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
										<Library className="w-8 h-8 text-accent" />
									</div>
									<CardTitle className="text-2xl">My Deck</CardTitle>
								</div>
								<CardDescription className="text-base">
									Customize your deck and manage your collection of temporal
									cards
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant="outline"
									className="w-full bg-transparent"
									size="lg"
								>
									Manage Collection
								</Button>
							</CardContent>
						</Card>
					</Link>
				</div>

				{/* Secondary Actions */}
				<div className="grid md:grid-cols-3 gap-6">
					<Link to={ROUTES.SHOP} className="block group">
						<Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-chart-3/20 border hover:border-chart-3/50 bg-secondary/30 backdrop-blur-sm">
							<CardHeader className="text-center">
								<div className="mx-auto mb-3 p-3 rounded-lg bg-chart-3/20 w-fit">
									<ShoppingBag className="w-6 h-6 text-chart-3" />
								</div>
								<CardTitle>Shop</CardTitle>
								<CardDescription>
									Acquire new cards and boost packs with Chronal Crystals
								</CardDescription>
							</CardHeader>
						</Card>
					</Link>

					<Link to={ROUTES.SETTINGS.SETTINGS} className="block group">
						<Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-muted/20 border hover:border-muted-foreground/50 bg-secondary/30 backdrop-blur-sm">
							<CardHeader className="text-center">
								<div className="mx-auto mb-3 p-3 rounded-lg bg-muted/20 w-fit">
									<Settings className="w-6 h-6 text-muted-foreground" />
								</div>
								<CardTitle>Settings</CardTitle>
								<CardDescription>
									Configure audio, graphics, and account preferences
								</CardDescription>
							</CardHeader>
						</Card>
					</Link>

					<Card className="h-full bg-secondary/30 backdrop-blur-sm border-dashed">
						<CardHeader className="text-center">
							<div className="mx-auto mb-3 text-4xl opacity-50">🏆</div>
							<CardTitle className="text-muted-foreground">
								Daily Rewards
							</CardTitle>
							<CardDescription>
								Check back daily for bonus crystals
							</CardDescription>
						</CardHeader>
					</Card>
				</div>

				{/* Footer flavor text */}
				<div className="mt-12 text-center">
					<p className="text-sm text-muted-foreground italic animate-pulse">
						The streams of time converge at Eonspire...
					</p>
				</div>
			</main>
		</div>
	);
}
