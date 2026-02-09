import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { cn } from "@repo/ui/utils";

export type CardType = "Attack" | "Spell" | "Defense";

export interface GameCardData {
	id: string;
	name: string;
	cost: number;
	type: CardType;
	effect: string;
	attack?: number;
	defense?: number;
	image?: string;
}

interface GameCardProps {
	card: GameCardData;
	onClick?: () => void;
	selected?: boolean;
	enlarged?: boolean;
	className?: string;
}

export function GameCard({
	card,
	onClick,
	selected,
	enlarged,
	className,
}: GameCardProps) {
	const typeColors = {
		Attack: "bg-destructive text-destructive-foreground",
		Spell: "bg-accent text-accent-foreground",
		Defense: "bg-chart-3 text-foreground",
	};

	return (
		<Card
			className={cn(
				"relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 border-2",
				selected && "ring-2 ring-primary shadow-lg shadow-primary/50",
				enlarged && "scale-110 z-10",
				"bg-secondary/50 backdrop-blur-sm",
				className,
			)}
			onClick={onClick}
		>
			<CardHeader className="p-3 pb-2">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1">
						<h3 className="font-semibold text-sm leading-tight text-balance">
							{card.name}
						</h3>
					</div>
					<Badge
						className={cn(
							"text-xs font-bold min-w-[28px] justify-center",
							typeColors[card.type],
						)}
					>
						{card.cost}
					</Badge>
				</div>
				<Badge variant="outline" className="w-fit text-xs">
					{card.type}
				</Badge>
			</CardHeader>
			<CardContent className="p-3 pt-2">
				<div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
					{card.image ? (
						<img
							src={card.image || "/placeholder.svg"}
							alt={card.name}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="text-4xl text-muted-foreground opacity-50">⏳</div>
					)}
				</div>
				<p className="text-xs text-muted-foreground leading-relaxed mb-2">
					{card.effect}
				</p>
				<div className="flex justify-between text-xs font-semibold">
					{card.attack !== undefined && (
						<span className="text-destructive">⚔️ {card.attack}</span>
					)}
					{card.defense !== undefined && (
						<span className="text-chart-3">🛡️ {card.defense}</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
