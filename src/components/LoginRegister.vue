<template>
  <q-form @submit="submitForm">
    <q-input
      v-if="tab == 'register'"
      v-model="formData.name"
      class="q-mb-md"
      outlined
      label="Name"
      tabindex="1"
    >
      <template v-slot:prepend>
        <q-icon round dense flat size="xs" name="person" />
      </template>
      <template v-slot:append>
        <q-btn
          round
          dense
          flat
          icon="clear"
          v-if="formData.name"
          @click="formData.name = ''"
        />
      </template>
    </q-input>
    <q-input
      v-model="formData.email"
      class="q-mb-md"
      outlined
      type="email"
      label="Email"
      tabindex="2"
    >
      <template v-slot:prepend>
        <q-icon round dense flat size="xs" name="email" />
      </template>
      <template v-slot:append>
        <q-btn
          round
          dense
          flat
          icon="clear"
          v-if="formData.email"
          @click="formData.email = ''"
        />
      </template>
    </q-input>
    <q-input
      v-model="formData.password"
      class="q-mb-md"
      outlined
      type="password"
      label="Password"
      tabindex="3"
    >
      <template v-slot:prepend>
        <q-icon round dense flat size="xs" name="lock" />
      </template>
      <template v-slot:append>
        <q-btn
          round
          dense
          flat
          icon="clear"
          v-if="formData.password"
          @click="formData.password = ''"
        />
      </template>
    </q-input>
    <q-input
      v-if="tab == 'register'"
      v-model="formData.invite"
      class="q-mb-md"
      outlined
      label="Invitation Code"
      tabindex="4"
    >
      <template v-slot:prepend>
        <q-icon round dense flat size="xs" name="vpn_key" />
      </template>
      <template v-slot:append>
        <q-btn
          round
          dense
          flat
          icon="clear"
          v-if="formData.invite"
          @click="formData.invite = ''"
        />
      </template>
    </q-input>
    <div class="row">
      <q-space />
      <q-btn
        color="primary"
        :disable="tab == 'register' ? registerReady : loginReady"
        type="submit"
        :label="tab"
        tabindex="5"
      />
    </div>
  </q-form>
</template>

<script>
import { defineComponent } from "vue";
import { useQuasar } from "quasar";
import { mapActions, mapState } from "vuex";
import { random_word } from "src/boot/axios";

export default defineComponent({
  name: "login-register",

  props: ["tab"],

  data() {
    return {
      $q: useQuasar(),
      formData: {
        name: "",
        email: "",
        password: "",
        invite: "",
      },
      inviteCode: "",
    };
  },

  created() {
    if (this.tab == "register") this.generateInviteCode();
  },

  computed: {
    ...mapState("firebase_auth", ["userDetails"]),

    loginReady() {
      if (this.formData && this.formData.email && this.formData.password)
        return false; // ready
      return true; // not ready
    },
    registerReady() {
      if (
        this.formData &&
        this.formData.name &&
        this.formData.email &&
        this.formData.password &&
        this.formData.invite
      )
        return false; // ready
      return true; // not ready
    },
  },

  methods: {
    ...mapActions("firebase_auth", ["registerUser", "loginUser"]),

    async submitForm() {
      if (this.tab == "login") {
        this.customAlert("Logging in...", "ongoing", 50);
        const status = await this.loginUser(this.formData);
        if (!status.success) {
          setTimeout(() => {
            this.customAlert("Login failed. Try Again!", "negative");
          }, 1000);
        }
      } else {
        this.customAlert("Processing...", "ongoing", 50);
        if (this.inviteCode == this.formData.invite) {
          const status = await this.registerUser(this.formData);
          if (!status.success) {
            setTimeout(() => {
              this.customAlert("Registration failed!", "warning");
            }, 1000);
          }
        } else {
          setTimeout(() => {
            this.customAlert("You are not invited in here!", "warning");
          }, 300);
        }
      }
    },
    generateInviteCode() {
      random_word
        .get("?number=1")
        .then((response) => {
          const c = response.data[0];
          console.log(c);
          this.inviteCode = c;
        })
        .catch(() => {
          console.log("You are not allowed in here!");
        });
    },
    customAlert(message, type, timeout = 1000, position = null) {
      if (!type || !message) return;
      let config = {
        type: type,
        message: message,
        timeout: timeout,
      };
      if (position) config.position = position;
      this.$q.notify(config);
    },
  },
});
</script>
