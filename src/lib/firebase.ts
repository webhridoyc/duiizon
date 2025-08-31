
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getMessaging, type Messaging } from "firebase/messaging";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration, read from environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Conditionally initialize services that require valid URLs and are not using placeholder values
let db: Database;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

// Check if the required environment variables are set and not the placeholder values
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY' && firebaseConfig.databaseURL && !firebaseConfig.databaseURL.includes('<YOUR-FIREBASE-PROJECT-ID>');

if (isConfigured) {
  if (firebaseConfig.databaseURL) {
    db = getDatabase(app);
  }

  if (firebaseConfig.storageBucket) {
    storage = getStorage(app);
  }

  if (typeof window !== 'undefined' && firebaseConfig.messagingSenderId) {
    messaging = getMessaging(app);
  }
}


export { app, auth, db, storage, messaging, googleProvider, facebookProvider, signInWithPopup, getAdditionalUserInfo };
