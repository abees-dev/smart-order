import axiosInstance from "@/utils/axios";
import type { LoginCredentials, User, AuthService } from "../types";

class AuthServiceImpl implements AuthService {
  async signInWithCredentials(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 401) {
          throw new Error("auth.invalidCredentials");
        }
      }
      throw new Error("common.error");
    }
  }

  async signInWithGoogle(): Promise<User> {
    // TODO: Implement Google sign-in
    throw new Error("Google sign-in not implemented yet");
  }

  async signInWithZalo(): Promise<User> {
    // TODO: Implement Zalo sign-in
    throw new Error("Zalo sign-in not implemented yet");
  }

  async signOut(): Promise<void> {
    try {
      await axiosInstance.post("/auth/logout");
      // Clear local storage or session
      localStorage.removeItem("auth_token");
    } catch {
      // Even if logout fails on server, clear local token
      localStorage.removeItem("auth_token");
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      const response = await axiosInstance.get("/auth/me");
      return response.data;
    } catch {
      localStorage.removeItem("auth_token");
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await axiosInstance.post("/auth/refresh");
      const newToken = response.data.token;
      localStorage.setItem("auth_token", newToken);
      return newToken;
    } catch {
      localStorage.removeItem("auth_token");
      return null;
    }
  }
}

export const authService = new AuthServiceImpl();
