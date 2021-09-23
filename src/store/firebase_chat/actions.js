import { firebaseDb, myvar } from "src/boot/firebase";
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
let messagesRef;

function firebaseGetMessages({ state, commit }, payload) {
  try {
    const userId = this.state.firebase_auth.userDetails.userId;
    const q = query(
      collection(firebaseDb, collections.chats, userId, payload.otherUserId),
      orderBy("timestamp")
    );
    messagesRef = onSnapshot(q, (snapshot) => {
      try {
        snapshot.docChanges().forEach((change) => {
          const messageDetails = change.doc.data();
          const messageId = change.doc.id;
          if (change.type === "added") {
            myvar.messages.lastEvent = "added";
            if (!state.messages[messageId]) {
              commit("addMessage", { messageId, messageDetails });
            }
          }
          if (change.type === "modified") {
            myvar.messages.lastEvent = "modified";
            commit("updateMessage", { messageId, messageDetails });
          }
          if (change.type === "removed") {
            myvar.messages.lastEvent = "removed";
            commit("removeMessage", { messageId, messageDetails });
          }
        });
      } catch (error) {
        console.error("Chat Failure: ", error);
      }
    });
  } catch (error) {
    console.error("Chat Error: ", error);
  }
}

async function firebaseStopGettingMessages({ commit }) {
  let result = {};
  try {
    if (messagesRef) {
      await messagesRef();
      await commit("clearMessages");
      myvar.messages.lastEvent = null;
    }
    result = { success: true };
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function firebaseSendMessage({ dispatch }, payload) {
  let result = {};
  const userId = this.state.firebase_auth.userDetails.userId;
  await addDoc(
    // create document for sener
    collection(firebaseDb, collections.chats, userId, payload.otherUserId),
    payload.message,
    { merge: true }
  )
    .then(async (response) => {
      // add document for reciever with same id
      payload.message.from = "them";
      await setDoc(
        doc(
          firebaseDb,
          collections.chats,
          payload.otherUserId,
          userId,
          response.id
        ),
        payload.message,
        { merge: true }
      )
        .then(async () => {
          // add new message notification document for reciever
          dispatch(
            "firebase_notification/addNotification",
            {
              notifUser: payload.otherUserId,
              notifId: userId,
              notifType: collections.notifications.messages,
              notifDetails: {
                id: response.id,
                timestamp: payload.message.timestamp,
                type: payload.message.type,
              },
            },
            {
              root: true,
            }
          );
          result = { success: true };
        })
        .catch((error) => {
          result = { success: false, response: error };
        });
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
  return result;
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
    .then(async () => {
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
          .then(() => {
            result = { success: true };
          })
          .catch((error) => {
            result = { success: false, response: error };
          });
      } else {
        result = { success: true };
      }
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
  return result;
}

async function firebaseClearChats({ dispatch }, otherUserId) {
  let result = {};
  try {
    const userId = this.state.firebase_auth.userDetails.userId;
    const q = query(
      collection(firebaseDb, collections.chats, userId, otherUserId),
      orderBy("timestamp")
    );
    await getDocs(q)
      .then((querySnapshot) => {
        let errorCount = 0;
        querySnapshot.forEach(async (doc) => {
          await dispatch("firebaseDeleteMessage", {
            otherUserId: otherUserId,
            messageId: doc.id,
          })
            .then((res) => {
              if (!res.success) {
                errorCount++;
              }
            })
            .catch(() => {
              errorCount++;
            });
        });
        dispatch(
          "firebase_notification/deleteNotificationData",
          {
            notifUser: userId,
            notifId: otherUserId,
            notifType: collections.notifications.messages,
            deleteKey: true,
          },
          {
            root: true,
          }
        );
        if (errorCount === 0) {
          result = { success: true, response: querySnapshot };
        } else {
          result = { success: false, response: { errorCount, querySnapshot } };
        }
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

export {
  firebaseGetMessages,
  firebaseStopGettingMessages,
  firebaseSendMessage,
  firebaseDeleteMessage,
  firebaseClearChats,
};
