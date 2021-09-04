import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase App Config
var firebaseConfig = {
  apiKey: "AIzaSyCm_MVIcvUSjCkAyX4OrqacY7B75nImGRM",
  authDomain: "personalv01.firebaseapp.com",
  projectId: "personalv01",
  storageBucket: "personalv01.appspot.com",
  messagingSenderId: "697787484725",
  appId: "1:697787484725:web:b8e5bf709113ee5078ff7c",
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getFirestore(firebaseApp);

export { firebaseApp, firebaseAuth, firebaseDb };
