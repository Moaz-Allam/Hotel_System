import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJZ0PyOjScPutLhI5TJPZDGRKv7tSrCos",
  authDomain: "admin-app-181a3.firebaseapp.com",
  projectId: "admin-app-181a3",
  storageBucket: "admin-app-181a3.appspot.com",
  messagingSenderId: "277178366814",
  appId: "1:277178366814:web:38bab0b17fe6040855edcf",
  measurementId: "G-RQHNFKC0M4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
