<template>
  <router-view @mousemove="testIdle" v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>
<script>
import { LocalStorage, useQuasar } from "quasar";
import { defineComponent } from "vue";
import { mapActions, mapState } from "vuex";
import { greetings } from "./assets/scripts/functions";
import { mixinLogout } from "./mixins";
import idleTimeout from "idle-timeout";

export default defineComponent({
  name: "App",

  mixins: [mixinLogout],

  data() {
    return {
      $q: useQuasar(),
      idle: false,
      idle_expire: 10000,
    };
  },

  computed: {
    ...mapState("firebase_auth", ["userDetails"]),

    isLogin() {
      if (LocalStorage.has(this.$myvar.localStorage.userDetails)) return true;
      return false;
    },
  },

  created() {
    greetings.console();
    this.handleAuthStateChanged();

    this.idle = idleTimeout(
      async () => {
        if (this.isLogin) {
          await this.firebaseUpdateUser({
            userId: this.userDetails.userId,
            updates: { online: false },
          });
        }
      },
      {
        element: window,
        timeout: this.idle_expire,
        loop: false,
      }
    );
  },

  methods: {
    ...mapActions("firebase_auth", [
      "handleAuthStateChanged",
      "firebaseUpdateCurrentUser",
      "firebaseUpdateUser",
    ]),

    async testIdle(e) {
      if (this.idle.idle && this.isLogin) {
        await this.firebaseUpdateUser({
          userId: this.userDetails.userId,
          updates: { online: true },
        });
        this.idle.reset();
      }
    },
  },

  beforeMount() {
    const userDetails = this.$q.localStorage.getItem(
      this.$myvar.localStorage.userDetails
    );
    if (userDetails) this.firebaseUpdateCurrentUser(userDetails);
  },

  beforeUnmount() {
    this.idle.destroy();
  },
});
</script>
