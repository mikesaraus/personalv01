<template>
  <router-view />
</template>
<script>
import { defineComponent } from "vue";
import { mapActions } from "vuex";

export default defineComponent({
  name: "App",

  methods: {
    ...mapActions("firebase_auth", ["handleAuthStateChanged"]),
  },

  created() {
    this.handleAuthStateChanged();
  },
});
</script>
