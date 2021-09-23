import { reactive } from "vue";

function addNotifications(state, payload) {
  state.notifications[payload.notifId] = payload.details;
}

function updateNotifications(state, payload) {
  if (state.notifications[payload.notifId]) {
    if (
      state.notifications[payload.notifId] &&
      Object.keys(state.notifications[payload.notifId]).length
    ) {
      console.log("I am here");
      Object.keys(state.notifications[payload.notifId]).forEach((key) => {
        if (!payload.details[key])
          delete state.notifications[payload.notifId][key];
      });
    }
    if (payload.details && Object.keys(payload.details).length) {
      Object.keys(payload.details).forEach((key) => {
        state.notifications[payload.notifId][key] = payload.details[key];
      });
    }
  } else {
    state.notifications[payload.notifId] = payload.details;
  }
}

function removeNotifications(state, payload) {
  delete state.notifications[payload.notifId];
}

function removeNotificationsData(state, payload) {
  state.notifications[payload.notifId].forEach((data, id) => {
    if (Object.is(data, details)) {
      state.notifications[payload.notifId].splice(id, 0);
    }
  });
}

function clearNotifications(state) {
  state.notifications = reactive({});
}

export {
  addNotifications,
  updateNotifications,
  removeNotifications,
  clearNotifications,
  removeNotificationsData,
};
