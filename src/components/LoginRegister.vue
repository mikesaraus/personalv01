<template>
  <q-form @submit="submitForm">
    <q-input
      v-model="formData.name"
      label="Public Name"
      ref="fieldName"
      outlined
      tabindex="1"
      class="q-mb-md"
      v-if="tab == 'register'"
      lazy-rules
      :rules="[(val) => checker.input(!!val || '', 1000)]"
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
      v-model="formData.email"
      label="Email"
      type="email"
      outlined
      autocomplete
      tabindex="2"
      class="q-mb-md"
      ref="fieldEmail"
      lazy-rules
      :rules="[(val) => checker.input({ value: val, type: 'email' }, 1000)]"
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
      v-model="formData.password"
      label="Password"
      ref="fieldPassword"
      outlined
      autocomplete
      tabindex="3"
      class="q-mb-md"
      :type="passfieldType"
      @focus="passEye = true"
      @blur="passEye = false"
      lazy-rules
      :rules="[
        (val) =>
          checker.input(
            tab == 'register' ? { value: val, type: 'password' } : !!val || '',
            1000
          ),
      ]"
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
          @click="togglePassView()"
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
      v-model="formData.invite"
      label="Invitation Code"
      ref="fieldInviteCode"
      outlined
      tabindex="4"
      class="q-mb-md"
      v-if="tab == 'register'"
      lazy-rules
      :rules="[
        (val) =>
          checker.input(
            (!!val && val === inviteCode) || 'Hello, are we friends?',
            1000
          ),
      ]"
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
import { defineComponent } from "vue";
import { mapActions, mapState } from "vuex";
import { random_word } from "src/boot/axios";
import { customAlert, check } from "src/assets/scripts/functions";

export default defineComponent({
  name: "login-register",

  props: ["tab"],

  data() {
    return {
      $q: useQuasar(),
      checker: check,
      formData: {
        name: "",
        email: "",
        password: "",
        invite: "",
      },
      passEye: false,
      inviteCode: "",
      passfieldType: "password",
      decrypting: { status: false, percentage: 0 },
      interval: null,
    };
  },

  created() {
    if (this.tab == "register") this.generateInviteCode();
  },

  computed: {
    ...mapState("firebase_auth", ["userDetails"]),
  },

  methods: {
    ...mapActions("firebase_auth", ["registerUser", "loginUser"]),

    async submitForm() {
      this.decrypting.status = true;
      if (this.tab == "login") {
        const status = await this.loginUser(this.formData);
        if (!status.success) {
          this.btnLoadingInterval(customAlert("Login failed!", "negative"));
        } else {
          this.btnLoadingInterval(
            customAlert("Decrypting user data...", "ongoing", 500, null, {
              color: "primary",
            })
          );
        }
      } else {
        if (this.inviteCode == this.formData.invite) {
          const status = await this.registerUser(this.formData);
          if (!status.success) {
            this.btnLoadingInterval(
              customAlert("Registration failed!", "warning")
            );
          } else {
            this.btnLoadingInterval();
          }
        } else {
          this.btnLoadingInterval(
            customAlert("You are not invited!", "warning")
          );
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
    btnLoadingInterval(fx) {
      this.interval = setInterval(() => {
        this.decrypting.percentage += Math.floor(Math.random() * 8 + 10);
        if (this.decrypting.percentage >= 100) {
          if (fx) fx();
          this.decrypting.status = false;
          clearInterval(this.interval);
        }
      }, 100);
    },
    togglePassView(timeout = 3000) {
      this.passfieldType =
        this.passfieldType.toLowerCase() == "text" ? "password" : "text";
      if (timeout && timeout > 0)
        setTimeout(() => {
          if (this.passfieldType.toLowerCase() == "text")
            this.passfieldType = "password";
        }, timeout);
    },
  },

  beforeUnmount() {
    if (this.interval) clearInterval(this.interval);
  },
});
</script>
