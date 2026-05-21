import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { firebaseConfig } from "./firebase-config";

const firebaseApp = initializeApp(firebaseConfig);
export const messaging = getMessaging(firebaseApp);
