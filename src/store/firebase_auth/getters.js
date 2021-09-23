import { reactive } from "vue";
import { check } from "src/assets/scripts/functions";

function users(state) {
  let usersFiltered = reactive({});
  Object.keys(state.users)
    .filter((key) => key !== state.userDetails.userId)
    .forEach((key) => {
      if (!usersFiltered[key]) usersFiltered[key] = {};
      if (check.type.isObject(state.users[key])) {
        Object.keys(state.users[key])
          .filter((x) => x !== "pgp")
          .forEach((x) => {
            usersFiltered[key][x] = state.users[key][x];
          });
      } else {
        // skip non object which has no id
      }
      if (check.type.isObject(state.users[key]["pgp"])) {
        usersFiltered[key]["pgp"] = {
          publicKey: state.users[key]["pgp"].publicKey
            ? state.users[key]["pgp"].publicKey
            : null,
        };
      }
    });
  return usersFiltered;
}

function visibleUsers(state, getters) {
  let usersFiltered = reactive({});
  Object.keys(getters.users).forEach((key) => {
    if (check.type.isObject(getters.users[key])) {
      if (!getters.users[key]["invisible"]) {
        usersFiltered[key] = getters.users[key];
      }
    }
  });
  return usersFiltered;
}

export { users, visibleUsers };
