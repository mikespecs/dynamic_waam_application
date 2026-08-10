// Import Firebase browser modules via CDN-compatible ESM specifiers
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0qF34Y7g0uDLcYzfyYQLMlrc7hEmVh1s",
  authDomain: "truth-eff4b.firebaseapp.com",
  projectId: "truth-eff4b",
  storageBucket: "truth-eff4b.firebasestorage.app",
  messagingSenderId: "1034987300196",
  appId: "1:1034987300196:web:1f732f7deda28a7993c671",
  measurementId: "G-2SVYWK7GXV"
};

const firebaseApp = initializeApp(firebaseConfig);
export const firestore_app_client = getFirestore(firebaseApp);