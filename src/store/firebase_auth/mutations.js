import { reactive } from "vue";

function setUserDetails(state, payload) {
  state.userDetails = payload;
}

function addUser(state, payload) {
  state.users[payload.userId] = payload.userDetails;
}

function updateUser(state, payload) {
  Object.assign(state.users[payload.userId], payload.userDetails);
}

function removeUser(state, payload) {
  delete state.users[payload.userId];
}

function clearUser(state) {
  state.users = reactive({});
}

function updateCurrentUser(state, payload) {
  Object.keys(payload).forEach((key) => {
    state.userDetails[key] = payload[key];
  });
}

export {
  setUserDetails,
  addUser,
  updateUser,
  removeUser,
  clearUser,
  updateCurrentUser,
};
