// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const databaseId = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_ID || '(default)';
export const db = getFirestore(app, databaseId);

// Log para verificar qué base de datos está usando
console.log('🔥 Firebase Firestore Database ID configurado:', databaseId);
console.log('🔥 Variable de entorno EXPO_PUBLIC_FIREBASE_DATABASE_ID:', process.env.EXPO_PUBLIC_FIREBASE_DATABASE_ID);