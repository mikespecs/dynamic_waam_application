import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0qF34Y7g0uDLcYzfyYQLMlrc7hEmVh1s",
  authDomain: "truth-eff4b.firebaseapp.com",
  projectId: "truth-eff4b",
  storageBucket: "truth-eff4b.firebasestorage.app",
  messagingSenderId: "1034987300196",
  appId: "1:1034987300196:web:1f732f7deda28a7993c671",
  measurementId: "G-2SVYWK7GXV"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const snapshot = await getDoc(doc(firestore, 'components', 'D9fH6d0bmiEy7ywdrsko'));
console.log('components_collection returned:', snapshot.exists() ? snapshot.data() : null);



