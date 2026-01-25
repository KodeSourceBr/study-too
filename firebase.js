import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration & Init ---
const firebaseConfig = {
  apiKey: "AIzaSyDqupzdz6xyF48QkoUVLwN6ukv98vehe8c",
  authDomain: "study2-aab52.firebaseapp.com",
  projectId: "study2-aab52",
  storageBucket: "study2-aab52.firebasestorage.app",
  messagingSenderId: "823672008275",
  appId: "1:823672008275:web:2619446d48d1c4b13a20a6",
  measurementId: "G-F7XR0CXTXT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.appId;

export { auth, db, appId };