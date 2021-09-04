import { firebaseDb } from "src/boot/firebase";
import {
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { collections } from "../firebase_config";
let transactionsRef;

function firebaseGetAllTransactions({ commit }) {
  const userId = this.state.firebase_auth.userDetails.userId;
  const q = query(
    collection(firebaseDb, collections.budget, userId, "transactions"),
    orderBy("timestamp")
  );
  transactionsRef = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const transactionDetails = change.doc.data();
      const transactionId = change.doc.id;
      if (change.type === "added") {
        commit("addUnshiftTransactions", {
          id: transactionId,
          ...transactionDetails,
        });
      }
      if (change.type === "modified") {
        commit("updateTransaction", {
          id: transactionId,
          ...transactionDetails,
        });
      }
      if (change.type === "removed") {
        commit("removeTransaction", {
          id: transactionId,
          ...transactionDetails,
        });
      }
    });
  });
}

function firebaseStopGettingTransactions({ commit }) {
  if (transactionsRef) {
    transactionsRef();
    commit("clearTransactions");
  }
}

function firebaseAddTransaction({}, payload) {
  const userId = this.state.firebase_auth.userDetails.userId;
  const myDoc = addDoc(
    collection(firebaseDb, collections.budget, userId, "transactions"),
    payload,
    { merge: true }
  )
    .then((result) => {
      return true;
    })
    .catch((error) => {
      return false;
    });
}

function firebaseUpdateTransaction({}, payload) {
  if (payload.id) {
    const userId = this.state.firebase_auth.userDetails.userId;
    updateDoc(
      doc(firebaseDb, collections.budget, userId, "transactions", payload.id),
      payload.updates
    );
  }
}

function firebaseDeleteTransaction({}, payload) {
  const userId = this.state.firebase_auth.userDetails.userId;
  deleteDoc(
    doc(firebaseDb, collections.budget, userId, "transactions", payload.id)
  )
    .then((result) => {
      return true;
    })
    .catch((error) => {
      return false;
    });
}

async function firebaseClearTransactions({ dispatch }) {
  const userId = this.state.firebase_auth.userDetails.userId;
  const q = query(
    collection(firebaseDb, collections.budget, userId, "transactions"),
    orderBy("timestamp")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    dispatch("firebaseDeleteTransaction", {
      id: doc.id,
    });
  });
}

export {
  firebaseGetAllTransactions,
  firebaseStopGettingTransactions,
  firebaseAddTransaction,
  firebaseUpdateTransaction,
  firebaseDeleteTransaction,
  firebaseClearTransactions,
};
