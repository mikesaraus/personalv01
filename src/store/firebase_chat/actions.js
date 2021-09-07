import { firebaseDb } from "src/boot/firebase";
import {
  doc,
  deleteDoc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { collections } from "../firebase_config";
import { date } from "quasar";
let messagesRef;

function firebaseGetMessages({ state, commit, dispatch }, payload) {
  const userId = this.state.firebase_auth.userDetails.userId;
  const q = query(
    collection(firebaseDb, collections.chats, userId, payload.otherUserId),
    orderBy("timestamp")
  );
  messagesRef = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const messageDetails = change.doc.data();
      const messageId = change.doc.id;
      const lessThan5Mins =
        date.getDateDiff(
          Date.now(),
          new Date(messageDetails.timestamp),
          "minutes"
        ) < 1;
      const sendNotif =
        lessThan5Mins &&
        messageDetails.from !== "me" &&
        snapshot._cachedChanges.length === 1;
      if (change.type === "added") {
        if (!state.messages[messageId]) {
          commit("addMessage", { messageId, messageDetails });
          if (sendNotif)
            dispatch("messageNotification", {
              audioSrc: payload.audioSrc,
            });
        }
      }
      if (change.type === "modified") {
        commit("updateMessage", { messageId, messageDetails });
        if (sendNotif)
          dispatch("messageNotification", {
            audioSrc: payload.audioSrc,
          });
      }
      if (change.type === "removed") {
        commit("removeMessage", { messageId, messageDetails });
      }
    });
  });
}

function messageNotification({}, payload) {
  var audio = new Audio(payload.audioSrc);
  audio.play();
}

function firebaseStopGettingMessages({ commit }) {
  if (messagesRef) {
    messagesRef();
    commit("clearMessages");
  }
}

async function firebaseSendMessage({}, payload) {
  let result = {};
  const userId = this.state.firebase_auth.userDetails.userId;
  const myDoc = await addDoc(
    collection(firebaseDb, collections.chats, userId, payload.otherUserId),
    payload.message,
    { merge: true }
  )
    .then((response) => {
      payload.message.from = "them";
      setDoc(
        doc(
          firebaseDb,
          collections.chats,
          payload.otherUserId,
          userId,
          myDoc.id
        ),
        payload.message,
        { merge: true }
      )
        .then((response2) => {
          result = { success: true, response: response2 };
        })
        .catch((error) => {
          result = { success: false, response: error };
        });
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
}

async function firebaseDeleteMessage({}, payload) {
  let result = {};
  const userId = this.state.firebase_auth.userDetails.userId;
  await deleteDoc(
    doc(
      firebaseDb,
      collections.chats,
      userId,
      payload.otherUserId,
      payload.messageId
    )
  )
    .then(async (response) => {
      if (payload.deleteForEveryone) {
        await deleteDoc(
          doc(
            firebaseDb,
            collections.chats,
            payload.otherUserId,
            userId,
            payload.messageId
          )
        )
          .then((response2) => {
            result = { success: true, response: response2 };
          })
          .catch((error) => {
            result = { success: false, response: error };
          });
      } else {
        result = { success: true, response: response };
      }
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
  return result;
}

async function firebaseClearChats({ dispatch }, otherUserId) {
  const userId = this.state.firebase_auth.userDetails.userId;
  const q = query(
    collection(firebaseDb, collections.chats, userId, otherUserId),
    orderBy("timestamp")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    dispatch("firebaseDeleteMessage", {
      otherUserId: otherUserId,
      messageId: doc.id,
    });
  });
}

export {
  firebaseGetMessages,
  firebaseStopGettingMessages,
  firebaseSendMessage,
  firebaseDeleteMessage,
  firebaseClearChats,
  messageNotification,
};
