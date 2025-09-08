import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { User, UserDocument } from "../types";

class UserService {
  // Create or update user document in Firestore
  async createOrUpdateUser(user: User): Promise<void> {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerId: user.providerId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
        });
        console.log("New user document created:", user.uid);
      } else {
        // Update existing user document with latest info
        await setDoc(
          userDocRef,
          {
            displayName: user.displayName,
            photoURL: user.photoURL,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log("User document updated:", user.uid);
      }
    } catch (error) {
      console.error("Error creating/updating user document:", error);
      throw new Error("Failed to save user data");
    }
  }

  // Get user document from Firestore
  async getUserDocument(uid: string): Promise<UserDocument | null> {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data() as UserDocument;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user document:", error);
      throw new Error("Failed to fetch user data");
    }
  }

  // Check if user exists in Firestore
  async userExists(uid: string): Promise<boolean> {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  // Update user status (active/inactive)
  async updateUserStatus(uid: string, isActive: boolean): Promise<void> {
    try {
      const userDocRef = doc(db, "users", uid);
      await setDoc(
        userDocRef,
        {
          isActive,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`User status updated: ${uid} - Active: ${isActive}`);
    } catch (error) {
      console.error("Error updating user status:", error);
      throw new Error("Failed to update user status");
    }
  }
}

export const userService = new UserService();
