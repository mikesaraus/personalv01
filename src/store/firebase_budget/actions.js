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
    collection(
      firebaseDb,
      collections.budget,
      userId,
      collections.budget_transactions
    ),
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

async function firebaseAddTransaction({}, payload) {
  let result = {};
  const userId = this.state.firebase_auth.userDetails.userId;
  await addDoc(
    collection(
      firebaseDb,
      collections.budget,
      userId,
      collections.budget_transactions
    ),
    payload,
    { merge: true }
  )
    .then((response) => {
      result = { success: true, response: response };
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
  return result;
}

async function firebaseUpdateTransaction({}, payload) {
  let result = {};
  if (payload.id) {
    const userId = this.state.firebase_auth.userDetails.userId;
    await updateDoc(
      doc(
        firebaseDb,
        collections.budget,
        userId,
        collections.budget_transactions,
        payload.id
      ),
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

async function firebaseDeleteTransaction({}, payload) {
  let result = {};
  const userId = this.state.firebase_auth.userDetails.userId;
  await deleteDoc(
    doc(
      firebaseDb,
      collections.budget,
      userId,
      collections.budget_transactions,
      payload.id
    )
  )
    .then((response) => {
      result = { success: true, response: response };
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
  return result;
}

async function firebaseClearTransactions({ dispatch }) {
  const userId = this.state.firebase_auth.userDetails.userId;
  const q = query(
    collection(
      firebaseDb,
      collections.budget,
      userId,
      collections.budget_transactions
    ),
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
