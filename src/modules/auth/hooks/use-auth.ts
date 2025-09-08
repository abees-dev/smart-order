import { useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import type { AuthState } from "../types";

export function useAuth(): AuthState & {
  signInWithGoogle: () => Promise<void>;
  signInWithZalo: () => Promise<void>;
  signOut: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setState({
        user,
        loading: false,
        error: null,
      });
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await authService.signInWithGoogle();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      }));
    }
  };

  const signInWithZalo = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await authService.signInWithZalo();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      }));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await authService.signOut();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Sign out failed",
      }));
    }
  };

  return {
    ...state,
    signInWithGoogle,
    signInWithZalo,
    signOut,
  };
}
