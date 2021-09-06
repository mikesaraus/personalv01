<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="$route.fullPath.includes('/chat/')"
          class="absolute-left"
          @click="$router.back()"
          icon="arrow_back"
          flat
          dense
          label="Back"
        />

        <q-toolbar-title class="absolute-center">
          {{ title }}
        </q-toolbar-title>

        <q-btn
          v-if="!userDetails.userId && !$route.fullPath == '/'"
          to="/auth"
          class="absolute-right q-pr-sm"
          icon="account_circle"
          no-caps
          flat
          dense
          label="Login"
        />
        <q-btn
          v-if="userDetails.userId"
          class="absolute-right q-pr-sm"
          icon="account_circle"
          no-caps
          flat
          dense
        >
          <q-menu>
            <div
              class="row no-wrap q-pa-md justify-arround"
              style="min-width: 325px; max-width: 450px"
            >
              <div class="column col">
                <div class="text-h6">Settings</div>
                <q-toggle
                  v-model="invisible"
                  @click="updateInvisibility"
                  label="Invisible"
                />
                <q-btn
                  v-if="$route.fullPath.includes('/chat')"
                  outline
                  rounded
                  to="/budget"
                  color="primary"
                  label="Budget"
                  icon="analytics"
                />
                <q-btn
                  v-else
                  outline
                  rounded
                  to="/chat"
                  color="primary"
                  label="Chat"
                  icon="message"
                />
              </div>

              <q-separator vertical inset class="q-mx-lg" />

              <div class="column col items-center">
                <q-avatar color="primary" text-color="white" size="72px">
                  {{ userDetails.name.charAt(0) }}
                </q-avatar>
                <div class="text-body2 q-mt-md q-mb-xs text-center">
                  {{ userDetails.name }}
                </div>
                <q-menu>
                  <q-btn
                    color="text-grey"
                    icon="logout"
                    @click="logout"
                    label="Logout"
                    ripple
                    flat
                    size="sm"
                    v-close-popup
                  />
                </q-menu>
              </div>
            </div>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[15, 15]"
    >
      <q-btn fab icon="keyboard_arrow_up" size="xs" color="primary" />
    </q-page-scroller>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { mapState, mapActions } from "vuex";
import mixinOtherUserDetails from "src/mixins/mixin-other-user-details";

export default defineComponent({
  name: "MainLayout",

  mixins: [mixinOtherUserDetails],

  data() {
    return {
      invisible: false,
    };
  },

  computed: {
    ...mapState("firebase_auth", ["userDetails"]),

    title() {
      let currentPath = this.$route.fullPath;
      if (currentPath == "/budget") return "My Budget";
      else if (currentPath == "/chat") return "My Chats";
      else if (currentPath.includes("/chat/"))
        return this.otherUserDetails.name;
      else if (currentPath == "/") return "Welcome, You!";
    },
  },

  watch: {
    userDetails: {
      handler(val) {
        if (Object.keys(val).length) {
          this.invisible = this.userDetails.invisible;
        }
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions("firebase_auth", [
      "logoutUser",
      "firebaseUpdateUser",
      "firebaseStopGettingUsers",
    ]),
    ...mapActions("firebase_budget", ["firebaseStopGettingTransactions"]),

    updateInvisibility() {
      this.firebaseUpdateUser({
        userId: this.userDetails.userId,
        updateCurrentUser: true,
        updates: { invisible: this.invisible },
      });
    },
    logout() {
      this.firebaseStopGettingTransactions();
      this.firebaseStopGettingUsers();
      this.logoutUser();
    },
  },
});
</script>

<style lang="scss">
.platform-ios.q-header.q-btn,
.q-toolbar__title {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.q-toolbar .q-btn {
  line-height: 1.2;
}
</style>
