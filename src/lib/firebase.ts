
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { validateEnv } from "./env";

// Get environment variables
const env = validateEnv();

// Set up Firebase config based on environment
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = initializeFirestore(app, {});
export const auth = getAuth(app);

// Set auth persistence to session to avoid issues with redirects
// This ensures auth state is maintained during redirects
console.log('Setting up Firebase auth persistence');
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('Firebase auth persistence set to browserSessionPersistence');
  })
  .catch(error => {
    console.error("Error setting auth persistence:", error);
  });

// Initialize analytics conditionally
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;
