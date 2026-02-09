import { GameCard } from "@/modules/deck/view/components/game-card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Progress } from "@repo/ui/progress";
import { useState } from "react";

import { Heart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockEnemyCards, mockPlayerDeck } from "./deck";

export function Match() {
	const navigate = useNavigate();
	const [playerHealth, setPlayerHealth] = useState(30);
	const [enemyHealth, setEnemyHealth] = useState(30);
	const [playerMana, setPlayerMana] = useState(5);
	const [maxMana] = useState(10);
	const [turn, setTurn] = useState(1);
	const [selectedCard, setSelectedCard] = useState<string | null>(null);

	const playerHand = mockPlayerDeck.slice(0, 5);
	const enemyBoard = mockEnemyCards.slice(0, 2);
	const playerBoard = mockPlayerDeck.slice(5, 7);

	const handleEndTurn = () => {
		setTurn(turn + 1);
		setPlayerMana(Math.min(maxMana, playerMana + 1));
		setSelectedCard(null);
	};

	const handleCardClick = (cardId: string) => {
		setSelectedCard(selectedCard === cardId ? null : cardId);
	};

	const handleConcede = () => {
		navigate("/result?outcome=defeat");
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Top Bar - Enemy Info */}
			<div className="bg-secondary/30 backdrop-blur-md border-b border-border px-6 py-3">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Badge variant="destructive" className="text-base px-3 py-1">
							Enemy
						</Badge>
						<div className="flex items-center gap-2">
							<Heart className="w-5 h-5 text-destructive" />
							<span className="font-bold">{enemyHealth} HP</span>
						</div>
					</div>
					<div className="text-sm text-muted-foreground">Turn {turn}</div>
					<Button variant="ghost" size="sm" onClick={handleConcede}>
						Concede
					</Button>
				</div>
			</div>

			<div className="flex-1 flex flex-col">
				{/* Enemy Area */}
				<div className="bg-secondary/10 border-b border-border p-6">
					<div className="max-w-7xl mx-auto">
						<div className="mb-4">
							<p className="text-sm text-muted-foreground mb-2">Enemy Hand</p>
							<div className="flex gap-2">
								{[...Array(6)].map((_, i) => (
									<div
										key={i}
										className="w-16 h-20 bg-secondary/50 rounded-lg border-2 border-border"
									/>
								))}
							</div>
						</div>
						<div>
							<p className="text-sm text-muted-foreground mb-2">Enemy Board</p>
							<div className="flex gap-4 min-h-[200px]">
								{enemyBoard.map((card) => (
									<div key={card.id} className="w-40">
										<GameCard card={card} />
									</div>
								))}
								{enemyBoard.length === 0 && (
									<div className="flex-1 flex items-center justify-center text-muted-foreground">
										No cards in play
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Center Area - Battle Zone */}
				<div className="flex-1 bg-gradient-to-br from-background via-secondary/5 to-background flex items-center justify-center">
					<div className="text-center space-y-2">
						<div className="text-6xl animate-pulse">⚔️</div>
						<p className="text-muted-foreground text-sm">
							{selectedCard ? "Select a target" : "Play a card or end turn"}
						</p>
					</div>
				</div>

				{/* Player Area */}
				<div className="bg-secondary/10 border-t border-border p-6">
					<div className="max-w-7xl mx-auto">
						<div className="mb-4">
							<p className="text-sm text-muted-foreground mb-2">Your Board</p>
							<div className="flex gap-4 min-h-[200px]">
								{playerBoard.map((card) => (
									<div key={card.id} className="w-40">
										<GameCard card={card} />
									</div>
								))}
								{playerBoard.length === 0 && (
									<div className="flex-1 flex items-center justify-center text-muted-foreground">
										No cards in play
									</div>
								)}
							</div>
						</div>
						<div>
							<p className="text-sm text-muted-foreground mb-2">Your Hand</p>
							<div className="flex gap-3 justify-center">
								{playerHand.map((card) => (
									<div key={card.id} className="w-40">
										<GameCard
											card={card}
											selected={selectedCard === card.id}
											onClick={() => handleCardClick(card.id)}
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Bar - Player Info */}
			<div className="bg-secondary/30 backdrop-blur-md border-t border-border px-6 py-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
							<Heart className="w-5 h-5 text-destructive" />
							<span className="font-bold">{playerHealth} HP</span>
						</div>
						<div className="flex items-center gap-2">
							<Zap className="w-5 h-5 text-primary" />
							<span className="font-bold">
								{playerMana} / {maxMana}
							</span>
							<Progress value={(playerMana / maxMana) * 100} className="w-24" />
						</div>
					</div>
					<Button size="lg" onClick={handleEndTurn}>
						End Turn
					</Button>
				</div>
			</div>
		</div>
	);
}
