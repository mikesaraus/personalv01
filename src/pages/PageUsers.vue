<template>
  <q-page class="flex q-pa-md">
    <q-list class="full-width" separator>
      <q-item q-item style="max-width: 300px" v-if="!users">
        <q-item-section avatar>
          <q-skeleton type="QAvatar" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton type="text" />
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        v-else
        v-for="(user, key) in users"
        :key="key"
        :to="'/chat/' + key"
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ user.name.charAt(0) }}
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ user.name }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-badge
            :color="!user.online || user.invisible ? 'grey-4' : 'light-green-5'"
          >
            {{ !user.online || user.invisible ? "Offline" : "Online" }}
          </q-badge>
        </q-item-section>

        <q-menu touch-position context-menu>
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup @click="clearChats(key)">
              <q-item-section>Clear Chats</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters, mapActions, mapState } from "vuex";

export default defineComponent({
  name: "Users Page",

  created() {
    if (!Object.keys(this.userDetails).length) this.$router.push("/");
  },

  computed: {
    ...mapGetters("firebase_auth", ["users"]),
    ...mapState("firebase_auth", ["userDetails"]),
  },

  methods: {
    ...mapActions("firebase_chat", ["firebaseClearChats"]),

    clearChats(userid) {
      this.firebaseClearChats(userid);
    },
  },
});
</script>
