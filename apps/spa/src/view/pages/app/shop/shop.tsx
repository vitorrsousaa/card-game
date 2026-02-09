import { ROUTES } from "@/config/routes";
import { TopBar } from "@/modules/hub/view/components/topbar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/dialog";
import { Separator } from "@repo/ui/separator";
import { ArrowLeft, Coins, Package, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Shop() {
	const navigate = useNavigate();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<{
		name: string;
		price: number;
	} | null>(null);

	const handlePurchase = (name: string, price: number) => {
		setSelectedItem({ name, price });
		setDialogOpen(true);
	};

	const confirmPurchase = () => {
		setDialogOpen(false);
		// Mock purchase logic
	};

	return (
		<div className="min-h-screen bg-background">
			<TopBar />

			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate(ROUTES.HUB)}
					>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold">Temporal Marketplace</h1>
						<p className="text-muted-foreground">
							Expand your collection with Chronal Crystals
						</p>
					</div>
				</div>

				{/* Card Packs Section */}
				<div className="mb-12">
					<div className="flex items-center gap-2 mb-6">
						<Package className="w-6 h-6 text-primary" />
						<h2 className="text-2xl font-bold">Card Packs & Decks</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						<Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20">
							<CardHeader>
								<Badge className="w-fit mb-2 bg-muted text-muted-foreground">
									Starter
								</Badge>
								<CardTitle className="text-xl">Starter Deck</CardTitle>
								<CardDescription>
									Perfect for beginners entering the temporal realm
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<ul className="text-sm space-y-2 text-muted-foreground">
										<li>• 30 balanced cards</li>
										<li>• Mix of all card types</li>
										<li>• Ready to play immediately</li>
									</ul>
									<Separator />
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Coins className="w-5 h-5 text-primary" />
											<span className="text-2xl font-bold">500</span>
										</div>
										<Button onClick={() => handlePurchase("Starter Deck", 500)}>
											Purchase
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-2 hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/20 relative">
							<div className="absolute -top-3 -right-3">
								<Badge className="bg-accent text-accent-foreground">
									Popular
								</Badge>
							</div>
							<CardHeader>
								<Badge className="w-fit mb-2 bg-accent/20 text-accent">
									Premium
								</Badge>
								<CardTitle className="text-xl">Chronomancer Deck</CardTitle>
								<CardDescription>
									Advanced deck for skilled temporal masters
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<ul className="text-sm space-y-2 text-muted-foreground">
										<li>• 30 powerful cards</li>
										<li>• Legendary cards included</li>
										<li>• Advanced strategies enabled</li>
									</ul>
									<Separator />
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Coins className="w-5 h-5 text-primary" />
											<span className="text-2xl font-bold">1500</span>
										</div>
										<Button
											onClick={() => handlePurchase("Chronomancer Deck", 1500)}
										>
											Purchase
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-2 hover:border-chart-3/50 transition-all hover:shadow-lg hover:shadow-chart-3/20">
							<CardHeader>
								<Badge className="w-fit mb-2 bg-chart-3/20 text-chart-3">
									Random
								</Badge>
								<CardTitle className="text-xl">Temporal Boost Pack</CardTitle>
								<CardDescription>
									Mystery pack with 5 random cards
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<ul className="text-sm space-y-2 text-muted-foreground">
										<li>• 5 random cards</li>
										<li>• Rare card guaranteed</li>
										<li>• Chance for legendary</li>
									</ul>
									<Separator />
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Coins className="w-5 h-5 text-primary" />
											<span className="text-2xl font-bold">300</span>
										</div>
										<Button
											variant="outline"
											onClick={() => handlePurchase("Temporal Boost Pack", 300)}
										>
											Purchase
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Crystals Section */}
				<div>
					<div className="flex items-center gap-2 mb-6">
						<Sparkles className="w-6 h-6 text-primary" />
						<h2 className="text-2xl font-bold">Chronal Crystals</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						<Card className="border-2 hover:border-primary/50 transition-all">
							<CardHeader className="text-center">
								<div className="mx-auto mb-3 text-5xl">💎</div>
								<CardTitle>Small Bundle</CardTitle>
								<CardDescription>A modest crystal supply</CardDescription>
							</CardHeader>
							<CardContent className="text-center space-y-4">
								<div className="text-4xl font-bold text-primary">1,000</div>
								<p className="text-muted-foreground text-sm">
									Chronal Crystals
								</p>
								<Separator />
								<div className="text-2xl font-bold">$4.99</div>
								<Button variant="outline" className="w-full bg-transparent">
									Buy Now
								</Button>
							</CardContent>
						</Card>

						<Card className="border-2 hover:border-primary/50 transition-all relative scale-105">
							<div className="absolute -top-3 left-1/2 -translate-x-1/2">
								<Badge className="bg-primary text-primary-foreground">
									Best Value
								</Badge>
							</div>
							<CardHeader className="text-center">
								<div className="mx-auto mb-3 text-5xl">💎💎</div>
								<CardTitle>Medium Bundle</CardTitle>
								<CardDescription>For serious collectors</CardDescription>
							</CardHeader>
							<CardContent className="text-center space-y-4">
								<div className="text-4xl font-bold text-primary">2,500</div>
								<p className="text-muted-foreground text-sm">
									Chronal Crystals
								</p>
								<Separator />
								<div className="text-2xl font-bold">$9.99</div>
								<Button className="w-full">Buy Now</Button>
							</CardContent>
						</Card>

						<Card className="border-2 hover:border-primary/50 transition-all">
							<CardHeader className="text-center">
								<div className="mx-auto mb-3 text-5xl">💎💎💎</div>
								<CardTitle>Large Bundle</CardTitle>
								<CardDescription>Maximum temporal power</CardDescription>
							</CardHeader>
							<CardContent className="text-center space-y-4">
								<div className="text-4xl font-bold text-primary">6,000</div>
								<p className="text-muted-foreground text-sm">
									Chronal Crystals
								</p>
								<Separator />
								<div className="text-2xl font-bold">$19.99</div>
								<Button variant="outline" className="w-full bg-transparent">
									Buy Now
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>

			{/* Purchase Confirmation Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Purchase</DialogTitle>
						<DialogDescription>
							Are you sure you want to purchase {selectedItem?.name}?
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
							<span className="font-semibold">{selectedItem?.name}</span>
							<div className="flex items-center gap-2">
								<Coins className="w-5 h-5 text-primary" />
								<span className="text-xl font-bold">{selectedItem?.price}</span>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={confirmPurchase}>Confirm Purchase</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
