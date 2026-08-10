import { firestore_app_client } from "./firebase_init_client.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

export async function getFirestoreDoc(collectionName, docId) {
  const snapshot = await getDoc(doc(firestore_app_client, collectionName, docId));
  if (!snapshot.exists()) {
    console.warn(`Firestore document not found: ${collectionName}/${docId}`);
    return null;
  }
  return snapshot.data();
}
