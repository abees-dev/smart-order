import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import Loading from "@/components/ui/loading";
import { ROUTES } from "@/constants/routes";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (
    isAuthenticated &&
    user?.isChangePasswordRequired &&
    location.pathname !== ROUTES.AUTH.CHANGE_PASSWORD
  ) {
    return (
      <Navigate
        to={ROUTES.AUTH.CHANGE_PASSWORD}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}

interface PublicGuardProps {
  children: React.ReactNode;
}

export function PublicGuard({ children }: PublicGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (isAuthenticated) {
    // If user is authenticated, redirect to dashboard or the intended page
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD.ROOT;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
