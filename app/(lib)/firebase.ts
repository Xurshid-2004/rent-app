import { initializeApp, getApp, getApps } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtHbMJHDf7BO8a8bty9gV9WYBZ0vCRx3k",
  authDomain: "project2-24aae.firebaseapp.com",
  projectId: "project2-24aae",
  storageBucket: "project2-24aae.firebasestorage.app",
  messagingSenderId: "288441970068",
  appId: "1:288441970068:web:3b5069e5fa0f510e8cb381",
  measurementId: "G-PZJ1PEF4PQ",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence for better UX
import { enableIndexedDbPersistence } from "firebase/firestore";

if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // ignore
  });

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firestore persistence: Multiple tabs detected');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support persistence
      console.warn('Firestore persistence: Browser not supported');
    }
  });
}
