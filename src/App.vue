<template>
  <router-view />
</template>
<script>
import { useQuasar } from "quasar";
import { defineComponent } from "vue";
import { mapActions } from "vuex";

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
    console.log(
      "%c" + this.$myvar.test.text,
      "color: grey; font-family:system-ui; font-size: 3rem; font-weight: bold"
    );
    console.log(
      "%c" + this.$myvar.test.bug,
      "color: silver; font-size: 1.5em; text-weight: bold;"
    );
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
