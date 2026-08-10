// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0qF34Y7g0uDLcYzfyYQLMlrc7hEmVh1s",
  authDomain: "truth-eff4b.firebaseapp.com",
  projectId: "truth-eff4b",
  storageBucket: "truth-eff4b.firebasestorage.app",
  messagingSenderId: "1034987300196",
  appId: "1:1034987300196:web:1f732f7deda28a7993c671",
  measurementId: "G-2SVYWK7GXV"
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const firestore_app_client = getFirestore();