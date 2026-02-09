import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/auth";
import { Navigate, Outlet } from "react-router-dom";

interface IAuthGuardProps {
	isPrivate: boolean;
}

export function AuthGuard({ isPrivate }: IAuthGuardProps) {
	const { signedIn } = useAuth();

	if (signedIn && !isPrivate) {
		return <Navigate to={ROUTES.HUB} replace />;
	}

	if (!signedIn && isPrivate) {
		return <Navigate to={ROUTES.SIGNIN} replace />;
	}

	return <Outlet />;
}
