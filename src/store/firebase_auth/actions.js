import { firebaseAuth, firebaseDb } from "src/boot/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  query,
  onSnapshot,
} from "firebase/firestore";
import { collections } from "../firebase_config";
import state from "./state";
let usersRef;

async function registerUser({}, payload) {
  let result = {};
  await createUserWithEmailAndPassword(
    firebaseAuth,
    payload.email,
    payload.password
  )
    .then((response) => {
      let userId = firebaseAuth.currentUser.uid;
      setDoc(doc(firebaseDb, collections.users, userId), {
        name: payload.name,
        email: payload.email,
        online: true,
        invisible: false,
        invitation_code: payload.invite,
      });
      result = { success: true, response: response };
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
  return result;
}

async function loginUser({}, payload) {
  let result = {};
  await signInWithEmailAndPassword(
    firebaseAuth,
    payload.email,
    payload.password
  )
    .then((response) => {
      result = { success: true, response: response };
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
  return result;
}

async function logoutUser() {
  let result = {};
  await signOut(firebaseAuth)
    .then((response) => {
      result = { success: true, response: response };
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
  return result;
}

function handleAuthStateChanged({ commit, dispatch, state }) {
  onAuthStateChanged(firebaseAuth, async (user) => {
    if (user) {
      let userId = firebaseAuth.currentUser.uid;
      let usr = await getDoc(doc(firebaseDb, collections.users, userId));
      if (usr.exists()) {
        await commit("setUserDetails", {
          ...usr.data(),
          userId: userId,
        });
      }
      dispatch("firebaseUpdateUser", {
        userId: userId,
        updates: {
          online: true,
        },
      });
      dispatch("firebaseGetUsers");
      dispatch("firebase_diary/firebaseGetAllDiary", null, {
        root: true,
      });
      dispatch("firebase_budget/firebaseGetAllTransactions", null, {
        root: true,
      });
      if (this.$router.currentRoute.value.fullPath == "/")
        this.$router.push("/budget");
    } else {
      dispatch("firebaseUpdateUser", {
        userId: state.userDetails.userId,
        updates: {
          online: false,
        },
      });
      commit("setUserDetails", {});
      this.$router.replace("/");
    }
  });
}

function firebaseGetUsers({ state, commit }) {
  const q = query(collection(firebaseDb, collections.users));
  usersRef = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const userDetails = change.doc.data();
      const userId = change.doc.id;
      if (change.type === "added") {
        commit("addUser", { userId, userDetails });
      }
      if (change.type === "modified") {
        commit("updateUser", { userId, userDetails });
        if (userId === state.userDetails.userId) {
          commit("setUserDetails", {
            ...userDetails,
            userId: userId,
          });
        }
      }
      if (change.type === "removed") {
        commit("removeUser", { userId, userDetails });
      }
    });
  });
}

function firebaseStopGettingUsers({ commit }) {
  if (usersRef) {
    usersRef();
    commit("clearUser");
  }
}

async function firebaseUpdateUser({}, payload) {
  let result = {};
  if (payload.userId) {
    await updateDoc(
      doc(firebaseDb, collections.users, payload.userId),
      payload.updates
    )
      .then((response) => {
        result = { success: true, response: response };
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } else {
    result = { success: false, response: undefined };
  }
  return result;
}

export {
  registerUser,
  loginUser,
  logoutUser,
  firebaseGetUsers,
  firebaseUpdateUser,
  handleAuthStateChanged,
  firebaseStopGettingUsers,
};
