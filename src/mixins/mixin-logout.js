import { mapActions } from "vuex";
import { customAlert } from "src/assets/scripts/functions";

export default {
  methods: {
    ...mapActions("firebase_auth", ["logoutUser"]),

    async logout() {
      await this.logoutUser()
        .then((result) => {
          if (!result.success) {
            customAlert("Logout error!", "warning");
          }
        })
        .catch(() => {
          customAlert("Unknown error!", "negative");
        });
      this.$router.replace("/");
    },
  },
};
