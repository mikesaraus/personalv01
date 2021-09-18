<template>
  <q-page style="min-height: unset">
    <q-list v-if="Object.keys(users).length" @mouseleave="userOnHover = null">
      <transition-group
        appear
        enter-active-class="animated bounceInLeft slow"
        leave-active-class="animated bounceOutRight slow"
      >
        <q-item
          v-ripple
          clickable
          :key="key"
          v-for="(user, key) in users"
          @mouseover="userOnHover = key"
          :to="$myvar.router.chat + '/' + key"
        >
          <q-item-section avatar>
            <q-avatar
              round
              text-color="white"
              :color="
                user.online ? (user.invisible ? 'grey-9' : 'primary') : 'grey-6'
              "
            >
              <q-icon name="fas fa-mask" />
              <q-badge
                rounded
                floating
                transparent
                align="middle"
                class="q-pa-none q-ma-none"
                style="bottom: -3px; right: -3px; top: unset"
                v-if="user.online && !user.invisible"
              >
                <q-icon
                  size="13px"
                  color="secondary"
                  name="circle"
                  class="bg-white"
                  style="border-radius: 50%"
                />
              </q-badge>
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ user.name }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              round
              ripple
              size="13px"
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
import { defineComponent, ref } from "vue";
import { mapGetters, mapActions, mapState } from "vuex";

export default defineComponent({
  name: "Users Page",

  data() {
    return {
      userOnHover: ref(null),
    };
  },

  computed: {
    ...mapGetters("firebase_auth", ["users"]),
    ...mapState("firebase_auth", ["userDetails"]),

    otherUserId() {
      return this.$route.params.otherUserId;
    },
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
