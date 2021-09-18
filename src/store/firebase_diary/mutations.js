import { reactive } from "vue";

function addUnshiftDiary(state, payload) {
  state.diary.unshift(payload);
}

function addPushDiary(state, payload) {
  state.diary.push(payload);
}

function removeDiary(state, payload) {
  const index = state.diary.findIndex((post) => post.id == payload.id);
  if (index >= 0) state.diary.splice(index, 1);
}

function updateDiary(state, payload) {
  const index = state.diary.findIndex((post) => post.id == payload.id);
  if (index >= 0) Object.assign(state.diary[index], payload);
}

function clearDiary(state) {
  state.diary = reactive([]);
}

export { addUnshiftDiary, addPushDiary, updateDiary, removeDiary, clearDiary };
