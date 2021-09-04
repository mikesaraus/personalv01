import { boot } from "quasar/wrappers";
import axios from "axios";

const random_word = axios.create({
  baseURL: "https://random-word-api.herokuapp.com/word",
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios ...etc

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file
});

export { axios, random_word };
