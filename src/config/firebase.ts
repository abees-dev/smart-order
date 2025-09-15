import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  CACHE_SIZE_UNLIMITED,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC025zpofE17R993V5edngMKUA8886mVps",
  authDomain: "smart-order-be46f.firebaseapp.com",
  projectId: "smart-order-be46f",
  storageBucket: "smart-order-be46f.firebasestorage.app",
  messagingSenderId: "200046591062",
  appId: "1:200046591062:web:31d9b2d513c96768f74ff7",
  measurementId: "G-M5EPDGGCPG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore with optimized caching
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    tabManager: persistentMultipleTabManager(),
  }),
});

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
googleProvider.addScope("email");
googleProvider.addScope("profile");

export { auth, db, googleProvider };
