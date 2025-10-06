import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export function useAuthActions() {
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Force navigation even if logout fails
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  };

  const redirectToDashboard = () => {
    navigate(ROUTES.DASHBOARD.ROOT, { replace: true });
  };

  const redirectToLogin = () => {
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return {
    handleLogout,
    redirectToDashboard,
    redirectToLogin,
    isAuthenticated,
    user,
  };
}
