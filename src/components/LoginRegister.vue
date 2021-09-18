<template>
  <q-form @submit="submitForm">
    <q-input
      outlined
      label="Name"
      tabindex="1"
      ref="fieldName"
      class="q-mb-md"
      v-model="formData.name"
      v-if="tab == 'register'"
    >
      <template v-slot:prepend>
        <q-icon round dense flat size="xs" name="person" />
      </template>
      <template v-slot:append>
        <q-btn
          flat
          round
          dense
          ripple
          icon="clear"
          v-if="formData.name"
          @click="formData.name = ''"
        />
      </template>
    </q-input>
    <q-input
      outlined
      autocomplete
      type="email"
      label="Email"
      tabindex="2"
      class="q-mb-md"
      ref="fieldEmail"
      v-model="formData.email"
    >
      <template v-slot:prepend>
        <q-icon round dense flat size="xs" name="email" />
      </template>
      <template v-slot:append>
        <q-btn
          flat
          round
          dense
          ripple
          icon="clear"
          v-if="formData.email"
          @click="formData.email = ''"
        />
      </template>
    </q-input>
    <q-input
      outlined
      autocomplete
      tabindex="3"
      class="q-mb-md"
      label="Password"
      ref="fieldPassword"
      :type="passfieldType"
      @focus="passEye = true"
      @blur="passEye = false"
      v-model="formData.password"
    >
      <template v-slot:prepend>
        <q-icon round dense flat size="xs" name="lock" />
      </template>
      <template v-slot:append>
        <q-btn
          flat
          round
          dense
          ripple
          :icon="
            passfieldType.toLowerCase() == 'text'
              ? 'visibility_off'
              : 'visibility'
          "
          v-if="formData.password && passEye"
          @click="togglePassview"
        />
        <q-btn
          flat
          round
          dense
          ripple
          icon="clear"
          v-if="formData.password"
          @click="formData.password = ''"
        />
      </template>
    </q-input>
    <q-input
      outlined
      tabindex="4"
      class="q-mb-md"
      ref="fieldInviteCode"
      label="Invitation Code"
      v-if="tab == 'register'"
      v-model="formData.invite"
    >
      <template v-slot:prepend>
        <q-icon round dense flat size="xs" name="vpn_key" />
      </template>
      <template v-slot:append>
        <q-btn
          flat
          round
          dense
          ripple
          icon="clear"
          v-if="formData.invite"
          @click="formData.invite = ''"
        />
      </template>
    </q-input>
    <div class="row">
      <q-space />
      <q-btn
        ripple
        tabindex="5"
        label="Submit"
        type="submit"
        color="primary"
        ref="btnSubmit"
        :loading="decrypting.status"
        :percentage="decrypting.percentage"
        :disable="tab == 'register' ? registerReady : loginReady"
      >
        <template v-slot:loading>
          <q-spinner-facebook size="xs" class="on-left" />
        </template>
      </q-btn>
    </div>
  </q-form>
</template>

<script>
import { useQuasar } from "quasar";
import { defineComponent, ref } from "vue";
import { mapActions, mapState } from "vuex";
import { random_word } from "src/boot/axios";
import { customAlert } from "src/assets/scripts/functions";

export default defineComponent({
  name: "login-register",

  props: ["tab"],

  data() {
    return {
      $q: useQuasar(),
      formData: {
        name: ref(""),
        email: ref(""),
        password: ref(""),
        invite: ref(""),
      },
      passEye: ref(false),
      inviteCode: ref(""),
      passfieldType: ref("password"),
      decrypting: ref({ status: false, percentage: 0 }),
      interval: ref(null),
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
      this.decrypting.status = true;
      if (this.tab == "login") {
        const status = await this.loginUser(this.formData);
        if (!status.success) {
          this.$refs.fieldPassword.focus();
          this.btnLoadingInterval("Login failed!", "negative");
        } else {
          this.btnLoadingInterval();
        }
      } else {
        if (this.inviteCode == this.formData.invite) {
          const status = await this.registerUser(this.formData);
          if (!status.success) {
            this.$refs.fieldInviteCode.focus();
            this.btnLoadingInterval("Registration failed!", "warning");
          } else {
            this.btnLoadingInterval();
          }
        } else {
          this.$refs.fieldInviteCode.focus();
          this.btnLoadingInterval("You are not invited!", "warning");
        }
      }
    },
    generateInviteCode() {
      random_word
        .get("?number=1")
        .then((response) => {
          const c = response.data[0];
          console.log(
            "%c" + c,
            "color: grey; font-size: 1.3em; text-weight: bold;"
          );
          this.inviteCode = c;
        })
        .catch(() => {
          console.log("No Invitation!");
        });
    },
    btnLoadingInterval(msg, msgType) {
      this.interval = setInterval(() => {
        this.decrypting.percentage += Math.floor(Math.random() * 8 + 10);
        if (this.decrypting.percentage >= 100) {
          this.decrypting.status = false;
          if (msg && msgType) customAlert(msg, msgType);
          clearInterval(this.interval);
        }
      }, 100);
    },
    togglePassview() {
      this.passfieldType =
        this.passfieldType.toLowerCase() == "text" ? "password" : "text";
      setTimeout(() => {
        if (this.passfieldType.toLowerCase() == "text")
          this.passfieldType = "password";
      }, 3000);
    },
  },

  beforeUnmount() {
    if (this.interval) clearInterval(this.interval);
  },
});
</script>
