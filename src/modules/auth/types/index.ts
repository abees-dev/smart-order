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

export interface AuthService {
  signInWithCredentials: (credentials: LoginCredentials) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithZalo: () => Promise<User>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}
