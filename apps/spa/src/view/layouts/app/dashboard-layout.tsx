import { Outlet } from "react-router-dom";

export function DashboardLayout() {
	return (
		<div className="flex flex-1 flex-col min-h-0 overflow-hidden">
			<Outlet />
		</div>
	);
}
