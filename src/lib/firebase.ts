import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCHTwMQ9RAIm_OqmnPIhp1Oxgz_Dyjgq3A',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'tam-ra-ya.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'tam-ra-ya',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'tam-ra-ya.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '864127985838',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:864127985838:web:f8e76415444dc7ed54a53f',
};

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export const auth = getAuth(app);
export const storage = getStorage(app);
