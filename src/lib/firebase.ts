import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  query, 
  where, 
  onSnapshot,
  Timestamp,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

// Silence transient connection retry warnings in iframe sandbox environments
setLogLevel('error');

// Support reading configuration from environment variables (e.g. VITE_FIREBASE_API_KEY)
// with graceful fallback for local/preview dev environments
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ai-studio-a40bab5b-897c-468d-a352-369a7b44d7a1',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:43904830812:web:axis',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForDevelopmentEnvironment',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ai-studio-a40bab5b-897c-468d-a352-369a7b44d7a1.firebaseapp.com',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// In Google Cloud Firestore, the primary instance is named '(default)'.
// If firestoreDatabaseId is an applet ID placeholder, '(default)', or empty,
// connect to standard default Firestore via initializeFirestore with long polling enabled.
function resolveFirestoreDb() {
  const customDbId = firebaseConfig.firestoreDatabaseId;
  const isDefaultInstance = 
    !customDbId || 
    customDbId === '(default)' || 
    customDbId === 'default' || 
    customDbId.startsWith('ai-studio-');

  const firestoreSettings = {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  };

  try {
    if (isDefaultInstance) {
      return initializeFirestore(app, firestoreSettings);
    }
    return initializeFirestore(app, firestoreSettings, customDbId);
  } catch {
    // If initializeFirestore was already called on this app instance, return existing getFirestore
    return isDefaultInstance ? getFirestore(app) : getFirestore(app, customDbId);
  }
}

export const db = resolveFirestoreDb();

// Primary Google Sign-In Provider (Standard Authentication)
// Prompt account selection and avoid requesting unverified sensitive scopes on initial login
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Dedicated Google Calendar Provider for explicit calendar linking
export const googleCalendarProvider = new GoogleAuthProvider();
googleCalendarProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleCalendarProvider.setCustomParameters({
  prompt: 'consent'
});

/**
 * Health check helper to test Firestore connectivity
 */
export async function testFirestoreConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const testRef = doc(db, '_connection_test', 'ping');
    await getDoc(testRef);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Database connection error' };
  }
}

export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
  updateDoc,
  deleteDoc,
  writeBatch
};
export type { User };
