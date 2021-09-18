import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters("firebase_auth", ["users"]),

    otherUserDetails() {
      if (this.users[this.$route.params.otherUserId]) {
        return this.users[this.$route.params.otherUserId];
      }
      return {};
    },
  },
};
