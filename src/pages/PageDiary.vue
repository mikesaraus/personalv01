<template>
  <q-page ref="pageDiary">
    <q-pull-to-refresh @refresh="refresh">
      <transition
        appear
        enter-active-class="animated rubberBand slow"
        leave-active-class="animated fadeOutUp slow"
      >
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
              rounded
              unelevated
              label="post"
              class="q-mb-lg"
              color="primary"
              :disable="!newPostContent"
              @click="dialogTitle = true"
            />
          </div>
        </div>
      </transition>

      <q-separator class="divider" color="grey-2" size="10px" />

      <div v-if="diary.length || preloader" class="paperbg">
        <q-timeline
          color="secondary"
          class="q-pa-lg"
          :layout="timelineLayout"
          style="overflow-wrap: anywhere"
        >
          <transition-group
            appear
            v-if="preloader"
            enter-active-class="animated bounceInUp slow"
            leave-active-class="animated fadeOutBottomRight slow"
          >
            <q-timeline-entry
              v-for="n in 3"
              :key="'skeleton_' + n"
              :side="n % 2 == 0 ? 'right' : 'left'"
              color="secondary"
              icon="far fa-heart"
              style="cursor: pointer"
              v-ripple="{ color: 'grey-9' }"
            >
              <template v-slot:title>
                <q-skeleton type="QChip" />
              </template>
              <q-skeleton type="text" />
            </q-timeline-entry>
          </transition-group>
          <transition-group
            appear
            v-else
            enter-active-class="animated fadeIn slow"
            leave-active-class="animated fadeOutBottomRight slow"
          >
            <q-timeline-entry
              :ref="post.id"
              :key="post.id"
              v-for="(post, i) in diary"
              @dblclick="toogleLike(post)"
              v-ripple="{ color: 'primary' }"
              :side="i % 2 == 0 ? 'right' : 'left'"
              :color="post.liked ? 'primary' : 'secondary'"
              :icon="post.liked ? 'fas fa-heart' : 'far fa-heart'"
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
              <q-intersection once transition="scale">
                <span v-html="addLinkHtml(post.content)"></span>
              </q-intersection>
              <q-menu context-menu @show="$refs[post.id].$el.click()">
                <q-list>
                  <q-item clickable v-close-popup @click="toogleLike(post)">
                    <q-item-section avatar style="min-width: 35px">
                      <q-icon
                        :name="post.liked ? 'fas fa-heart' : 'far fa-heart'"
                      />
                    </q-item-section>
                    <q-item-section>
                      {{ post.liked ? "Liked" : "Like" }}
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="enableEdit(post)">
                    <q-item-section avatar style="min-width: 35px">
                      <q-icon name="mode_edit_outline" />
                    </q-item-section>
                    <q-item-section>Edit</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="deletePost(post)">
                    <q-item-section avatar style="min-width: 35px">
                      <q-icon name="delete_outline" />
                    </q-item-section>
                    <q-item-section>Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-timeline-entry>
          </transition-group>
        </q-timeline>

        <div class="text-center text-grey-6 text-weight-light q-pb-lg">
          <q-icon name="horizontal_rule" />
          End of History
          <q-icon name="horizontal_rule" />
        </div>
      </div>

      <div v-else class="no-history text-center q-mt-xl">
        <q-icon name="timeline" size="100px" color="primary"></q-icon>
        <div class="text-h5 text-primary">No History</div>
      </div>
    </q-pull-to-refresh>

    <q-dialog v-model="dialogEdit">
      <q-card style="width: 700px; max-width: 80vw" class="q-pa-sm">
        <q-card-section class="row items-center">
          <q-avatar icon="edit_note" color="primary" text-color="white" />
          <span class="q-ml-sm text-subtitle1 text-weight-medium"
            >Edit Story</span
          >
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            autofocus
            lazy-rules
            tabindex="1"
            class="new-post"
            ref="editPostTitle"
            v-model="editPostTitle"
            placeholder="Add a Title"
          >
            <template v-slot:prepend>
              <q-avatar size="xl" icon="title" class="primary" />
            </template>
          </q-input>
          <q-input
            lazy-rules
            autogrow
            class="new-post"
            placeholder="What's happening?"
            ref="editPostContent"
            v-model="editPostContent"
            tabindex="2"
          >
            <template v-slot:prepend>
              <q-avatar text-color="primary" size="xl" icon="text_fields" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            type="reset"
            tabindex="4"
            v-close-popup
            label="Cancel"
            color="grey-6"
            ref="formEditsReset"
            @click="resetEditPost"
          />
          <q-btn
            flat
            tabindex="3"
            label="Confirm"
            color="primary"
            @click="editPost"
            ref="formEditSubmit"
            v-close-popup="editStatus.value"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogTitle">
      <q-card style="width: 700px; max-width: 80vw" class="q-pa-sm">
        <q-card-section class="row items-center">
          <q-avatar icon="timeline" color="primary" text-color="white" />
          <span class="q-ml-sm text-subtitle1 text-weight-medium"
            >Story Title</span
          >
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            autofocus
            lazy-rules
            tabindex="1"
            ref="newPostTitle"
            v-model="newPostTitle"
            class="q-py-sm new-post"
            placeholder="Add a Title"
          >
            <template v-slot:prepend>
              <q-avatar size="xl" icon="title" class="primary" />
            </template>
          </q-input>
        </q-card-section>
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
            tabindex="2"
            color="primary"
            label="Confirm"
            @click="addNewPost"
            ref="formDetailsSubmit"
            v-close-popup="postStatus.value"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapState, mapActions } from "vuex";
import { mixinMethods, mixinTimer, mixinPreloader } from "src/mixins";
import { useQuasar } from "quasar";
import { customAlert, addLinkHtml } from "assets/scripts/functions";

export default defineComponent({
  name: "Diary",

  mixins: [mixinMethods, mixinTimer, mixinPreloader],

  data() {
    return {
      $q: useQuasar(),
      newPostContent: "",
      newPostTitle: "",
      dialogTitle: false,
      postStatus: false,
      editStatus: false,
      dialogEdit: false,
      editPostTitle: "",
      editPostContent: "",
      editPostId: "",
      addLinkHtml: addLinkHtml,
    };
  },

  beforeMount() {
    if (this.userDetails.passphrase) this.firebaseGetAllDiary();
  },

  mounted() {
    this.startPreloading(this.diary);
    if (this.userDetails.passphrase && !this.diary.length)
      this.firebaseGetAllDiary();
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
      "firebaseGetAllDiary",
      "firebaseAddDiary",
      "firebaseUpdateDiary",
      "firebaseClearDiary",
      "firebaseDeleteDiary",
      "firebaseStopGettingDiary",
    ]),

    refresh(done) {
      setTimeout(() => {
        this.firebaseGetAllDiary();
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
          this.postStatus = true;
          setTimeout(() => {
            customAlert("Story has been added.", "positive");
          }, 300);
          this.resetNewPost();
        } else {
          setTimeout(() => {
            customAlert("Failed to add story.", "negative");
          }, 300);
        }
      } else {
        setTimeout(() => {
          customAlert("Please add some story.", "warning");
        }, 300);
      }
    },
    resetNewPost() {
      this.newPostTitle = "";
      this.newPostContent = "";
      this.postStatus = false;
    },
    resetEditPost() {
      this.editPostTitle = "";
      this.editPostContent = "";
      this.editPostId = "";
      this.editStatus = false;
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
          this.editStatus = true;
          setTimeout(() => {
            customAlert("Story has been modified.", "positive");
          }, 300);
          this.resetEditPost();
        } else {
          setTimeout(() => {
            customAlert("Failed to edit story.", "negative");
          }, 300);
        }
      } else {
        setTimeout(() => {
          customAlert("Please add some story.", "warning");
        }, 300);
      }
    },
    deletePost(post) {
      this.firebaseDeleteDiary({ id: post.id });
    },
  },

  beforeUnmount() {
    this.firebaseStopGettingDiary();
  },
});
</script>

<style lang="sass">

.paperbg
  background-color: $grey-1
  background-size: 25px 25px
  background-image:  repeating-linear-gradient(0deg, $grey-3, $grey-3 2px, white 1px, white)


.new-post, .new-post
  font-size: 19px
  line-height: 1.4 !important

.divider
  border-top: 1px solid
  border-bottom: 1px solid
  border-color: $grey-4

.q-timeline__content
  white-space: pre-line

.no-history
  opacity: 0.5

.q-textarea .q-field__native, .q-textarea .q-field__prefix, .q-textarea .q-field__suffix
    line-height: 25px
</style>
