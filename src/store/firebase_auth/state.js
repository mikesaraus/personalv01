import { reactive } from "vue";

export default function () {
  return {
    userDetails: reactive({}),
    users: reactive({}),
  };
}
