import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/modules/auth/services/auth.service";
import type { User } from "@/modules/auth/types";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => {
        const currentUser = get().user;
        const newUser =
          currentUser && user
            ? ({
                ...currentUser,
                ...user,
              } as User)
            : user;
        set({
          user: newUser,
          isAuthenticated: !!newUser,
          error: null,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
        });

        // Update localStorage for backward compatibility
        if (accessToken) {
          localStorage.setItem("auth_token", accessToken);
        } else {
          localStorage.removeItem("auth_token");
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: async (credentials) => {
        const { setLoading, setError, setUser, setTokens } = get();

        try {
          setLoading(true);
          setError(null);

          const response = await authService.signInWithCredentials(credentials);

          // Extract user data and tokens from response
          const { user, accessToken, refreshToken } = response;

          setUser(user);
          setTokens(accessToken, refreshToken);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Đăng nhập thất bại";
          setError(message);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      logout: async () => {
        const { setLoading, clearAuth } = get();

        try {
          setLoading(true);
          await authService.signOut();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          clearAuth();
          setLoading(false);
        }
      },

      refreshAccessToken: async () => {
        try {
          const response = await authService.refreshToken();
          get().setTokens(response.accessToken, response.refreshToken);
          return true;
        } catch (error) {
          console.error("Token refresh failed:", error);
          get().clearAuth();
          return false;
        }
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem("auth_token");
      },

      checkAuth: async () => {
        const { setLoading, setUser, setError, accessToken } = get();

        if (!accessToken) {
          return;
        }

        try {
          setLoading(true);
          const user = await authService.getCurrentUser();
          if (user) {
            setUser(user);
          } else {
            get().clearAuth();
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          setError("Phiên đăng nhập đã hết hạn");
          get().clearAuth();
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: "smart-order-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
