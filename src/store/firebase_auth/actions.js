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

function registerUser({}, payload) {
  createUserWithEmailAndPassword(firebaseAuth, payload.email, payload.password)
    .then((response) => {
      let userId = firebaseAuth.currentUser.uid;
      setDoc(doc(firebaseDb, collections.users, userId), {
        name: payload.name,
        email: payload.email,
        online: true,
        invisible: false,
        invitation_code: payload.invite,
      });
      return { success: true, response: response };
    })
    .catch((error) => {
      return { success: false, response: error };
    });
}

function loginUser({}, payload) {
  signInWithEmailAndPassword(firebaseAuth, payload.email, payload.password)
    .then((response) => {
      return { success: true, response: response };
    })
    .catch((error) => {
      return { success: false, response: error };
    });
}

function logoutUser() {
  signOut(firebaseAuth);
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
      dispatch("firebase_budget/firebaseGetAllTransactions", null, {
        root: true,
      });
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

function firebaseGetUsers({ commit }) {
  const q = query(collection(firebaseDb, collections.users));
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const userDetails = change.doc.data();
      const userId = change.doc.id;
      if (change.type === "added") {
        commit("addUser", { userId, userDetails });
      }
      if (change.type === "modified") {
        commit("updateUser", { userId, userDetails });
      }
      if (change.type === "removed") {
        commit("removeUser", { userId, userDetails });
      }
    });
  });
}

function firebaseUpdateUser({ commit }, payload) {
  if (payload.userId) {
    updateDoc(
      doc(firebaseDb, collections.users, payload.userId),
      payload.updates
    );
    if (payload.updateCurrentUser) {
      commit("updateCurrentUser", payload.updates);
    }
  }
}

export {
  registerUser,
  loginUser,
  logoutUser,
  firebaseGetUsers,
  firebaseUpdateUser,
  handleAuthStateChanged,
};
