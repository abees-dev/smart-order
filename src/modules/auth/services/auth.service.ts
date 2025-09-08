import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import { userService } from "./user.service";
import type { User } from "../types";

class AuthService {
  // Convert Firebase User to our User type
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      providerId: firebaseUser.providerData[0]?.providerId || "unknown",
    };
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = this.mapFirebaseUser(result.user);

      // Create or update user document in Firestore using user service
      await userService.createOrUpdateUser(user);

      return user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw new Error("Failed to sign in with Google");
    }
  }

  // Sign in with Zalo (placeholder for future implementation)
  async signInWithZalo(): Promise<User> {
    // TODO: Implement Zalo authentication
    // This would require Zalo SDK integration
    throw new Error("Zalo authentication not implemented yet");
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      throw new Error("Failed to sign out");
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      const user = firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
      callback(user);
    });
  }

  // Get current user
  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
  }
}

export const authService = new AuthService();
