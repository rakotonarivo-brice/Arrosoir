// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
  apiKey: "AIzaSyDj6Wq9voYM4hPK64keJ_RGM-OesENEuV0",
  authDomain: "arrosoir-9f05e.firebaseapp.com",
  projectId: "arrosoir-9f05e",
  storageBucket: "arrosoir-9f05e.appspot.com",
  messagingSenderId: "662412882476",
  appId: "1:662412882476:web:34e3c8c03c4a3c00501789",
  measurementId: "G-PWSQM69X2V",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage }
