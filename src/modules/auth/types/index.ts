import type { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
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

export type AuthProvider = "google" | "zalo";
