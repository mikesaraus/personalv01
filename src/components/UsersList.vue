<template>
  <q-page style="min-height: unset">
    <q-list
      v-if="Object.keys(users).length || preloader"
      @mouseleave="userOnHover = null"
    >
      <transition-group
        appear
        enter-active-class="animated bounceInLeft slow"
        leave-active-class="animated bounceOutRight slow"
      >
        <q-item v-ripple clickable v-if="preloader">
          <q-item-section avatar>
            <q-avatar round text-color="white" color="grey-6">
              <q-skeleton type="QAvatar" />
              <q-badge
                rounded
                floating
                align="middle"
                class="q-pa-none q-ma-none transparent"
                style="bottom: -3px; right: -3px; top: unset"
              >
                <q-skeleton type="QAvatar" size="10px" />
              </q-badge>
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <q-skeleton type="text" />
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-else
          v-ripple
          clickable
          :key="key"
          v-for="(user, key) in visibleUsers"
          @mouseover="userOnHover = key"
          :to="$myvar.router.chat.url + '/' + key"
        >
          <q-item-section avatar>
            <q-avatar round text-color="white" color="grey-6">
              <q-icon name="fas fa-mask" />
              <q-badge
                rounded
                floating
                align="middle"
                class="q-pa-none q-ma-none transparent"
                style="bottom: -3px; right: -3px; top: unset"
                v-if="
                  (user.online && !user.invisible) ||
                  (notifMessages[key] && notifMessages[key].length)
                "
              >
                <q-icon
                  :size="
                    notifMessages[key] && notifMessages[key].length
                      ? '10px'
                      : '13px'
                  "
                  :color="
                    notifMessages[key] && notifMessages[key].length
                      ? user.online && !user.invisible
                        ? 'white'
                        : 'primary'
                      : 'secondary'
                  "
                  :name="
                    notifMessages[key] && notifMessages[key].length
                      ? 'add'
                      : 'circle'
                  "
                  :class="
                    notifMessages[key] && notifMessages[key].length
                      ? user.online && !user.invisible
                        ? 'bg-primary q-pa-xs'
                        : 'bg-grey-4 q-pa-xs'
                      : 'bg-white'
                  "
                  style="border-radius: 50%"
                />
              </q-badge>
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label
              :class="
                notifMessages[key] && notifMessages[key].length
                  ? 'text-weight-medium'
                  : ''
              "
            >
              {{ user.name }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              round
              ripple
              size="sm"
              color="white"
              icon="delete_sweep"
              text-color="primary"
              @click.prevent="clearChats(key)"
              style="background: rgba(255, 255, 255, 0.5) !important"
              v-if="userOnHover == key || (otherUserId == key && !userOnHover)"
            >
              <q-tooltip
                :delay="100"
                :offset="[10, 10]"
                self="center left"
                class="bg-primary"
                anchor="center right"
              >
                Clear Chats
              </q-tooltip>
            </q-btn>
          </q-item-section>

          <q-menu
            auto-close
            context-menu
            touch-position
            v-if="$q.platform.is.mobile"
          >
            <q-list>
              <q-item clickable @click="clearChats(key)">
                <q-item-section avatar style="min-width: 35px">
                  <q-icon name="delete_sweep" />
                </q-item-section>
                <q-item-section>Clear Chats</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </transition-group>
    </q-list>
    <div v-else class="no-history text-center q-mt-xl">
      <q-icon name="no_accounts" size="100px" color="primary"></q-icon>
      <div class="text-h5 text-primary">No User</div>
    </div>
  </q-page>
</template>

<script>
import { customAlert } from "src/assets/scripts/functions";
import { mixinOtherUserDetails, mixinPreloader } from "src/mixins";
import { defineComponent } from "vue";
import { mapGetters, mapActions, mapState } from "vuex";

export default defineComponent({
  name: "Users Page",

  mixins: [mixinOtherUserDetails, mixinPreloader],

  data() {
    return {
      userOnHover: null,
    };
  },

  mounted() {
    this.startPreloading(this.visibleUsers);
  },

  computed: {
    ...mapGetters("firebase_auth", ["users", "visibleUsers"]),
    ...mapGetters("firebase_notification", ["notifMessages"]),
    ...mapState("firebase_auth", ["userDetails"]),
  },

  methods: {
    ...mapActions("firebase_chat", ["firebaseClearChats"]),

    async clearChats(userid) {
      await this.firebaseClearChats(userid)
        .then((result) => {
          if (result.success) {
            customAlert(
              "Messages has been cleared.",
              "positive",
              1000,
              this.$q.screen.lt.sm ? "top" : "bottom-left",
              {
                color: "primary",
                textColor: "white",
              }
            );
          } else {
            customAlert(
              "Failed to delete messages.",
              "warning",
              1000,
              this.$q.screen.lt.sm ? "top" : "bottom-left",
              {
                color: "primary",
                textColor: "white",
              }
            );
          }
        })
        .catch(() => {
          customAlert(
            "Error deleting messages.",
            "negative",
            1000,
            this.$q.screen.lt.sm ? "top" : "bottom-left",
            {
              color: "primary",
              textColor: "white",
            }
          );
        });
    },
  },
});
</script>

<style lang="sass">
.no-history
   opacity: 0.5

.q-item.q-router-link--active, .q-item--active
   background-color: $grey-3
   font-weight: bold
</style>
