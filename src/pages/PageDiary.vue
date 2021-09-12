<template>
  <q-page class="relative-position">
    <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
      <div class="col">
        <q-input
          v-model="newPostContent"
          class="new-post"
          ref="newPostContent"
          placeholder="What's happening?"
          counter
          autogrow
        >
          <template v-slot:before>
            <q-avatar
              color="primary"
              text-color="white"
              size="xl"
              icon="timeline"
            />
          </template>
        </q-input>
      </div>
      <div class="col col-shrink">
        <q-btn
          @click="dialogTitle = true"
          :disable="!newPostContent"
          class="q-mb-lg"
          color="primary"
          label="post"
          rounded
          unelevated
        />
      </div>
    </div>

    <q-separator class="divider" color="grey-2" size="10px" />

    <q-pull-to-refresh @refresh="refresh">
      <q-timeline
        v-if="diary.length"
        class="q-pa-lg"
        color="secondary"
        :layout="timelineLayout"
      >
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-timeline-entry
            v-for="(post, i) in diary"
            :key="post.id"
            :side="i % 2 == 0 ? 'right' : 'left'"
            :icon="post.liked ? 'fas fa-heart' : 'far fa-heart'"
            :color="post.liked ? 'primary' : 'secondary'"
          >
            <template v-slot:title>
              <div>
                {{ post.title }}
              </div>
            </template>
            <template v-slot:subtitle>
              <div :key="minuteTimer">
                {{ relativeDate(post.timestamp) }}
              </div>
            </template>
            <div>
              {{ post.content }}
            </div>
            <q-menu context-menu>
              <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup @click="toogleLike(post)">
                  <q-item-section avatar>
                    <q-icon
                      :name="post.liked ? 'fas fa-heart' : 'far fa-heart'"
                    />
                  </q-item-section>
                  <q-item-section>{{
                    post.liked ? "Liked" : "Like"
                  }}</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="enableEdit(post)">
                  <q-item-section avatar>
                    <q-icon name="mode_edit_outline" />
                  </q-item-section>
                  <q-item-section>Edit</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="deletePost(post)">
                  <q-item-section avatar>
                    <q-icon name="delete_outline" />
                  </q-item-section>
                  <q-item-section>Delete</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-timeline-entry>
        </transition-group>
      </q-timeline>

      <div v-else class="no-history text-center q-mt-xl">
        <q-icon name="timeline" size="100px" color="primary"></q-icon>
        <div class="text-h5 text-primary">No History</div>
      </div>
    </q-pull-to-refresh>

    <q-dialog v-model="dialogEdit">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-avatar icon="edit_note" color="primary" text-color="white" />
          <span class="q-ml-sm text-subtitle1">Edit Story</span>
        </q-card-section>

        <div class="q-px-lg">
          <q-input
            autofocus
            lazy-rules
            class="q-py-sm new-post"
            placeholder="Add a Title"
            ref="editPostTitle"
            v-model="editPostTitle"
            tabindex="1"
          >
            <template v-slot:prepend>
              <q-avatar text-color="primary" size="xl" icon="title" />
            </template>
          </q-input>
          <q-input
            lazy-rules
            autogrow
            class="q-py-sm new-post"
            placeholder="What's happening?"
            ref="editPostContent"
            v-model="editPostContent"
            tabindex="2"
          >
            <template v-slot:prepend>
              <q-avatar text-color="primary" size="xl" icon="text_fields" />
            </template>
          </q-input>
        </div>
        <q-card-actions align="right">
          <q-btn
            flat
            ref="formEditsReset"
            label="Cancel"
            type="reset"
            color="grey-6"
            v-close-popup
            tabindex="4"
            @click="resetEditPost"
          />
          <q-btn
            flat
            ref="formEditSubmit"
            label="Confirm"
            color="primary"
            v-close-popup="editStatus.value"
            tabindex="3"
            @click="editPost"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogTitle">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-avatar icon="timeline" color="primary" text-color="white" />
          <span class="q-ml-sm text-subtitle1">Story Title</span>
        </q-card-section>

        <div class="q-px-lg">
          <q-input
            autofocus
            lazy-rules
            class="q-py-sm new-post"
            placeholder="Add a Title"
            ref="newPostTitle"
            v-model="newPostTitle"
            tabindex="1"
          />
        </div>
        <q-card-actions align="right">
          <q-btn
            flat
            ref="formDetailsReset"
            label="Cancel"
            type="reset"
            color="grey-6"
            v-close-popup
            tabindex="3"
            @click="resetNewPost"
          />
          <q-btn
            flat
            ref="formDetailsSubmit"
            label="Confirm"
            color="primary"
            v-close-popup="postStatus.value"
            tabindex="2"
            @click="addNewPost"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { mapState, mapActions } from "vuex";
import { mixinMethods, mixinTimer } from "src/mixins";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "Diary",

  mixins: [mixinMethods, mixinTimer],

  data() {
    return {
      $q: useQuasar(),
      newPostContent: ref(""),
      newPostTitle: ref(""),
      dialogTitle: ref(false),
      postStatus: ref(false),
      editStatus: ref(false),
      dialogEdit: ref(false),
      editPostTitle: ref(""),
      editPostContent: ref(""),
      editPostId: ref(""),
    };
  },

  created() {
    if (!Object.keys(this.userDetails).length) this.$router.push("/");
  },

  computed: {
    ...mapState("firebase_auth", ["userDetails"]),
    ...mapState("firebase_diary", ["diary"]),

    timelineLayout() {
      return this.$q.screen.lt.sm
        ? "dense"
        : this.$q.screen.lt.md
        ? "comfortable"
        : "loose";
    },
  },

  methods: {
    ...mapActions("firebase_diary", [
      "firebaseAddDiary",
      "firebaseUpdateDiary",
      "firebaseClearDiary",
      "firebaseDeleteDiary",
      "firebaseStopGettingDiary",
    ]),

    refresh(done) {
      setTimeout(() => {
        done();
      }, 1000);
    },
    async addNewPost() {
      if (this.newPostTitle && this.newPostContent) {
        let post = {
          timestamp: Date.now(),
          liked: false,
          title: this.newPostTitle,
          content: this.newPostContent,
        };
        let status = await this.firebaseAddDiary(post);
        if (status.success) {
          this.postStatus = ref(true);
          setTimeout(() => {
            this.customAlert("Story has been added.", "positive");
          }, 300);
          this.resetNewPost();
        } else {
          setTimeout(() => {
            this.customAlert("Failed to add story.", "negative");
          }, 300);
        }
      } else {
        setTimeout(() => {
          this.customAlert("Please add some story.", "warning");
        }, 300);
      }
    },
    resetNewPost() {
      this.newPostTitle = ref("");
      this.newPostContent = ref("");
      this.postStatus = ref(false);
    },
    resetEditPost() {
      this.editPostTitle = ref("");
      this.editPostContent = ref("");
      this.editPostId = ref("");
      this.editStatus = ref(false);
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
    toogleLike(post) {
      this.firebaseUpdateDiary({
        id: post.id,
        updates: {
          liked: !post.liked,
        },
      });
    },
    enableEdit(post) {
      this.dialogEdit = true;
      this.editPostTitle = post.title;
      this.editPostContent = post.content;
      this.editPostId = post.id;
    },
    async editPost() {
      if (this.editPostId && this.editPostTitle && this.editPostContent) {
        let status = await this.firebaseUpdateDiary({
          id: this.editPostId,
          updates: {
            title: this.editPostTitle,
            content: this.editPostContent,
          },
        });
        if (status.success) {
          this.editStatus = ref(true);
          setTimeout(() => {
            this.customAlert("Story has been modified.", "positive");
          }, 300);
          this.resetEditPost();
        } else {
          setTimeout(() => {
            this.customAlert("Failed to edit story.", "negative");
          }, 300);
        }
      } else {
        setTimeout(() => {
          this.customAlert("Please add some story.", "warning");
        }, 300);
      }
    },
    deletePost(post) {
      this.firebaseDeleteDiary(post);
    },
  },
});
</script>

<style lang="sass">
.new-post, .new-post
    font-size: 19px
    line-height: 1.4 !important

.divider
  border-top: 1px solid
  border-bottom: 1px solid
  border-color: $grey-4

.q-timeline__content div
  white-space: pre-line

.no-history
  opacity: 0.5
</style>
