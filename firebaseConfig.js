import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBS1z0lOKegocsVi9ESkCLv07HNEui0jkc",
  authDomain: "ecoappfirebase-f71da.firebaseapp.com",
  projectId: "ecoappfirebase-f71da",
  storageBucket: "ecoappfirebase-f71da.appspot.com",
  messagingSenderId: "712952443362",
  appId: "1:712952443362:web:bd724eade0e2907a2149bb",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

