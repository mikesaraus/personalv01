import { firebaseAuth, firebaseDb, myvar } from "src/boot/firebase";
import { openpgp_methods } from "src/boot/openpgp";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  updateEmail,
  deleteUser,
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
import { base64, greetings } from "assets/scripts/functions";
import { LocalStorage } from "quasar";
let usersRef, pwd;

async function registerUser({ dispatch }, payload) {
  let result = {};
  await createUserWithEmailAndPassword(
    firebaseAuth,
    payload.email,
    payload.password
  )
    .then(async () => {
      pwd = base64.encode(payload.password);
      dispatch("firebaseUpdateProfile", { displayName: payload.name });
      dispatch("firebaseSendEmailVerification");
      const userId = firebaseAuth.currentUser.uid;
      await openpgp_methods
        .generate({
          passphrase: payload.password,
          userIds: [
            {
              name: payload.name,
              email: payload.email,
              invitation: payload.invite,
            },
          ],
          type: "ecc",
          curve: "ed25519",
          format: "armored",
        })
        .then(async (pgp) => {
          if (pgp.success) {
            await setDoc(doc(firebaseDb, collections.users, userId), {
              name: payload.name,
              email: payload.email,
              online: true,
              invisible: false,
              invitation_code: payload.invite,
              pgp: {
                privateKey: base64.encode(pgp.response.privateKey),
                publicKey: base64.encode(pgp.response.publicKey),
                revocationCertificate: base64.encode(
                  pgp.response.revocationCertificate
                ),
              },
            })
              .then(() => {
                result = { success: true };
              })
              .catch(async (error) => {
                await dispatch("firebaseDeleteUser");
                dispatch("logoutUser");
                result = { success: false, response: error };
              });
          } else {
            await dispatch("firebaseDeleteUser");
            dispatch("logoutUser");
            result = {
              success: false,
              response: "Failed tot Generate PGP Keys",
            };
          }
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

async function loginUser({}, payload) {
  let result = {};
  await signInWithEmailAndPassword(
    firebaseAuth,
    payload.email,
    payload.password
  )
    .then(() => {
      pwd = base64.encode(payload.password);
      result = { success: true };
    })
    .catch((error) => {
      result = { success: false, response: error };
    });
  return result;
}

async function logoutUser({ state, commit, dispatch }) {
  let result = {};
  try {
    const userId = state.userDetails.userId;
    await dispatch("firebaseUpdateUser", {
      userId: userId,
      updates: {
        online: false,
      },
    })
      .then(async (res) => {
        if (res.success) {
          result = { success: true, response: res };
        } else {
          result = { success: false, response: res };
        }
        await dispatch("stopAllProcessOnLogout");
        if (LocalStorage.has(myvar.localStorage.userDetails))
          LocalStorage.remove(myvar.localStorage.userDetails);
        if (firebaseAuth) await signOut(firebaseAuth);
        commit("setUserDetails", {});
        console.clear();
        greetings.console();
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function initializeUserData({ dispatch }) {
  let result = {};
  try {
    dispatch("firebaseGetUsers");
    result = { success: true };
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function decryptTest({ commit, dispatch }, payload) {
  let result = {};
  try {
    const userDetails = LocalStorage.getItem(myvar.localStorage.userDetails);
    // Check if local storage has value
    if (userDetails) {
      // Check Passphrase First Before Initialize
      await openpgp_methods
        .encrypt_string({
          publicKeysArmored: [base64.decode(userDetails.pgp.publicKey)],
          privateKeyArmored: base64.decode(userDetails.pgp.privateKey),
          passphrase: base64.decode(payload.passphrase),
          plainText: myvar.default.bug,
        }) // Text Encryption
        .then(async (encryptedMsg) => {
          if (encryptedMsg.success) {
            await openpgp_methods
              .decrypt_string({
                privateKeyArmored: base64.decode(userDetails.pgp.privateKey),
                publicKeyArmored: base64.decode(userDetails.pgp.publicKey),
                passphrase: base64.decode(payload.passphrase),
                encryptedText: encryptedMsg.response,
              }) // Test Decryption
              .then(async (plainMsg) => {
                if (
                  plainMsg.success &&
                  plainMsg.response === myvar.default.bug
                ) {
                  // Accept if Valid
                  await commit("updateCurrentUser", {
                    ...payload.userDetails,
                    passphrase: payload.passphrase,
                  });
                  await dispatch("initializeUserData")
                    .then((response) => {
                      if (response.success) {
                        result = { success: true };
                      } else {
                        result = { success: false, response: response };
                      }
                    })
                    .catch((error) => {
                      result = { success: false, response: error };
                    });
                } else {
                  result = { success: false, response: plainMsg };
                }
              })
              .catch((e) => {
                result = { success: false, response: e };
              });
          } else {
            result = { success: false, response: "Failed to Encrypt" };
          }
        })
        .catch((e) => {
          result = { success: false, response: e };
        });
    } else {
      result = { success: false, response: "No Userdetails" };
    }
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

function handleAuthStateChanged({ dispatch }) {
  try {
    onAuthStateChanged(firebaseAuth, async (user) => {
      try {
        if (user) {
          const userId = firebaseAuth.currentUser.uid;
          let usr = await getDoc(doc(firebaseDb, collections.users, userId));
          if (usr.exists()) {
            const userDetails = {
              ...usr.data(),
              account: user.reloadUserInfo,
              userId: userId,
            };
            if (userDetails.account && userDetails.account.passwordHash)
              delete userDetails.account.passwordHash;
            dispatch("firebaseUpdateUser", {
              userId: userDetails.userId,
              updates: {
                online: true,
              },
            });
            LocalStorage.set(myvar.localStorage.userDetails, userDetails);
            if (pwd) {
              dispatch("decryptTest", {
                userDetails: userDetails,
                passphrase: pwd,
              });
              if (
                window.history.state.back &&
                window.history.state.back != myvar.router.auth.url
              ) {
                this.$router.back();
              } else {
                this.$router.replace(myvar.router.default.afterLogin.url);
              }
            } else {
              this.$router.replace(myvar.router.auth.url);
            }
          }
        } else {
          if (!LocalStorage.has(myvar.localStorage.userDetails))
            await dispatch("logoutUser");
          this.$router.replace("/");
        }
      } catch (error) {
        console.error("Auth Failure: ", error);
      }
    });
  } catch (error) {
    console.error("Auth Error: ", error);
  }
}

function firebaseGetUsers({ state, commit }) {
  try {
    const q = query(collection(firebaseDb, collections.users));
    usersRef = onSnapshot(q, (snapshot) => {
      try {
        snapshot.docChanges().forEach((change) => {
          const userDetails = change.doc.data();
          const userId = change.doc.id;
          if (change.type === "added") {
            commit("addUser", { userId, userDetails });
          }
          if (change.type === "modified") {
            commit("updateUser", { userId, userDetails });
            if (userId === state.userDetails.userId) {
              commit("updateCurrentUser", {
                ...userDetails,
                userId: userId,
              });
            }
          }
          if (change.type === "removed") {
            commit("removeUser", { userId, userDetails });
          }
        });
      } catch (error) {
        console.error("Users Failure: ", error);
      }
    });
  } catch (error) {
    console.error("Users Error: ", error);
  }
}

function firebaseStopGettingUsers({ commit }) {
  if (usersRef) {
    usersRef();
    commit("clearUser");
  }
}

async function firebaseUpdateUser({}, payload) {
  let result = {};
  try {
    if (payload.userId) {
      await updateDoc(
        doc(firebaseDb, collections.users, payload.userId),
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
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

function firebaseUpdateCurrentUser({ commit }, payload) {
  commit("updateCurrentUser", payload);
}

async function firebaseSendEmailVerification({}) {
  let result = {};
  try {
    await sendEmailVerification(firebaseAuth.currentUser)
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

async function firebaseSendPasswordResetEmail({}, userEmail) {
  let result = {};
  try {
    await sendPasswordResetEmail(firebaseAuth, userEmail)
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

async function firebaseDeleteUser({}) {
  let result = {};
  try {
    await deleteUser(firebaseAuth.currentUser)
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

async function firebaseUpdatePassword({}, newPassword) {
  let result = {};
  try {
    await updatePassword(firebaseAuth.currentUser, newPassword)
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

async function firebaseUpdateEmail({}, userEmail) {
  let result = {};
  try {
    await updateEmail(firebaseAuth.currentUser, userEmail)
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

async function firebaseUpdateProfile({}, payload) {
  let result = {};
  try {
    await updateProfile(firebaseAuth.currentUser, payload)
      .then(() => {
        result = { success: false, response: error };
      })
      .catch((error) => {
        result = { success: false, response: error };
      });
  } catch (error) {
    result = { success: false, response: error };
  }
  return result;
}

async function stopAllProcessOnLogout({ dispatch }) {
  await dispatch(
    "firebase_notification/firebaseStopGettingNotifications",
    null,
    {
      root: true,
    }
  );
  await dispatch("firebase_chat/firebaseStopGettingMessages", null, {
    root: true,
  });
  await dispatch("firebase_budget/firebaseStopGettingTransactions", null, {
    root: true,
  });
  await dispatch("firebase_diary/firebaseStopGettingDiary", null, {
    root: true,
  });
  await dispatch("firebaseStopGettingUsers");
}

export {
  stopAllProcessOnLogout,
  firebaseUpdateProfile,
  firebaseUpdateEmail,
  firebaseSendEmailVerification,
  firebaseSendPasswordResetEmail,
  firebaseDeleteUser,
  firebaseUpdatePassword,
  initializeUserData,
  registerUser,
  loginUser,
  logoutUser,
  decryptTest,
  firebaseGetUsers,
  firebaseUpdateUser,
  handleAuthStateChanged,
  firebaseStopGettingUsers,
  firebaseUpdateCurrentUser,
};
