export default {
  computed: {
    otherUserDetails() {
      if (
        this.$store.state.firebase_auth.users[this.$route.params.otherUserId]
      ) {
        return this.$store.state.firebase_auth.users[
          this.$route.params.otherUserId
        ];
      }
      return {};
    },
  },
};
