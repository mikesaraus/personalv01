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
let diaryRef;

function firebaseGetAllDiary({ state, commit }) {
  try {
    const userId = this.state.firebase_auth.userDetails.userId;
    const q = query(
      collection(
        firebaseDb,
        collections.personal,
        userId,
        collections.personals.diary
      ),
      orderBy("timestamp")
    );
    diaryRef = onSnapshot(q, (snapshot) => {
      try {
        snapshot.docChanges().forEach((change) => {
          const diaryDetails = change.doc.data();
          const diaryId = change.doc.id;
          if (change.type === "added") {
            let index = state.diary.findIndex((t) => t.id == diaryId);
            if (index < 0) {
              commit("addUnshiftDiary", {
                id: diaryId,
                ...diaryDetails,
              });
            }
          }
          if (change.type === "modified") {
            commit("updateDiary", {
              id: diaryId,
              ...diaryDetails,
            });
          }
          if (change.type === "removed") {
            commit("removeDiary", {
              id: diaryId,
              ...diaryDetails,
            });
          }
        });
      } catch (error) {
        console.error("Diary Failure: ", error);
      }
    });
  } catch (error) {
    console.error("Diary Error: ", error);
  }
}

function firebaseStopGettingDiary({ commit }) {
  if (diaryRef) {
    diaryRef();
    commit("clearDiary");
  }
}

async function firebaseAddDiary({}, payload) {
  let result = {};
  const userId = this.state.firebase_auth.userDetails.userId;
  await addDoc(
    collection(
      firebaseDb,
      collections.personal,
      userId,
      collections.personals.diary
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

async function firebaseUpdateDiary({}, payload) {
  let result = {};
  if (payload.id) {
    const userId = this.state.firebase_auth.userDetails.userId;
    await updateDoc(
      doc(
        firebaseDb,
        collections.personal,
        userId,
        collections.personals.diary,
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
    result = { success: false, response: undefined };
  }
  return result;
}

async function firebaseDeleteDiary({}, payload) {
  let result = {};
  const userId = this.state.firebase_auth.userDetails.userId;
  await deleteDoc(
    doc(
      firebaseDb,
      collections.personal,
      userId,
      collections.personals.diary,
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

async function firebaseClearDiary({ dispatch }) {
  const userId = this.state.firebase_auth.userDetails.userId;
  const q = query(
    collection(
      firebaseDb,
      collections.personal,
      userId,
      collections.personals.diary
    ),
    orderBy("timestamp")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    dispatch("firebaseDeleteDiary", {
      id: doc.id,
    });
  });
}

export {
  firebaseGetAllDiary,
  firebaseStopGettingDiary,
  firebaseAddDiary,
  firebaseUpdateDiary,
  firebaseDeleteDiary,
  firebaseClearDiary,
};
