import { mapActions } from "vuex";
import { customAlert } from "src/assets/scripts/functions";
import { myvar } from "src/boot/firebase";

export default {
  methods: {
    ...mapActions("firebase_auth", ["logoutUser"]),

    async logout() {
      customAlert(myvar.default.out_message, "ongoing", 1000, "center", {
        color: "primary",
      });
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
