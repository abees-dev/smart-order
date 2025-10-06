import type { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  username: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
}

export interface UserDocument extends User {
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export type AuthProvider = "credentials" | "google" | "zalo";

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

export interface AuthService {
  signInWithCredentials: (
    credentials: LoginCredentials
  ) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signInWithZalo: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  refreshToken: () => Promise<RefreshTokenResponse>;
}
