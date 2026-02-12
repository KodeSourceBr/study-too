import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration & Init ---
const firebaseConfig = {
  apiKey: "AIzaSyDbICaZQ0T7I6fQm5uj_IK7xe9hrDKwZ3U",
  authDomain: "studytoo-d2b52.firebaseapp.com",
  projectId: "studytoo-d2b52",
  storageBucket: "studytoo-d2b52.firebasestorage.app",
  messagingSenderId: "719127733941",
  appId: "1:719127733941:web:5fad30dff96e7a5e3840fc",
  measurementId: "G-41RXMXS93B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.appId;

export { auth, db, appId };