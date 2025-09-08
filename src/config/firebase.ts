import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC025zpofE17R993V5edngMKUA8886mVps",
  authDomain: "smart-order-be46f.firebaseapp.com",
  projectId: "smart-order-be46f",
  storageBucket: "smart-order-be46f.firebasestorage.app",
  messagingSenderId: "200046591062",
  appId: "1:200046591062:web:31d9b2d513c96768f74ff7",
  measurementId: "G-M5EPDGGCPG",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
