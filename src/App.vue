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

  mounted() {
    console.log(
      "%cStop!",
      "color:red;font-family:system-ui;font-size:4rem;-webkit-text-stroke: 1px black;font-weight:bold"
    );
    console.log(
      "%cThis is a browser feature intended for developers.",
      "color:black; font-size: 1.5em; text-weight: bold;"
    );
  },
});
</script>
