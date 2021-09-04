import { reactive } from "vue";

function addMessage(state, payload) {
  state.messages[payload.messageId] = payload.messageDetails;
}

function removeMessage(state, payload) {
  delete state.messages[payload.messageId];
}

function clearMessages(state) {
  state.messages = reactive({});
}

export { addMessage, removeMessage, clearMessages };
