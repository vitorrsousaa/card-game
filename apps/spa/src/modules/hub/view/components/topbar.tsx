import { Badge } from "@repo/ui/badge";
import { Separator } from "@repo/ui/separator";

interface TopBarProps {
	playerName?: string;
	coins?: number;
}

export function TopBar({
	playerName = "Chronomancer",
	coins = 1500,
}: TopBarProps) {
	return (
		<div className="bg-secondary/30 backdrop-blur-md border-b border-border px-6 py-3">
			<div className="flex items-center justify-between max-w-7xl mx-auto">
				<div className="flex items-center gap-4">
					<h1 className="text-lg font-bold text-primary">Chronomancers</h1>
					<Separator orientation="vertical" className="h-6" />
					<span className="text-sm text-muted-foreground">{playerName}</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						Chronal Crystals
					</span>
					<Badge className="bg-primary text-primary-foreground font-bold text-base px-3 py-1">
						{coins.toLocaleString()}
					</Badge>
				</div>
			</div>
		</div>
	);
}
