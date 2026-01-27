import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * 
 * INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or use the same project as backend
 * 3. In Project settings > General > Your apps, add a Web app
 * 4. Register the app with a nickname and copy the configuration
 * 5. Replace the firebaseConfig object below with your configuration
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyiHjZWUuMmdsWe9iqbDalW-bS6Sjgdcw",
  authDomain: "doctors-cc7b6.firebaseapp.com",
  projectId: "doctors-cc7b6",
  storageBucket: "doctors-cc7b6.firebasestorage.app",
  messagingSenderId: "750842135688",
  appId: "1:750842135688:web:d059642c7252b2718bcb3d",
  measurementId: "G-KXJK0PEY1H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 