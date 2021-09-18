import { boot } from "quasar/wrappers";
import { initializeApp } from "firebase/app";
import { getFirestore, refEqual } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { reactive } from "vue";

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

const myvar = reactive({
  localStorage: {
    userDetails: "userDetails",
  },
  route: {
    defaultAfterLogin: "/chat",
  },
  router: {
    auth: "/",
    chat: "/chat",
    budget: "/budget",
    diary: "/diary",
  },
  messages: {
    todelete: [],
  },
  test: {
    text: "Hello, friend.",
    bug: `
A bug is never just a mistake.
It represents something bigger.
An error of thinking.
That makes you who you are.
    `,
  },
});

export default boot(({ app }) => {
  app.config.globalProperties.$myvar = myvar;
});

export { firebaseApp, firebaseAuth, firebaseDb, myvar };
