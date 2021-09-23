import { store } from "quasar/wrappers";
import { createStore } from "vuex";

import firebase_auth from "./firebase_auth";
import firebase_chat from "./firebase_chat";
import firebase_diary from "./firebase_diary";
import firebase_budget from "./firebase_budget";
import firebase_notification from "./firebase_notification";

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      firebase_auth,
      firebase_chat,
      firebase_diary,
      firebase_budget,
      firebase_notification,
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING,
  });

  return Store;
});
