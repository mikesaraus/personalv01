<template>
  <q-form @submit="submitForm">
    <q-input
      v-if="tab == 'register'"
      v-model="formData.name"
      class="q-mb-md"
      outlined
      label="Name"
    />
    <q-input
      v-model="formData.email"
      class="q-mb-md"
      outlined
      type="email"
      label="Email"
    />
    <q-input
      v-model="formData.password"
      class="q-mb-md"
      outlined
      type="password"
      label="Password"
    />
    <q-input
      v-if="tab == 'register'"
      v-model="formData.invite"
      class="q-mb-md"
      outlined
      label="Invitation Code"
    />
    <div class="row">
      <q-space />
      <q-btn
        color="primary"
        :disable="tab == 'register' ? registerReady : loginReady"
        type="submit"
        :label="tab"
      />
    </div>
  </q-form>
</template>

<script>
import { defineComponent } from "vue";
import { mapActions } from "vuex";
import { random_word } from "src/boot/axios";

export default defineComponent({
  name: "login-register",

  props: ["tab"],

  data() {
    return {
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

    submitForm() {
      if (this.tab == "login") {
        this.loginUser(this.formData);
      } else {
        if (this.inviteCode == this.formData.invite)
          this.registerUser(this.formData);
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
  },
});
</script>
