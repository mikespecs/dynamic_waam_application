import { firestore_app_client } from "./firebase_init_client.js";
import { setDoc, getDoc, doc } from "firebase/firestore";


function getFirestoreDoc(collectionName, docId) {

    getDoc(doc(firestore_app_client, collectionName, docId)).then((snapshot) => {
    if (snapshot.exists()) {
        console.log(snapshot.data());
    }
});
}

export default getFirestoreDoc;