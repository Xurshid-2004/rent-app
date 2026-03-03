import { initializeApp, getApp, getApps } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // ignore
  });
}
