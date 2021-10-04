<template>
  <q-page ref="pageChat" class="page-chat flex" style="max-width: 100%">
    <div
      class="col column justify-end q-pa-lg"
      :class="{ invisible: !showChatContents }"
    >
      <q-chat-message
        :key="'message_' + i"
        v-for="(message, i) in groupedMessages"
        :sent="message[0].data.from.toLowerCase() == 'me' ? true : false"
        :bg-color="
          message[0].data.from.toLowerCase() == 'me' ? 'grey-3' : 'secondary'
        "
      >
        <template v-slot:name>
          {{
            message[0].data.from.toLowerCase() == "me"
              ? userDetails.name
              : otherUserDetails.name
          }}
        </template>

        <div
          class="text-body2"
          v-for="(msg, j) in message"
          :key="'message_' + i + '_' + j"
        >
          <div class="text-center" v-if="!decryptedMsg[msg.id]">
            <transition-group appear enter-active-class="animated fadeIn slow">
              <div class="text-center" :key="msg.id">
                <q-btn
                  @click="decryptMsg(msg)"
                  round
                  ripple
                  size="md"
                  color="primary"
                  :icon="
                    msg.data.expiration ? 'auto_delete' : 'enhanced_encryption'
                  "
                  :text-color="
                    msg.data.from.toLowerCase() == 'me' ? 'grey-3' : 'white'
                  "
                />
                <br />
                <span
                  class="text-caption text-italic text-weight-light"
                  v-if="msg.data.expiration"
                >
                  {{ msg.data.expiration / 1000 }} sec
                </span>
              </div>
            </transition-group>
          </div>
          <div v-else>
            <span
              :class="
                msg.data.from.toLowerCase() == 'me'
                  ? 'text-grey-10'
                  : 'text-grey-9'
              "
            >
              <q-intersection
                once
                transition="scale"
                v-html="addLinkHtml(decryptedMsg[msg.id].plain)"
              ></q-intersection>
            </span>
            <div
              class="text-caption"
              :class="
                msg.data.from.toLowerCase() == 'me'
                  ? 'text-grey-6'
                  : 'text-white'
              "
            >
              <span>
                <q-circular-progress
                  reverse
                  :min="0"
                  :max="msg.data.expiration / 1000"
                  :value="clockCountDown[msg.id]"
                  :thickness="1"
                  size="16px"
                  color="primary"
                  track-color="grey-4"
                  v-if="
                    msg.data.from.toLowerCase() != 'me' && msg.data.expiration
                  "
                />
                <span
                  v-if="
                    msg.data.from.toLowerCase() != 'me' && msg.data.expiration
                  "
                  >&nbsp;</span
                >
                <q-tooltip
                  :delay="100"
                  :offset="[10, 15]"
                  self="top middle"
                  anchor="bottom middle"
                >
                  Deletion Countdown
                </q-tooltip>
              </span>
              <span :key="minuteTimer">
                {{ relativeDate(msg.data.timestamp) }}
              </span>
            </div>
          </div>
          <q-menu touch-position context-menu>
            <q-list>
              <q-item
                v-ripple
                clickable
                v-close-popup
                @click="
                  removeMessage({
                    msgid: msg.id,
                    usrid: otherUserId,
                    deleteForEveryone: false,
                  })
                "
              >
                <q-item-section avatar style="min-width: 35px">
                  <q-icon name="delete" />
                </q-item-section>
                <q-item-section>Yourself</q-item-section>
              </q-item>
              <q-separator v-if="msg.data.from.toLowerCase() == 'me'" />
              <q-item
                v-ripple
                clickable
                v-close-popup
                @click="
                  removeMessage({
                    msgid: msg.id,
                    usrid: otherUserId,
                    deleteForEveryone: true,
                  })
                "
                v-if="msg.data.from.toLowerCase() == 'me'"
              >
                <q-item-section avatar style="min-width: 35px">
                  <q-icon name="delete_sweep" />
                </q-item-section>
                <q-item-section>Everyone</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
          <q-tooltip
            :delay="100"
            :offset="[10, 15]"
            self="top middle"
            anchor="bottom middle"
            v-if="!decryptedMsg[msg.id]"
          >
            {{ relativeDate(msg.data.timestamp) }}
          </q-tooltip>
        </div>
      </q-chat-message>
    </div>

    <q-footer elevated class="transparent">
      <q-toolbar class="full-width q-pa-none">
        <q-form class="full-width">
          <q-list>
            <transition
              appear
              enter-active-class="animated bounceInLeft slow"
              leave-active-class="animated bounceOutRight slow"
            >
              <q-item
                class="q-pa-sm"
                style="background-color: rgba(255, 255, 255, 0.5)"
                v-if="expirationEnabled"
              >
                <q-item-section avatar>
                  <div class="text-weight-bold text-primary">
                    <q-icon color="primary" name="auto_delete" size="sm" />
                    {{ newMessage.expiration }} seconds
                    <q-tooltip
                      :delay="100"
                      :offset="[10, 20]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Auto Delete Message
                    </q-tooltip>
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-slider
                    v-model="newMessage.expiration"
                    @change="
                      (val) => {
                        newMessage.expiration = val;
                        if (!$q.platform.is.mobile) $refs.newMessage.focus();
                      }
                    "
                    color="primary"
                    :min="expiration.min"
                    :max="expiration.max"
                  />
                </q-item-section>
                <q-item-section side>
                  <div>
                    <q-btn
                      flat
                      round
                      ripple
                      color="primary"
                      icon="remove_circle_outline"
                      @click="
                        () => {
                          if (newMessage.expiration > expiration.min)
                            newMessage.expiration--;
                          if (!$q.platform.is.mobile) $refs.newMessage.focus();
                        }
                      "
                    >
                      <q-tooltip
                        :delay="100"
                        :offset="[10, 20]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        -1
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      ripple
                      color="primary"
                      icon="add_circle_outline"
                      @click="
                        () => {
                          if (newMessage.expiration < expiration.max)
                            newMessage.expiration++;
                          if (!$q.platform.is.mobile) $refs.newMessage.focus();
                        }
                      "
                    >
                      <q-tooltip
                        :delay="100"
                        :offset="[10, 20]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        +1
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      ripple
                      color="primary"
                      icon="highlight_off"
                      @click="
                        () => {
                          expirationEnabled = !expirationEnabled;
                          if (!$q.platform.is.mobile) $refs.newMessage.focus();
                        }
                      "
                    >
                      <q-tooltip
                        :delay="100"
                        :offset="[10, 20]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        Non-Expiry
                      </q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </transition>
            <q-item class="q-pa-sm bg-primary">
              <q-item-section>
                <q-input
                  dense
                  rounded
                  autogrow
                  outlined
                  tabindex="1"
                  maxlength="1024"
                  bg-color="white"
                  ref="newMessage"
                  v-model="newMessage.text"
                  @keyup="updateFirstChange"
                  @keydown.enter.exact.prevent="sendMessage"
                  :autofocus="
                    $q.platform.is.mobile
                      ? false
                      : isValidChat
                      ? true
                      : !isSelfChat
                  "
                  :disable="isValidChat ? false : !isSelfChat"
                  :label="
                    newMessage.text
                      ? undefined
                      : isValidChat
                      ? 'Message'
                      : !isSelfChat
                      ? otherUserId || isValidChat
                        ? 'Chat Unavailable'
                        : 'Select Someone'
                      : 'Secret Message'
                  "
                >
                  <template v-slot:before>
                    <q-icon
                      size="sm"
                      color="grey-3"
                      :name="expirationEnabled ? 'enhanced_encryption' : 'lock'"
                    />
                  </template>
                  <template v-slot:append>
                    <div>
                      <sub
                        v-if="expirationEnabled"
                        class="text-caption text-weight-thin"
                      >
                        {{ newMessage.expiration }}s
                      </sub>
                      <q-btn
                        round
                        dense
                        flat
                        size="sm"
                        color="primary"
                        icon="auto_delete"
                        ref="expirationBtn"
                        :disable="isValidChat ? false : !isSelfChat"
                        @click="
                          () => {
                            expirationEnabled = !expirationEnabled;
                            if (!$q.platform.is.mobile)
                              $refs.newMessage.focus();
                          }
                        "
                      >
                        <q-tooltip
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[10, 20]"
                          :delay="100"
                        >
                          Auto Delete Message
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                  <template v-slot:after>
                    <q-btn
                      flat
                      round
                      dense
                      icon="send"
                      tabindex="2"
                      type="submit"
                      color="white"
                      @click="sendMessage"
                      :disable="isValidChat ? false : !isSelfChat"
                    />
                  </template>
                </q-input>
              </q-item-section>
            </q-item>
          </q-list>
        </q-form>
      </q-toolbar>
    </q-footer>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { useQuasar } from "quasar";
import { mapState, mapActions, mapGetters } from "vuex";
import { mixinOtherUserDetails, mixinMethods, mixinTimer } from "src/mixins";
import { base64, customAlert, addLinkHtml } from "assets/scripts/functions";
import { myvar } from "boot/firebase";
import { collections } from "src/store/firebase_config";

export default defineComponent({
  name: "Chat App",

  mixins: [mixinOtherUserDetails, mixinMethods, mixinTimer],

  data() {
    return {
      $q: useQuasar(),
      newMessage: {
        from: "me",
        text: null,
        timestamp: Date.now(),
        type: myvar.messages.type.encrypted,
        expiration: 0,
      },
      expiration: {
        min: 3,
        max: 90,
      },
      expirationEnabled: false,
      showChatContents: false,
      myMessages: [],
      decryptedMsg: {},
      firstChat: true,
      clockCountDown: {},
      addLinkHtml: addLinkHtml,
    };
  },

  beforeMount() {
    if (this.otherUserId && this.userDetails.passphrase)
      this.initializeUserMessages();
  },

  mounted() {
    if (
      this.otherUserId &&
      this.userDetails.passphrase &&
      !this.groupedMessages.length
    )
      this.initializeUserMessages();
    this.newMessage.expiration = this.expiration.min;
    //  customAlert(
    //    "Secure Encrypted Messages",
    //    null,
    //    2500,
    //    !this.userDetails.passphrase
    //      ? "center"
    //      : this.$q.screen.lt.sm
    //      ? "top"
    //      : "bottom-left",
    //    {
    //      color: "primary",
    //      textColor: "white",
    //      icon: "lock",
    //    }
    //  );
  },

  computed: {
    ...mapGetters("firebase_chat", ["groupedMessages"]),
    ...mapGetters("firebase_notification", ["notifMessages"]),
    ...mapState("firebase_auth", ["userDetails"]),
    ...mapState("firebase_chat", ["messages"]),

    isValidChat() {
      let result = false;
      if (
        this.otherUserId &&
        this.userDetails.passphrase &&
        this.otherUserDetails &&
        Object.keys(this.otherUserDetails).length
      )
        result = true;
      return result;
    },
  },

  watch: {
    messages: {
      async handler(val) {
        const msgKeys = Object.keys(val);
        if (msgKeys.length) {
          msgKeys.forEach(async (key) => {
            if (this.decryptedMsg[key]) {
              if (this.decryptedMsg[key].encrypted != val[key].text) {
                this.decryptMsg({
                  id: key,
                  data: {
                    from: val[key].from.toLowerCase(),
                    text: val[key].text,
                  },
                  watch: true,
                });
              }
            }
          });
          if (msgKeys.length !== Object.keys(this.decryptedMsg).length) {
            Object.keys(this.decryptedMsg).forEach(async (key) => {
              if (!msgKeys.includes(key)) delete this.decryptedMsg[key];
            });
          }
          if (
            this.$myvar.messages.lastEvent &&
            this.$myvar.messages.lastEvent === "added"
          )
            this.chatScrollToBottom();
        }
      },
      deep: true,
    },
    otherUserId: {
      async handler(val) {
        if (val) {
          this.initializeUserMessages();
        } else {
          this.firebaseStopGettingMessages();
        }
      },
      deep: true,
    },
    expirationEnabled: {
      handler(val) {
        if (!val) this.firstChat = false;
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions("firebase_notification", [
      "deleteNotification",
      "deleteNotificationData",
    ]),
    ...mapActions("firebase_chat", [
      "firebaseGetMessages",
      "firebaseSendMessage",
      "firebaseDeleteMessage",
      "firebaseStopGettingMessages",
    ]),

    async initializeUserMessages() {
      try {
        if (this.userDetails.passphrase && this.otherUserId) {
          await this.firebaseStopGettingMessages();
          this.showChatContents = false;
          this.firebaseGetMessages({
            otherUserId: this.otherUserId,
          });
          this.firstChat = true;
          this.clearMessage();
        }
      } catch (error) {
        console.error("Chat Initialization Error: ", error);
      }
    },
    updateFirstChange() {
      if (this.firstChat && this.newMessage.text) {
        if (!this.expirationEnabled) this.$refs.expirationBtn.click();
      }
    },
    checkIfOnDeletion(msgId) {
      const toDelete = this.$myvar.messages.todelete;
      let result = Object.keys(toDelete).filter((key) => key === msgId);
      return result.length ? true : false;
    },
    async decryptMsg(msg) {
      let result;
      await this.$openpgp_methods
        .decrypt_string({
          privateKeyArmored: base64.decode(this.userDetails.pgp.privateKey),
          publicKeyArmored: base64.decode(
            msg.data.from.toLowerCase() == "me"
              ? this.userDetails.pgp.publicKey
              : this.otherUserDetails.pgp.publicKey
          ),
          passphrase: base64.decode(this.userDetails.passphrase),
          encryptedText: base64.decode(msg.data.text),
        })
        .then((plainMsg) => {
          if (plainMsg.success) {
            this.decryptedMsg[msg.id] = {
              plain: plainMsg.response,
              encrypted: msg.data.text,
            };
            if (
              !msg.watch &&
              msg.data.expiration &&
              msg.data.from.toLowerCase() != "me"
            ) {
              const msgDel = {
                msg: this.decryptedMsg[msg.id].plain,
                msgid: msg.id,
                usrid: this.otherUserId,
                deleteForEveryone: true,
              };
              // Check Notification and Update
              if (
                this.notifMessages[this.otherUserId] &&
                this.notifMessages[this.otherUserId].length
              ) {
                this.deleteNotificationData({
                  notifUser: this.userDetails.userId,
                  notifId: this.otherUserId,
                  notifType: collections.notifications.messages,
                  deleteKey:
                    this.notifMessages[this.otherUserId].length == 1
                      ? true
                      : false,
                  notifDetails: {
                    id: msg.id,
                    timestamp: msg.data.timestamp,
                    type: msg.data.type,
                  },
                });
              }
              // Countdown Animation
              this.clockCountDown[msg.id] = 1;
              let interval = setInterval(() => {
                this.clockCountDown[msg.id] += 1;
                if (this.clockCountDown[msg.id] >= msg.data.expiration / 1000) {
                  clearInterval(interval);
                }
              }, 1000);
              // AutoDelete Schedule
              setTimeout(() => {
                this.$myvar.messages.todelete.push(msgDel);
                if (this.clockCountDown[msg.id])
                  delete this.clockCountDown[msg.id];
              }, msg.data.expiration);
            }
            result = plainMsg.response;
          } else {
            customAlert("Failed to decrypt message", "warning");
          }
        })
        .catch((e) => {
          customAlert("Error decrypting message", "negative");
        });
      return addLinkHtml(result);
    },
    async sendMessage() {
      if (this.newMessage.text) {
        const plainMsg = this.newMessage.text.replace(/^\s+|\s+$/g, "");
        await this.$openpgp_methods
          .encrypt_string({
            publicKeysArmored: [
              base64.decode(this.otherUserDetails.pgp.publicKey),
              base64.decode(this.userDetails.pgp.publicKey),
            ],
            privateKeyArmored: base64.decode(this.userDetails.pgp.privateKey),
            passphrase: base64.decode(this.userDetails.passphrase),
            plainText: plainMsg,
          })
          .then((encryptedMsg) => {
            if (encryptedMsg.success) {
              let message = {
                from: "me",
                text: base64.encode(encryptedMsg.response),
                timestamp: Date.now(),
                type:
                  this.expirationEnabled && this.newMessage.expiration
                    ? myvar.messages.type.encrypted_autodelete
                    : myvar.messages.type.encrypted,
                expiration:
                  this.expirationEnabled && this.newMessage.expiration
                    ? this.newMessage.expiration * 1000
                    : 0,
              };
              this.firebaseSendMessage({
                message: message,
                otherUserId: this.otherUserId,
              });
              this.chatScrollToBottom();
            } else {
              customAlert("Failed to encrypt message", "warning");
            }
          })
          .catch(() => {
            customAlert("Error encrypting message", "negative");
          });
      }
      this.clearMessage();
    },
    async removeMessage(options) {
      await this.firebaseDeleteMessage({
        messageId: options.msgid,
        otherUserId: options.usrid,
        deleteForEveryone: options.deleteForEveryone,
      })
        .then((result) => {
          if (result.success) {
            customAlert(
              "Message has been deleted",
              "positive",
              null,
              this.$q.screen.lt.sm ? "top" : "bottom-left"
            );
          } else {
            customAlert(
              "Failed to delete message",
              "warning",
              null,
              this.$q.screen.lt.sm ? "top" : "bottom-left"
            );
          }
        })
        .catch(() => {
          customAlert(
            "Error deleting message",
            "negative",
            null,
            this.$q.screen.lt.sm ? "top" : "bottom-left"
          );
        });
    },
    clearMessage() {
      this.newMessage = {
        from: "me",
        text: null,
        timestamp: Date.now(),
        type: myvar.messages.type.encrypted,
        expiration: this.newMessage.expiration,
      };
      if (!this.$q.platform.is.mobile && this.$refs.newMessage)
        this.$refs.newMessage.focus();
    },
    chatScrollToBottom() {
      setTimeout(() => {
        if (this.$refs.chatScrollArea) {
          this.$refs.chatScrollArea.setScrollPosition(
            "vertical",
            this.$refs.chatScrollArea.$el.scrollHeight * 2
          );
        } else {
          window.scrollTo(0, this.$refs.pageChat.$el.scrollHeight * 2);
        }
        if (!this.showChatContents) this.showChatContents = true;
      }, 20);
    },
  },

  beforeUnmount() {
    this.firebaseStopGettingMessages();
  },
});
</script>

<style lang="sass">
.page-chat
   z-index: 0
   background-color: $grey-1
   background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%23009688' fill-opacity='0.05' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'%3E%3C/path%3E%3C/svg%3E")

.q-message-text
   white-space: pre-wrap
   margin-bottom: 6px
   box-shadow: 0 1px 3px #0003, 0 1px 1px #00000024, 0 2px 1px -1px #0000001f

.q-message-text:not(last-child):not(fist-child)
   border-radius: 12px

.q-message-text:last-child
   min-height: unset !important

.q-message-text--sent:last-child
   border-radius: 12px 12px 0 12px

.q-message-text--received:last-child
   border-radius: 12px 12px 12px 0
</style>
