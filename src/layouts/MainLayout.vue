<template>
  <q-layout view="lHr LpR lFr">
    <transition
      appear
      enter-active-class="animated fadeIn slow"
      leave-active-class="animated fadeOut slow"
    >
      <q-header elevated v-if="!isAuthPage">
        <q-toolbar>
          <q-toolbar-title class="absolute-center">
            {{ title }}
            <q-icon
              size="xs"
              color="secondary"
              name="check_circle"
              v-if="
                $route.fullPath.includes($myvar.router.chat + '/') &&
                otherUserDetails.name &&
                otherUserDetails.online &&
                !otherUserDetails.invisible
              "
            />
            <q-tooltip
              :delay="100"
              :offset="[10, 10]"
              self="top middle"
              anchor="bottom middle"
              :class="
                otherUserDetails.online && !otherUserDetails.invisible
                  ? 'bg-secondary text-grey-9'
                  : 'bg-grey-6 text-grey-9'
              "
              v-if="
                $route.fullPath.includes($myvar.router.chat + '/') &&
                otherUserDetails.name
              "
            >
              <q-icon
                size="xs"
                color="grey-9"
                :name="
                  otherUserDetails.online && !otherUserDetails.invisible
                    ? 'wifi_tethering'
                    : 'wifi_tethering_off'
                "
              />
              {{
                otherUserDetails.online && !otherUserDetails.invisible
                  ? "Online"
                  : "Offline"
              }}
            </q-tooltip>
          </q-toolbar-title>

          <q-btn
            flat
            dense
            round
            ripple
            icon="people"
            color="secondary"
            @mouseover="
              (e) => {
                e.target.style.color = 'white';
              }
            "
            @mouseout="
              (e) => {
                e.target.style.color = secondaryColor;
              }
            "
            @click="drawerUsersList = !drawerUsersList"
            v-if="userDetails.passphrase"
          >
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              :offset="[10, 10]"
              :delay="100"
            >
              Users
            </q-tooltip>
          </q-btn>
          <q-space />
          <q-btn
            flat
            dense
            round
            ripple
            icon="account_circle"
            v-if="userDetails.passphrase"
            color="secondary"
            @mouseover="
              (e) => {
                e.target.style.color = 'white';
              }
            "
            @mouseout="
              (e) => {
                e.target.style.color = secondaryColor;
              }
            "
          >
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <div
                class="row no-wrap q-px-md q-pb-xs q-pt-md justify-arround"
                style="min-width: 325px; max-width: 450px"
              >
                <div class="column col">
                  <div class="text-h6">Settings</div>
                  <q-btn
                    flat
                    no-caps
                    rounded
                    ripple
                    size="md"
                    color="grey-9"
                    label="Visible"
                    @click="updateInvisibility"
                    :icon="
                      userDetails.invisible ? 'visibility_off' : 'visibility'
                    "
                  />
                  <q-btn
                    flat
                    no-caps
                    rounded
                    ripple
                    size="md"
                    icon="logout"
                    label="Logout"
                    v-close-popup
                    color="grey-9"
                    @click="logout"
                  />
                </div>
                <q-separator vertical inset class="q-mx-lg" />
                <div class="column col items-center">
                  <q-avatar color="primary" text-color="white" size="72px">
                    {{ userDetails.name.charAt(0) }}
                  </q-avatar>
                  <div class="text-body2 q-mt-md text-center">
                    {{ userDetails.name }}
                  </div>
                </div>
              </div>
              <q-separator inset class="q-my-sm" />
              <div class="q-px-md q-pt-xs q-pb-md">
                <q-btn
                  stack
                  round
                  outline
                  ripple
                  icon="message"
                  color="primary"
                  class="q-ma-xs q-px-sm"
                  :to="$myvar.router.chat"
                >
                  <q-tooltip
                    anchor="bottom middle"
                    self="top middle"
                    :offset="[10, 10]"
                    :delay="100"
                  >
                    Chat
                  </q-tooltip>
                </q-btn>
                <q-btn
                  stack
                  round
                  outline
                  ripple
                  color="primary"
                  icon="analytics"
                  class="q-ma-xs q-px-sm"
                  :to="$myvar.router.budget"
                >
                  <q-tooltip
                    anchor="bottom middle"
                    self="top middle"
                    :offset="[10, 10]"
                    :delay="100"
                  >
                    Budget
                  </q-tooltip>
                </q-btn>
                <q-btn
                  stack
                  round
                  outline
                  ripple
                  color="primary"
                  icon="bookmark"
                  class="q-ma-xs q-px-sm"
                  :to="$myvar.router.diary"
                >
                  <q-tooltip
                    anchor="bottom middle"
                    self="top middle"
                    :offset="[10, 10]"
                    :delay="100"
                  >
                    Diary
                  </q-tooltip>
                </q-btn>
              </div>
            </q-menu>
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              :offset="[10, 10]"
              :delay="100"
            >
              Account
            </q-tooltip>
          </q-btn>
        </q-toolbar>
      </q-header>
    </transition>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </q-page-container>

    <transition
      appear
      enter-active-class="animated fadeIn slow"
      leave-active-class="animated fadeOut slow"
    >
      <q-drawer
        bordered
        :width="320"
        show-if-above
        :breakpoint="700"
        v-model="drawerUsersList"
        v-if="userDetails.passphrase"
        :side="$route.fullPath.includes($myvar.router.chat) ? 'left' : 'right'"
      >
        <div class="absolute-top bg-primary text-white" style="height: 170px">
          <div class="absolute-bottom bg-transparent q-ma-md">
            <q-avatar
              size="56px"
              color="white text-weight-bold"
              class="q-mb-sm"
              text-color="primary"
            >
              {{
                userDetails.name && userDetails.passphrase
                  ? userDetails.name.charAt(0)
                  : "X"
              }}
            </q-avatar>
            <div class="text-weight-bold">
              {{
                userDetails.passphrase && userDetails.name
                  ? userDetails.name
                  : "********"
              }}
            </div>
            <div>
              @{{
                userDetails.passphrase && userDetails.userId
                  ? userDetails.userId
                  : "*****"
              }}
            </div>
          </div>
        </div>
        <q-scroll-area
          style="
            margin-top: 170px;
            height: calc(100% - 170px);
            border-right: 1px solid #ddd;
          "
        >
          <users-list />
        </q-scroll-area>
      </q-drawer>
    </transition>

    <q-page-scroller
      :offset="[15, 15]"
      :scroll-offset="170"
      position="bottom-right"
      v-if="!$route.fullPath.includes($myvar.router.chat)"
    >
      <q-btn
        fab
        ripple
        size="xs"
        color="primary"
        style="opacity: 0.75"
        icon="keyboard_arrow_up"
      />
    </q-page-scroller>
  </q-layout>
</template>

<script>
import { myvar } from "src/boot/firebase";
import { defineComponent, ref } from "vue";
import { mapState, mapActions } from "vuex";
import { copyToClipboard, getCssVar } from "quasar";
import { mixinOtherUserDetails, mixinLogout } from "src/mixins/";

export default defineComponent({
  name: "MainLayout",

  mixins: [mixinOtherUserDetails, mixinLogout],

  components: {
    "users-list": require("components/UsersList.vue").default,
  },

  data() {
    return {
      bootvar: myvar,
      drawerUsersList: ref(false),
      primaryColor: getCssVar("primary"),
      secondaryColor: getCssVar("secondary"),
    };
  },

  computed: {
    ...mapState("firebase_auth", ["userDetails"]),

    title() {
      let currentPath = this.$route.fullPath;
      if (currentPath == myvar.router.budget) return "Accounting";
      else if (currentPath == myvar.router.chat) return "Private Chat";
      else if (currentPath.includes(myvar.router.chat + "/"))
        return this.otherUserDetails.name
          ? this.otherUserDetails.name
          : "Private Chat";
      else if (currentPath == myvar.router.diary) return "Life Events";
      else if (currentPath == myvar.router.auth) return myvar.test.text;
    },
    isAuthPage() {
      if (this.$route.fullPath == myvar.router.auth) return true;
      return false;
    },
    otherUserId() {
      return this.$route.params.otherUserId;
    },
  },

  watch: {
    bootvar: {
      async handler(val) {
        const msgToDelete = val.messages.todelete;
        if (msgToDelete.length) {
          msgToDelete.forEach((msg, id) => {
            this.autoRemoveMessage({ ...msg, id });
          });
        }
      },
      deep: true,
    },
    otherUserId: {
      async handler(val) {
        if (!val && this.$route.fullPath.includes(myvar.router.chat)) {
          this.drawerUsersList = ref(true);
        }
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions("firebase_auth", [
      "firebaseUpdateUser",
      "firebaseStopGettingUsers",
    ]),
    ...mapActions("firebase_chat", ["firebaseDeleteMessage"]),
    ...mapActions("firebase_budget", ["firebaseStopGettingTransactions"]),

    updateInvisibility() {
      this.firebaseUpdateUser({
        userId: this.userDetails.userId,
        updates: { invisible: !this.userDetails.invisible },
      });
    },
    chatBack() {
      if (window.history.state.back) {
        this.$router.back();
      } else {
        this.$router.push(myvar.router.chat);
      }
    },
    async autoRemoveMessage(options) {
      await this.firebaseDeleteMessage({
        messageId: options.msgid,
        otherUserId: options.usrid,
        deleteForEveryone: options.deleteForEveryone,
      })
        .then((result) => {
          if (result.success) {
            copyToClipboard(options.msg)
              .then(() => {
                console.log("Message deleted, backup copied to clipboard!");
              })
              .catch((e) => {
                console.log("Message deleted, no backup!", e.message);
              });
          } else {
            console.warn("Message deletion failed!");
          }
        })
        .catch((error) => {
          console.error("Delete Error: ", error.message);
        });
      myvar.messages.todelete.splice([options.id], 1);
    },
  },
});
</script>

<style lang="sass">
.platform-ios.q-header.q-btn,
.q-toolbar__title
  padding-top: constant(safe-area-inset-top)
  padding-top: env(safe-area-inset-top)

.q-toolbar .q-btn
  line-height: 1.2
</style>
