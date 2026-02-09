import { ROUTES } from "@/config/routes";
import {
	GameCard,
	type CardType,
	type GameCardData,
} from "@/modules/deck/view/components/game-card";
import { TopBar } from "@/modules/hub/view/components/topbar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_DECK_SIZE = 30;

export const mockCards: GameCardData[] = [
	{
		id: "1",
		name: "Temporal Strike",
		cost: 3,
		type: "Attack",
		effect: "Deal 5 damage. Draw a card.",
		attack: 5,
	},
	{
		id: "2",
		name: "Time Warp",
		cost: 5,
		type: "Spell",
		effect: "Take an extra turn after this one.",
	},
	{
		id: "3",
		name: "Chronal Shield",
		cost: 2,
		type: "Defense",
		effect: "Gain 8 armor. Restore 2 mana.",
		defense: 8,
	},
	{
		id: "4",
		name: "Paradox Warrior",
		cost: 4,
		type: "Attack",
		effect: "Battlecry: Deal damage equal to your mana.",
		attack: 4,
		defense: 3,
	},
	{
		id: "5",
		name: "Rewind",
		cost: 1,
		type: "Spell",
		effect: "Return a friendly minion to your hand.",
	},
	{
		id: "6",
		name: "Future Sight",
		cost: 2,
		type: "Spell",
		effect: "Draw 3 cards. Discard 1 card.",
	},
	{
		id: "7",
		name: "Eon Guardian",
		cost: 6,
		type: "Defense",
		effect: "Taunt. Cannot be targeted by spells.",
		attack: 3,
		defense: 9,
	},
	{
		id: "8",
		name: "Temporal Rift",
		cost: 7,
		type: "Spell",
		effect: "Destroy all minions. Restore 10 health.",
	},
	{
		id: "9",
		name: "Flux Assassin",
		cost: 3,
		type: "Attack",
		effect: "Stealth. Combo: +3 attack.",
		attack: 3,
		defense: 2,
	},
	{
		id: "10",
		name: "Time Freeze",
		cost: 4,
		type: "Spell",
		effect: "Freeze all enemy minions for 2 turns.",
	},
	{
		id: "11",
		name: "Chrono Berserker",
		cost: 5,
		type: "Attack",
		effect: "Enrage: +4 attack when damaged.",
		attack: 6,
		defense: 4,
	},
	{
		id: "12",
		name: "Eternal Barrier",
		cost: 3,
		type: "Defense",
		effect: "Gain 6 armor. Draw a card.",
		defense: 6,
	},
];

export const mockPlayerDeck = mockCards.slice(0, 6);
export const mockEnemyCards = mockCards.slice(6, 9);

export function Deck() {
	const navigate = useNavigate();
	const [deck, setDeck] = useState<GameCardData[]>(mockCards.slice(0, 8));
	const [collection] = useState<GameCardData[]>(mockCards);
	const [filterType, setFilterType] = useState<CardType | "All">("All");

	const addToDeck = (card: GameCardData) => {
		if (deck.length < MAX_DECK_SIZE) {
			setDeck([...deck, card]);
		}
	};

	const removeFromDeck = (cardId: string) => {
		const index = deck.findIndex((c) => c.id === cardId);
		if (index !== -1) {
			const newDeck = [...deck];
			newDeck.splice(index, 1);
			setDeck(newDeck);
		}
	};

	const filteredCollection =
		filterType === "All"
			? collection
			: collection.filter((c) => c.type === filterType);

	return (
		<div className="min-h-screen bg-background">
			<TopBar />

			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate(ROUTES.HUB)}
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<div>
							<h1 className="text-3xl font-bold">Deck Management</h1>
							<p className="text-muted-foreground">
								Build your perfect temporal strategy
							</p>
						</div>
					</div>
					<Button size="lg">Save Deck</Button>
				</div>

				<div className="grid lg:grid-cols-3 gap-6">
					{/* Current Deck */}
					<div className="lg:col-span-1">
						<Card className="sticky top-6">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle>Current Deck</CardTitle>
									<Badge
										variant={
											deck.length === MAX_DECK_SIZE ? "default" : "secondary"
										}
									>
										{deck.length} / {MAX_DECK_SIZE}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
									{deck.length === 0 ? (
										<div className="text-center py-12 text-muted-foreground">
											<p>No cards in deck</p>
											<p className="text-sm">Add cards from your collection</p>
										</div>
									) : (
										deck.map((card, index) => (
											<div
												key={`${card.id}-${index}`}
												className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
											>
												<span className="text-sm font-semibold text-muted-foreground">
													{index + 1}.
												</span>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold truncate">
														{card.name}
													</p>
													<p className="text-xs text-muted-foreground">
														{card.type}
													</p>
												</div>
												<Badge className="shrink-0">{card.cost}</Badge>
												<Button
													size="icon"
													variant="ghost"
													className="shrink-0 h-8 w-8"
													onClick={() => removeFromDeck(card.id)}
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										))
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Collection */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle>Card Collection</CardTitle>
								<Separator className="mt-4" />
								<Tabs
									value={filterType}
									onValueChange={(v) => setFilterType(v as CardType | "All")}
								>
									<TabsList className="grid grid-cols-4 w-full">
										<TabsTrigger value="All">All</TabsTrigger>
										<TabsTrigger value="Attack">Attack</TabsTrigger>
										<TabsTrigger value="Spell">Spell</TabsTrigger>
										<TabsTrigger value="Defense">Defense</TabsTrigger>
									</TabsList>
								</Tabs>
							</CardHeader>
							<CardContent>
								<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
									{filteredCollection.map((card) => (
										<div key={card.id} className="relative group">
											<GameCard card={card} />
											<Button
												size="sm"
												className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={() => addToDeck(card)}
												disabled={deck.length >= MAX_DECK_SIZE}
											>
												<Plus className="w-4 h-4 mr-1" />
												Add
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
