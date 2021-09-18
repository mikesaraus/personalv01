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

function firebaseGetAllTransactions({ state, commit }) {
  const userId = this.state.firebase_auth.userDetails.userId;
  const q = query(
    collection(
      firebaseDb,
      collections.personal,
      userId,
      collections.personals.budget
    ),
    orderBy("timestamp")
  );
  transactionsRef = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const transactionDetails = change.doc.data();
      const transactionId = change.doc.id;
      if (change.type === "added") {
        let index = state.transactions.findIndex((t) => t.id == transactionId);
        if (index < 0) {
          commit("addUnshiftTransactions", {
            id: transactionId,
            ...transactionDetails,
          });
        }
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
      collections.personal,
      userId,
      collections.personals.budget
    ),
    payload,
    { merge: true }
  )
    .then(() => {
      result = { success: true };
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
        collections.personal,
        userId,
        collections.personals.budget,
        payload.id
      ),
      payload.updates
    )
      .then(() => {
        result = { success: true };
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } else {
    result = { success: false };
  }
  return result;
}

async function firebaseDeleteTransaction({}, payload) {
  let result = {};
  const userId = this.state.firebase_auth.userDetails.userId;
  await deleteDoc(
    doc(
      firebaseDb,
      collections.personal,
      userId,
      collections.personals.budget,
      payload.id
    )
  )
    .then(() => {
      result = { success: true };
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
      collections.personal,
      userId,
      collections.personals.budget
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
