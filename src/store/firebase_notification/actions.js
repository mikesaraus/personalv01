import { firebaseDb, myvar } from "src/boot/firebase";
import {
  doc,
  deleteDoc,
  collection,
  query,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  deleteField,
  arrayRemove,
} from "firebase/firestore";
import { collections } from "../firebase_config";
let notificationsRef;

function firebaseGetNotifications({ commit, dispatch, getters }, payload) {
  try {
    const userId = this.state.firebase_auth.userDetails.userId;
    const q = query(
      collection(
        firebaseDb,
        collections.personal,
        userId,
        collections.personals.notifications
      )
    );
    notificationsRef = onSnapshot(q, (snapshot) => {
      try {
        snapshot.docChanges().forEach((change) => {
          let details = change.doc.data();
          const notifId = change.doc.id;
          if (change.type === "added") {
            // Check Notifications
            Object.keys(details).forEach((key) => {
              // Check Notif Type
              switch (notifId) {
                case collections.notifications.messages:
                  // Check Message Notif
                  if (
                    (details[key] &&
                      details[key].length &&
                      !getters.notifMessages[key]) ||
                    (details[key] &&
                      details[key].length &&
                      details[key].length > getters.notifMessages[key].length)
                  ) {
                    // Possible New Data - Notify
                    dispatch(
                      "alertNotification",
                      payload ? payload.audio : null
                    );
                  }
                  break;
                default:
                  break;
              }
            });
            commit("addNotifications", { notifId, details });
          }
          if (change.type === "modified") {
            // Check Notifications
            Object.keys(details).forEach((key) => {
              // Check Notif Type
              switch (notifId) {
                case collections.notifications.messages:
                  // Check Message Notif
                  if (
                    (details[key] &&
                      details[key].length &&
                      !getters.notifMessages[key]) ||
                    (details[key] &&
                      details[key].length &&
                      details[key].length > getters.notifMessages[key].length)
                  ) {
                    // Possible New Data - Notify
                    dispatch(
                      "alertNotification",
                      payload ? payload.audio : null
                    );
                  }
                  break;
                default:
                  break;
              }
            });
            commit("updateNotifications", { notifId, details });
          }
          if (change.type === "removed") {
            commit("removeNotifications", { notifId, details });
          }
        });
      } catch (error) {
        console.error("Notification Failure: ", error);
      }
    });
  } catch (error) {
    console.error("Notification Error: ", error);
  }
}

function alertNotification({}, audio) {
  let result = {};
  try {
    const notifAudio = audio ? audio : myvar.audio.notification;
    notifAudio.play();
    result = { success: true };
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function updateNotification({}, payload) {
  let result = {};
  try {
    await setDoc(
      doc(
        firebaseDb,
        collections.personal,
        payload.notifUser,
        collections.personals.notifications,
        payload.notifType
      ),
      payload.notifUpdates,
      { merge: true }
    )
      .then(() => {
        result = { success: true };
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function addNotification({}, payload) {
  let result = {};
  try {
    await setDoc(
      doc(
        firebaseDb,
        collections.personal,
        payload.notifUser,
        collections.personals.notifications,
        payload.notifType
      ),
      {
        [payload.notifId]: arrayUnion(payload.notifDetails),
      },
      { merge: true }
    )
      .then(() => {
        result = { success: true };
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function deleteNotification({}, payload) {
  let result = {};
  try {
    await deleteDoc(
      doc(
        firebaseDb,
        collections.personal,
        payload.notifUser,
        collections.personals.notifications,
        payload.notifType
      )
    )
      .then(() => {
        result = { success: true };
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function deleteNotificationData({}, payload) {
  let result = {};
  try {
    await updateDoc(
      doc(
        firebaseDb,
        collections.personal,
        payload.notifUser,
        collections.personals.notifications,
        payload.notifType
      ),
      {
        [payload.notifId]: payload.deleteKey
          ? deleteField()
          : arrayRemove(payload.notifDetails),
      }
    )
      .then(() => {
        result = { success: true };
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function firebaseStopGettingNotifications({ commit }) {
  let result = {};
  try {
    if (notificationsRef) {
      await notificationsRef();
      await commit("clearNotifications");
    }
    result = { success: true };
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

export {
  addNotification,
  alertNotification,
  updateNotification,
  deleteNotification,
  deleteNotificationData,
  firebaseGetNotifications,
  firebaseStopGettingNotifications,
};
