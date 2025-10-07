import type { Resources } from "@/constants";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission;
  isChangePasswordRequired?: boolean;
}

export type Permission = {
  [key in Resources]?: string[];
};

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthService {
  signInWithCredentials: (
    credentials: LoginCredentials
  ) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  refreshToken: () => Promise<RefreshTokenResponse>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}
