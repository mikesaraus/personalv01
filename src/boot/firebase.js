import { boot } from "quasar/wrappers";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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

let myvar = reactive({
  localStorage: {
    userDetails: "userDetails",
  },
  default: {
    message: "Hello, friend.",
    bug: `
A bug is never just a mistake.
It represents something bigger.
An error of thinking.
That makes you who you are.
    `,
    out_message: "Goodbye, friend!",
  },
  router: {
    default: {},
    auth: {
      url: "/",
      title: "Hello, friend.",
      tooltip: "Auth",
    },
    chat: {
      url: "/chat",
      title: "Private Chat",
      tooltip: "Chat",
    },
    budget: {
      url: "/budget",
      title: "Accounting",
      tooltip: "Budget",
    },
    diary: {
      url: "/diary",
      title: "Life Events",
      tooltip: "Diary",
    },
  },
  messages: {
    type: {
      text: "text",
      encrypted: "encrypted",
      autodelete: "autodelete",
      encrypted_autodelete: "encrypted_autodelete",
    },
    lastEvent: null,
    todelete: [],
  },
  audio: { notification: new Audio("notification.mp3") },
});

// Set Default URL After Login
myvar.router.default.afterLogin = myvar.router.chat;

export default boot(({ app }) => {
  app.config.globalProperties.$myvar = myvar;
});

export { firebaseApp, firebaseAuth, firebaseDb, myvar };
