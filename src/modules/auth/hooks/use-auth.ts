import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { authService } from "../services/auth.service";
import type { AuthState, LoginCredentials, User } from "../types";

export function useAuth() {
  const { t } = useTranslation();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({ ...prev, user, loading: false, error: null }));
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setUser(null);
      }
    };

    initAuth();
  }, [setUser]);

  const signInWithCredentials = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setLoading(true);
        setError(null);

        const user = await authService.signInWithCredentials(credentials);
        setUser(user);

        return user;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? t(error.message) : t("common.error");
        setError(errorMessage);
        setLoading(false);
        throw error;
      }
    },
    [t, setError, setLoading, setUser]
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await authService.signInWithGoogle();
      setUser(user);

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? t(error.message) : t("common.error");
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, [t, setError, setLoading, setUser]);

  const signInWithZalo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await authService.signInWithZalo();
      setUser(user);

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? t(error.message) : t("common.error");
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, [t, setError, setLoading, setUser]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      // Always clear user state even if server request fails
      setUser(null);
    }
  }, [setLoading, setUser]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signInWithCredentials,
    signInWithGoogle,
    signInWithZalo,
    signOut,
    setError,
  };
}
