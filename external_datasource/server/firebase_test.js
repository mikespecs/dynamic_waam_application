import {firestore_app_client} from '../client/firebase_init_client.js';
import getFirestoreDoc from '../client/firestore_client_db_proc.js';
import v8 from 'v8';

console.log(v8.getHeapSnapshot());
console.log("components_collection returned: ", await getFirestoreDoc("components", "D9fH6d0bmiEy7ywdrsko"));



