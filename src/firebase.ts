import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase project configuration
// You can find this in your Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyBm0BWG3FZEynpteh-vpkOna8_1QznP5jU",
  authDomain: "guiamediacion.firebaseapp.com",
  projectId: "guiamediacion",
  storageBucket: "guiamediacion.firebasestorage.app",
  messagingSenderId: "994923491713",
  appId: "1:994923491713:web:17e69c5c45d2aadd723880"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
