<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>
<script>
import { useQuasar } from "quasar";
import { defineComponent } from "vue";
import { mapActions } from "vuex";
import { greetings } from "./assets/scripts/functions";

export default defineComponent({
  name: "App",

  data() {
    return {
      $q: useQuasar(),
    };
  },

  methods: {
    ...mapActions("firebase_auth", [
      "handleAuthStateChanged",
      "firebaseUpdateCurrentUser",
    ]),
  },

  created() {
    greetings.console();
    this.handleAuthStateChanged();
  },

  beforeMount() {
    const userDetails = this.$q.localStorage.getItem(
      this.$myvar.localStorage.userDetails
    );
    if (userDetails) this.firebaseUpdateCurrentUser(userDetails);
  },
});
</script>
