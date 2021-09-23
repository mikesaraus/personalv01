import { mapState, mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters("firebase_auth", ["users"]),
    ...mapState("firebase_auth", ["userDetails"]),

    otherUserId() {
      return this.$route.params.otherUserId;
    },
    otherUserDetails() {
      let otherUserDetails = {};
      if (this.users[this.otherUserId]) {
        otherUserDetails = {
          ...this.users[this.otherUserId],
          userId: this.otherUserId,
        };
      } else if (this.isSelfChat) {
        otherUserDetails = {
          ...this.$store.state.firebase_auth.users[this.otherUserId],
          userId: this.otherUserId,
        };
      }
      return otherUserDetails;
    },
    isSelfChat() {
      let result = false;
      if (
        this.otherUserId &&
        (!this.otherUserDetails ||
          !Object.keys(this.otherUserDetails).length) &&
        this.$store.state.firebase_auth.users[this.otherUserId] &&
        Object.keys(this.$store.state.firebase_auth.users[this.otherUserId])
          .length
      )
        result = true;
      if (result) {
        const otherUserDetails = {
          ...this.$store.state.firebase_auth.users[this.otherUserId],
          userId: this.otherUserId,
        };
        if (this.userDetails.userId !== otherUserDetails.userId) result = false;
      }
      return result;
    },
  },
};
