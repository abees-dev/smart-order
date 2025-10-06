import axiosInstance from "@/utils/axios";
import type {
  LoginCredentials,
  User,
  AuthService,
  AuthResponse,
  RefreshTokenResponse,
} from "../types";

class AuthServiceImpl implements AuthService {
  async signInWithCredentials(
    credentials: LoginCredentials
  ): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response as unknown as AuthResponse;
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
      return response as unknown as User;
    } catch {
      localStorage.removeItem("auth_token");
      return null;
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const response = await axiosInstance.post("/auth/refresh");
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("auth_token", accessToken);
      return { accessToken, refreshToken };
    } catch {
      localStorage.removeItem("auth_token");
      throw new Error("Token refresh failed");
    }
  }
}

export const authService = new AuthServiceImpl();
